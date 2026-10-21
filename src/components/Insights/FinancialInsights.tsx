import React from 'react';
import { 
  Lightbulb, 
  AlertTriangle, 
  CheckCircle2, 
  Receipt, 
  Zap, 
  Award,
  Sparkles
} from 'lucide-react';
import { BudgetHealthReport, Category, Transaction } from '../../types';
import { calculateFinancialHealth } from '../../utils/insights';
import { formatCurrency } from '../../utils/formatters';

interface FinancialInsightsProps {
  transactions: Transaction[];
  categories: Category[];
}

export const FinancialInsights: React.FC<FinancialInsightsProps> = ({
  transactions,
  categories
}) => {
  const report: BudgetHealthReport = calculateFinancialHealth(transactions, categories);

  let healthScore = 70;
  if (report.savingsRate >= 20) healthScore += 15;
  else if (report.savingsRate > 0) healthScore += 5;
  else healthScore -= 20;

  const overBudgetCnt = report.budgetAlerts.filter(b => b.isOver).length;
  healthScore -= (overBudgetCnt * 8);

  if (report.totalExpense > 0 && (report.totalFees / report.totalExpense) < 0.015) {
    healthScore += 10;
  }
  healthScore = Math.max(10, Math.min(100, healthScore));

  const getScoreColor = (score: number) => {
    if (score >= 80) return { text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'Excellent' };
    if (score >= 60) return { text: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-200', label: 'Good' };
    if (score >= 40) return { text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', label: 'Fair' };
    return { text: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', label: 'Needs Attention' };
  };

  const scoreInfo = getScoreColor(healthScore);

  return (
    <div className="space-y-6">
      {/* Top Banner / Health Score */}
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

          {/* Health Score Pill */}
          <div className={`flex items-center space-x-4 p-4 rounded-3xl border ${scoreInfo.border} ${scoreInfo.bg} flex-shrink-0`}>
            <div className="w-14 h-14 rounded-full bg-white border-2 border-pink-200 flex items-center justify-center shadow-sm">
              <span className={`text-xl font-black ${scoreInfo.text}`}>{healthScore}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Score</span>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className={`text-sm font-extrabold ${scoreInfo.text}`}>{scoreInfo.label}</span>
                <Award className={`w-4 h-4 ${scoreInfo.text}`} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 50/30/20 Rule Framework Breakdown */}
      <div className="bg-white border border-pink-100 rounded-3xl p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-black text-slate-900">The 50/30/20 Spending Balance</h3>
          <p className="text-xs text-slate-400">
            A healthy personal budget aims for 50% on essentials, 30% on lifestyle wants, and 20% into savings.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {/* Needs */}
          <div className="p-4 rounded-2xl bg-pink-50/40 border border-pink-100 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">1. Essential Needs</span>
              <span className="text-[10px] font-bold text-slate-400">Target ≤ 50%</span>
            </div>
            <p className="text-xl font-black text-slate-900">
              {formatCurrency(
                report.topExpenseCategories
                  .filter(c => ['cat_groceries', 'cat_utilities', 'cat_transport', 'cat_health', 'cat_family'].includes(c.category.id))
                  .reduce((sum, c) => sum + c.amount, 0)
              )}
            </p>
            <p className="text-[11px] text-slate-500">
              Groceries, power/water, transport, health & family.
            </p>
          </div>

          {/* Wants */}
          <div className="p-4 rounded-2xl bg-pink-50/40 border border-pink-100 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-pink-700">2. Lifestyle Wants</span>
              <span className="text-[10px] font-bold text-slate-400">Target ≤ 30%</span>
            </div>
            <p className="text-xl font-black text-pink-600">
              {formatCurrency(
                report.topExpenseCategories
                  .filter(c => ['cat_dining', 'cat_entertainment', 'cat_shopping', 'cat_airtime'].includes(c.category.id))
                  .reduce((sum, c) => sum + c.amount, 0)
              )}
            </p>
            <p className="text-[11px] text-slate-500">
              Dining & coffee, shopping, leisure, extra airtime.
            </p>
          </div>

          {/* Savings */}
          <div className="p-4 rounded-2xl bg-pink-50/40 border border-pink-100 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-700">3. Net Savings</span>
              <span className="text-[10px] font-bold text-slate-400">Target ≥ 20%</span>
            </div>
            <p className={`text-xl font-black ${report.netSavings >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {formatCurrency(report.netSavings)}
            </p>
            <p className="text-[11px] text-slate-500">
              {report.savingsRate}% of recorded income saved.
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
