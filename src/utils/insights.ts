import { Transaction, Category, BudgetHealthReport } from '../types';

export function calculateFinancialHealth(
  transactions: Transaction[],
  categories: Category[],
  currentMonthStr?: string, // e.g. "2026-10"
  baselineBudget: number = 0
): BudgetHealthReport {
  const selectedMonth = currentMonthStr || new Date().toISOString().slice(0, 7);

  // Filter transactions for the selected month (or all if empty)
  const monthTransactions = transactions.filter(t => t.date.startsWith(selectedMonth));
  const activeTx = monthTransactions.length > 0 ? monthTransactions : transactions;

  let totalIncome = 0;
  let totalExpense = 0;
  let totalFees = 0;
  const categorySpendMap = new Map<string, number>();

  for (const t of activeTx) {
    if (t.type === 'income') {
      totalIncome += t.amount;
    } else if (t.type === 'expense' || t.type === 'transfer') {
      totalExpense += t.amount;
      const current = categorySpendMap.get(t.categoryId) || 0;
      categorySpendMap.set(t.categoryId, current + t.amount);
    }
    if (t.fee && t.fee > 0) {
      totalFees += t.fee;
      // Also track fees under cat_fees if not already
    }
  }

  // If no explicit income is recorded, use the user's active budget/salary as the baseline funds
  const effectiveIncome = totalIncome > 0 ? totalIncome : (baselineBudget > 0 ? baselineBudget : 0);
  const netSavings = effectiveIncome - totalExpense;
  const savingsRate = effectiveIncome > 0 ? Math.max(0, Math.round((netSavings / effectiveIncome) * 100)) : 0;

  // Category breakdown
  const categoryMap = new Map(categories.map(c => [c.id, c]));
  const topExpenseCategories = Array.from(categorySpendMap.entries())
    .map(([catId, amount]) => {
      const category = categoryMap.get(catId) || {
        id: catId,
        name: 'Other',
        color: '#94a3b8',
        icon: 'HelpCircle',
        type: 'expense' as const
      };
      const percentage = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;
      return { category, amount, percentage };
    })
    .sort((a, b) => b.amount - a.amount);

  // Budget Alerts
  const budgetAlerts = categories
    .filter(c => c.type === 'expense' && c.budgetMonthly && c.budgetMonthly > 0)
    .map(c => {
      const spent = categorySpendMap.get(c.id) || 0;
      const budget = c.budgetMonthly!;
      const percentage = Math.round((spent / budget) * 100);
      return {
        category: c,
        spent,
        budget,
        percentage,
        isOver: spent > budget
      };
    })
    .sort((a, b) => b.percentage - a.percentage);

  // Insights Engine
  const insights: BudgetHealthReport['insights'] = [];

  // 1. Savings Rate Analysis
  if (totalIncome > 0) {
    if (savingsRate >= 20) {
      insights.push({
        type: 'positive',
        title: `Strong Savings Rate: ${savingsRate}%`,
        description: `You are saving Ksh ${netSavings.toLocaleString()} this period, beating the recommended 20% savings rule.`,
        actionable: 'Consider locking part of this surplus into an interest-bearing MMF or fixed deposit.'
      });
    } else if (savingsRate > 0) {
      insights.push({
        type: 'warning',
        title: `Modest Savings Rate: ${savingsRate}%`,
        description: `You are saving Ksh ${netSavings.toLocaleString()}, but below the ideal 20% benchmark.`,
        actionable: 'Aim to reduce dining or non-essential shopping to boost your emergency reserve.'
      });
    } else {
      insights.push({
        type: 'warning',
        title: 'Negative Cash Flow Alert',
        description: `Your spending exceeds your recorded income by Ksh ${Math.abs(netSavings).toLocaleString()}.`,
        actionable: 'Audit your largest discretionary expenses below to prevent dipping into reserves or overdraft.'
      });
    }
  }

  // 2. M-Pesa Transaction Fee Audit
  if (totalFees > 0) {
    const feeTip = totalFees > 500
      ? 'Use Buy Goods (Till Number) instead of Send Money whenever possible, as Till payments incur 0 transaction fees.'
      : 'Try grouping small withdrawals into single larger transactions to save on tiered M-Pesa tariff brackets.';

    insights.push({
      type: totalFees > 500 ? 'warning' : 'tip',
      title: `M-Pesa Fees Paid: Ksh ${totalFees.toLocaleString()}`,
      description: `You spent Ksh ${totalFees.toLocaleString()} on transaction costs and tariffs.`,
      actionable: feeTip
    });
  }

  // 3. Needs vs Wants Analysis (50/30/20)
  const needsIds = new Set(['cat_groceries', 'cat_utilities', 'cat_transport', 'cat_health', 'cat_family']);
  const wantsIds = new Set(['cat_dining', 'cat_entertainment', 'cat_shopping', 'cat_hair', 'cat_airtime', 'cat_general']);

  let needsSpend = 0;
  let wantsSpend = 0;

  for (const [catId, amount] of categorySpendMap.entries()) {
    if (needsIds.has(catId)) needsSpend += amount;
    if (wantsIds.has(catId)) wantsSpend += amount;
  }

  if (totalExpense > 0) {
    const wantsPct = Math.round((wantsSpend / totalExpense) * 100);
    if (wantsPct > 35) {
      insights.push({
        type: 'warning',
        title: `Discretionary Spending is High (${wantsPct}%)`,
        description: `Wants (dining, shopping, leisure) take up ${wantsPct}% of your total spending (ideal is under 30%).`,
        actionable: 'Setting a strict weekly eating-out cap could immediately free up extra cash.'
      });
    }
  }

  // 4. Budget Overrun Warnings
  const overBudgetCats = budgetAlerts.filter(b => b.isOver);
  if (overBudgetCats.length > 0) {
    const catNames = overBudgetCats.map(b => b.category.name).join(', ');
    insights.push({
      type: 'warning',
      title: `${overBudgetCats.length} Categories Over Budget`,
      description: `You have exceeded your monthly allocated limit in: ${catNames}.`,
      actionable: 'Review these transactions or adjust your budget limits if prices have increased.'
    });
  }

  // 5. Small Frequent Expense Audit ("Latte Factor")
  const smallTx = activeTx.filter(t => t.type === 'expense' && t.amount <= 300);
  if (smallTx.length >= 5) {
    const smallTotal = smallTx.reduce((sum, t) => sum + t.amount, 0);
    insights.push({
      type: 'tip',
      title: `Micro-Spend Audit: ${smallTx.length} Transactions`,
      description: `Small payments under Ksh 300 (airtime, quick snacks, small sodas) added up to Ksh ${smallTotal.toLocaleString()}.`,
      actionable: 'Buy weekly bundles or bulk snacks in advance to cut down on repeated daily micro-charges.'
    });
  }

  return {
    totalIncome: effectiveIncome,
    totalExpense,
    totalFees,
    netSavings,
    savingsRate,
    topExpenseCategories,
    budgetAlerts,
    insights
  };
}
