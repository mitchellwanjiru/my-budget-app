import React from 'react';
import { Transaction, Category } from '../../types';
import { formatCurrency, formatRelativeDate } from '../../utils/formatters';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface RecentTransactionsProps {
  transactions: Transaction[];
  categories: Category[];
  onViewAll: () => void;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  transactions,
  categories,
  onViewAll,
}) => {
  const categoryMap = new Map(categories.map(c => [c.id, c]));
  const recent = transactions.slice(0, 6);

  return (
    <div className="bg-white border border-pink-100 rounded-3xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-black text-slate-900">Recent Spending</h3>
          <p className="text-xs text-slate-400">Latest recorded transactions</p>
        </div>
        <button
          onClick={onViewAll}
          className="text-xs font-bold text-pink-600 hover:text-pink-700 transition"
        >
          View All &rarr;
        </button>
      </div>

      {recent.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-xs font-medium">
          No transactions yet. Copy an M-Pesa SMS or add a transaction to get started.
        </div>
      ) : (
        <div className="divide-y divide-pink-50">
          {recent.map((tx) => {
            const cat = categoryMap.get(tx.categoryId);
            const isIncome = tx.type === 'income';

            return (
              <div key={tx.id} className="py-3.5 flex items-center justify-between group">
                <div className="flex items-center space-x-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      isIncome
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-pink-50 text-pink-500'
                    }`}
                  >
                    {isIncome ? (
                      <ArrowDownLeft className="w-5 h-5" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-slate-800 truncate max-w-[180px] sm:max-w-xs">
                      {tx.party || 'Transaction'}
                    </p>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                      <span>{formatRelativeDate(tx.date)}</span>
                      {tx.time && <span>• {tx.time}</span>}
                      {cat && (
                        <span
                          className="px-2 py-0.5 rounded-full font-bold text-[10px]"
                          style={{
                            backgroundColor: `${cat.color}15`,
                            color: cat.color
                          }}
                        >
                          {cat.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p
                    className={`text-xs sm:text-sm font-black ${
                      isIncome ? 'text-emerald-600' : 'text-slate-900'
                    }`}
                  >
                    {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                  </p>
                  {tx.fee !== undefined && tx.fee > 0 && (
                    <p className="text-[10px] text-amber-600 font-medium">
                      fee: {formatCurrency(tx.fee)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
