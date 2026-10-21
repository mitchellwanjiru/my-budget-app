import React from 'react';
import { TrendingUp, TrendingDown, PiggyBank, Receipt } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface StatCardsProps {
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  savingsRate: number;
  totalFees: number;
}

export const StatCards: React.FC<StatCardsProps> = ({
  totalIncome,
  totalExpense,
  netSavings,
  savingsRate,
  totalFees
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Income */}
      <div className="bg-white border border-pink-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Income</span>
          <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">{formatCurrency(totalIncome)}</h3>
          <p className="text-xs text-slate-400 mt-1 font-medium">Inflows recorded</p>
        </div>
      </div>

      {/* Total Expenses */}
      <div className="bg-white border border-pink-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Spending</span>
          <div className="p-2.5 rounded-2xl bg-pink-50 text-pink-600">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-black text-pink-600 tracking-tight">{formatCurrency(totalExpense)}</h3>
          <p className="text-xs text-slate-400 mt-1 font-medium">Outgoings & payments</p>
        </div>
      </div>

      {/* Net Savings & Savings Rate */}
      <div className="bg-white border border-pink-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Savings Rate</span>
          <div className="p-2.5 rounded-2xl bg-rose-50 text-rose-600">
            <PiggyBank className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline justify-between">
            <h3 className={`text-2xl font-black tracking-tight ${netSavings >= 0 ? 'text-slate-900' : 'text-pink-600'}`}>
              {formatCurrency(netSavings)}
            </h3>
            <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
              savingsRate >= 20 ? 'bg-emerald-100 text-emerald-700' : savingsRate > 0 ? 'bg-pink-100 text-pink-700' : 'bg-slate-100 text-slate-600'
            }`}>
              {savingsRate}%
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            {savingsRate >= 20 ? 'Target achieved (≥20%)' : 'Aim for 20% savings'}
          </p>
        </div>
      </div>

      {/* M-Pesa Charges */}
      <div className="bg-white border border-pink-100 rounded-3xl p-5 shadow-sm hover:shadow-md transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">M-Pesa Fees Paid</span>
          <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600">
            <Receipt className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">{formatCurrency(totalFees)}</h3>
          <p className="text-xs text-amber-600 mt-1 font-semibold">
            Till (Buy Goods) has 0 fees!
          </p>
        </div>
      </div>
    </div>
  );
};
