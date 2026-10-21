import React from 'react';
import { Transaction } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { BarChart3 } from 'lucide-react';

interface CashflowChartProps {
  transactions: Transaction[];
}

export const CashflowChart: React.FC<CashflowChartProps> = ({ transactions }) => {
  const daysMap = new Map<string, { income: number; expense: number }>();
  const sortedTx = [...transactions].sort((a, b) => a.date.localeCompare(b.date));
  
  for (const t of sortedTx) {
    if (!daysMap.has(t.date)) {
      daysMap.set(t.date, { income: 0, expense: 0 });
    }
    const entry = daysMap.get(t.date)!;
    if (t.type === 'income') {
      entry.income += t.amount;
    } else {
      entry.expense += t.amount;
    }
  }

  const recentDays = Array.from(daysMap.entries()).slice(-10);

  if (recentDays.length === 0) {
    return (
      <div className="bg-white border border-pink-100 rounded-3xl p-6 flex flex-col items-center justify-center min-h-[320px] text-center shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-400 mb-3">
          <BarChart3 className="w-7 h-7" />
        </div>
        <h4 className="text-base font-extrabold text-slate-800">No Cash Flow Data Yet</h4>
        <p className="text-xs text-slate-400 max-w-xs mt-1.5 leading-relaxed">
          Daily income and spending will be charted here as transactions are added.
        </p>
      </div>
    );
  }

  const maxVal = Math.max(
    ...recentDays.map(([, v]) => Math.max(v.income, v.expense)),
    1000
  );

  return (
    <div className="bg-white border border-pink-100 rounded-3xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-black text-slate-900">Daily Cash Flow</h3>
          <p className="text-xs text-slate-400">Income vs. spending by day</p>
        </div>
        <div className="flex items-center space-x-3 text-xs font-bold">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-slate-600">Income</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500"></span>
            <span className="text-slate-600">Spending</span>
          </div>
        </div>
      </div>

      {/* Bar Chart Container */}
      <div className="h-48 flex items-end justify-between gap-2 sm:gap-4 pt-4 border-b border-pink-100">
        {recentDays.map(([date, val]) => {
          const incomeHeight = Math.min(100, Math.round((val.income / maxVal) * 100));
          const expenseHeight = Math.min(100, Math.round((val.expense / maxVal) * 100));
          
          const parts = date.split('-');
          const label = parts.length === 3 ? `${parseInt(parts[2], 10)}/${parseInt(parts[1], 10)}` : date;

          return (
            <div key={date} className="flex-1 flex flex-col items-center h-full justify-end group relative">
              {/* Tooltip */}
              <div className="absolute -top-12 z-20 hidden group-hover:flex flex-col items-center bg-slate-900 text-white text-[10px] py-1 px-2 rounded-xl shadow-xl whitespace-nowrap pointer-events-none">
                <span className="font-bold text-slate-300">{date}</span>
                {val.income > 0 && <span className="text-emerald-400">+{formatCurrency(val.income)}</span>}
                {val.expense > 0 && <span className="text-pink-300">-{formatCurrency(val.expense)}</span>}
              </div>

              {/* Bars Pair */}
              <div className="w-full flex items-end justify-center gap-1 h-full pb-1">
                {/* Income Bar */}
                <div
                  className="w-full max-w-[12px] bg-emerald-500 hover:bg-emerald-400 rounded-t-lg transition-all duration-300"
                  style={{ height: `${Math.max(val.income > 0 ? 6 : 0, incomeHeight)}%` }}
                />
                {/* Expense Bar */}
                <div
                  className="w-full max-w-[12px] bg-pink-500 hover:bg-pink-400 rounded-t-lg transition-all duration-300"
                  style={{ height: `${Math.max(val.expense > 0 ? 6 : 0, expenseHeight)}%` }}
                />
              </div>

              {/* Day Label */}
              <span className="text-[10px] text-slate-400 font-semibold mt-2 group-hover:text-pink-600 transition">
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
