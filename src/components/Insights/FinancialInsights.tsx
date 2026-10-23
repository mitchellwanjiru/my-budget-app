import React from 'react';
import { 
  Lightbulb, 
  AlertTriangle, 
  CheckCircle2, 
  Receipt, 
  Zap, 
  Sparkles
} from 'lucide-react';
import { BudgetHealthReport, Category, Transaction } from '../../types';
import { calculateFinancialHealth } from '../../utils/insights';
import { formatCurrency } from '../../utils/formatters';

interface FinancialInsightsProps {
  transactions: Transaction[];
  categories: Category[];
  overallBudget?: number;
}

export const FinancialInsights: React.FC<FinancialInsightsProps> = ({
  transactions,
  categories,
  overallBudget = 0
}) => {
  const categoryBudgetSum = categories
    .filter(c => c.type === 'expense')
    .reduce((sum, c) => sum + (c.budgetMonthly || 0), 0);
  const activeBudget = overallBudget > 0 ? overallBudget : categoryBudgetSum;

  const report: BudgetHealthReport = calculateFinancialHealth(transactions, categories, undefined, activeBudget);

  const needsSpend = report.topExpenseCategories
    .filter(c => ['cat_groceries', 'cat_utilities', 'cat_transport', 'cat_health', 'cat_family'].includes(c.category.id))
    .reduce((sum, c) => sum + c.amount, 0);

  const wantsSpend = report.topExpenseCategories
    .filter(c => ['cat_dining', 'cat_entertainment', 'cat_shopping', 'cat_hair', 'cat_airtime', 'cat_general'].includes(c.category.id))
    .reduce((sum, c) => sum + c.amount, 0);

  const targetNeeds = activeBudget > 0 ? Math.round(activeBudget * 0.5) : 0;
  const targetWants = activeBudget > 0 ? Math.round(activeBudget * 0.3) : 0;
  const targetSavings = activeBudget > 0 ? Math.round(activeBudget * 0.2) : 0;

  const needsPct = targetNeeds > 0 ? Math.round((needsSpend / targetNeeds) * 100) : 0;
  const wantsPct = targetWants > 0 ? Math.round((wantsSpend / targetWants) * 100) : 0;
  const savingsPct = targetSavings > 0 ? Math.round((Math.max(0, report.netSavings) / targetSavings) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-pink-100 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-2xl bg-pink-100 text-pink-600">
                <Sparkles className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-black text-slate-900">Spending & Habit Insights</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-xl leading-relaxed">
              Automated financial feedback based on your spending, savings discipline, and M-Pesa transaction costs.
            </p>
          </div>
        </div>
      </div>

      {/* 50/30/20 Rule Framework Breakdown */}
      <div className="bg-white border border-pink-100 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-black text-slate-900">The 50/30/20 Spending Balance</h3>
            <p className="text-xs text-slate-400">
              {activeBudget > 0
                ? `Calculated from your active monthly budget of ${formatCurrency(activeBudget)}`
                : 'A healthy budget aims for 50% on essentials, 30% on lifestyle wants, and 20% into savings.'}
            </p>
          </div>
          {activeBudget > 0 && (
            <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-pink-50 text-pink-700 border border-pink-200 self-start sm:self-auto">
              Budget: {formatCurrency(activeBudget)}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {/* Needs */}
          <div className="p-4 rounded-2xl bg-pink-50/40 border border-pink-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">1. Essential Needs</span>
              <span className="text-[10px] font-bold text-slate-400">
                {targetNeeds > 0 ? `Target: ≤ ${formatCurrency(targetNeeds)} (50%)` : 'Target ≤ 50%'}
              </span>
            </div>
            <p className="text-xl font-black text-slate-900">
              {formatCurrency(needsSpend)}
            </p>
            {targetNeeds > 0 && (
              <div className="space-y-1">
                <div className="w-full h-1.5 rounded-full bg-pink-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      needsSpend > targetNeeds ? 'bg-rose-500' : 'bg-pink-500'
                    }`}
                    style={{ width: `${Math.min(100, needsPct)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-bold">
                  <span className={needsSpend > targetNeeds ? 'text-rose-600' : 'text-slate-500'}>
                    {needsSpend > targetNeeds ? `Over by ${formatCurrency(needsSpend - targetNeeds)}` : `${formatCurrency(targetNeeds - needsSpend)} remaining`}
                  </span>
                  <span className="text-slate-400">{needsPct}%</span>
                </div>
              </div>
            )}
            <p className="text-[11px] text-slate-500 pt-0.5">
              Groceries, power/water, transport, health & family.
            </p>
          </div>

          {/* Wants */}
          <div className="p-4 rounded-2xl bg-pink-50/40 border border-pink-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-pink-700">2. Lifestyle Wants</span>
              <span className="text-[10px] font-bold text-slate-400">
                {targetWants > 0 ? `Target: ≤ ${formatCurrency(targetWants)} (30%)` : 'Target ≤ 30%'}
              </span>
            </div>
            <p className="text-xl font-black text-pink-600">
              {formatCurrency(wantsSpend)}
            </p>
            {targetWants > 0 && (
              <div className="space-y-1">
                <div className="w-full h-1.5 rounded-full bg-pink-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      wantsSpend > targetWants ? 'bg-rose-500' : 'bg-pink-500'
                    }`}
                    style={{ width: `${Math.min(100, wantsPct)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-bold">
                  <span className={wantsSpend > targetWants ? 'text-rose-600' : 'text-pink-600'}>
                    {wantsSpend > targetWants ? `Over by ${formatCurrency(wantsSpend - targetWants)}` : `${formatCurrency(targetWants - wantsSpend)} remaining`}
                  </span>
                  <span className="text-slate-400">{wantsPct}%</span>
                </div>
              </div>
            )}
            <p className="text-[11px] text-slate-500 pt-0.5">
              Dining, shopping, hair & beauty, leisure, airtime.
            </p>
          </div>

          {/* Savings */}
          <div className="p-4 rounded-2xl bg-pink-50/40 border border-pink-100 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-700">3. Net Savings</span>
              <span className="text-[10px] font-bold text-slate-400">
                {targetSavings > 0 ? `Target: ≥ ${formatCurrency(targetSavings)} (20%)` : 'Target ≥ 20%'}
              </span>
            </div>
            <p className={`text-xl font-black ${report.netSavings >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {formatCurrency(report.netSavings)}
            </p>
            {targetSavings > 0 && (
              <div className="space-y-1">
                <div className="w-full h-1.5 rounded-full bg-pink-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, savingsPct)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-bold">
                  <span className={report.netSavings >= targetSavings ? 'text-emerald-600' : 'text-slate-500'}>
                    {report.netSavings >= targetSavings ? 'Target Achieved! 🌟' : `${formatCurrency(targetSavings - Math.max(0, report.netSavings))} to target`}
                  </span>
                  <span className="text-slate-400">{savingsPct}%</span>
                </div>
              </div>
            )}
            <p className="text-[11px] text-slate-500 pt-0.5">
              {report.savingsRate}% of recorded budget/income saved.
            </p>
          </div>
        </div>
      </div>

      {/* Actionable Recommendations List */}
      <div className="bg-white border border-pink-100 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-pink-100">
          <div>
            <h3 className="text-base font-black text-slate-900">Where You Can Improve</h3>
            <p className="text-xs text-slate-400">Actionable advice based on your current spending trends</p>
          </div>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700">
            {report.insights.length} Tips
          </span>
        </div>

        {report.insights.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs font-medium">
            Record more transactions to unlock customized financial recommendations.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {report.insights.map((insight, idx) => {
              const isPositive = insight.type === 'positive';
              const isWarning = insight.type === 'warning';

              const icon = isPositive ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              ) : isWarning ? (
                <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
              ) : (
                <Lightbulb className="w-5 h-5 text-pink-500 flex-shrink-0" />
              );

              const cardBorder = isPositive
                ? 'border-emerald-100 bg-emerald-50/40'
                : isWarning
                ? 'border-amber-100 bg-amber-50/40'
                : 'border-pink-100 bg-pink-50/40';

              return (
                <div key={idx} className={`p-4 rounded-2xl border ${cardBorder} space-y-2`}>
                  <div className="flex items-start space-x-3">
                    {icon}
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{insight.title}</h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {insight.description}
                      </p>
                    </div>
                  </div>

                  {insight.actionable && (
                    <div className="pt-2 border-t border-pink-200/50 mt-2 flex items-start space-x-1.5 text-xs font-medium text-slate-700">
                      <Zap className="w-3.5 h-3.5 text-pink-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Recommendation:</strong> {insight.actionable}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* M-Pesa Fee Efficiency Guide */}
      <div className="bg-white border border-pink-100 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">M-Pesa Fee Saving Tips</h3>
            <p className="text-xs text-slate-400">Save money on routine mobile money transactions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-pink-50/40 border border-pink-100 space-y-1">
            <span className="font-bold text-pink-700">Buy Goods (Till) = Ksh 0 Fee</span>
            <p className="text-slate-500">
              Paying via Till at supermarkets, pharmacies, and restaurants is free for buyers with zero transaction tariffs.
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-pink-50/40 border border-pink-100 space-y-1">
            <span className="font-bold text-slate-800">Combine Small Withdrawals</span>
            <p className="text-slate-500">
              Multiple small agent withdrawals cost substantially more due to tiered brackets than one consolidated withdrawal.
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-pink-50/40 border border-pink-100 space-y-1">
            <span className="font-bold text-slate-800">Bank App Integrations</span>
            <p className="text-slate-500">
              Check if your bank offers free mobile wallet top-ups before depositing physical cash at an agent.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
