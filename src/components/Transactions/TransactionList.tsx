import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ChevronDown, 
  ChevronUp
} from 'lucide-react';
import { Transaction, Category } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  onDeleteTransaction: (id: string) => void;
  onUpdateCategory: (id: string, newCategoryId: string) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  categories,
  onDeleteTransaction,
  onUpdateCategory
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const categoryMap = useMemo(() => new Map(categories.map(c => [c.id, c])), [categories]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        !searchQuery ||
        (t.party && t.party.toLowerCase().includes(query)) ||
        (t.code && t.code.toLowerCase().includes(query)) ||
        (t.notes && t.notes.toLowerCase().includes(query)) ||
        (t.accountNumber && t.accountNumber.toLowerCase().includes(query));

      const matchesCat = selectedCategory === 'all' || t.categoryId === selectedCategory;
      const matchesType = selectedType === 'all' || t.type === selectedType;

      return matchesSearch && matchesCat && matchesType;
    });
  }, [transactions, searchQuery, selectedCategory, selectedType]);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Header */}
      <div className="bg-white border border-pink-100 rounded-3xl p-4 sm:p-5 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Search bar */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search merchant, M-Pesa code, notes..."
              className="w-full bg-pink-50/50 border border-pink-200 rounded-2xl pl-10 pr-3 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
            />
          </div>

          {/* Category Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-pink-50/50 border border-pink-200 rounded-2xl px-3 py-2 text-xs sm:text-sm text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-pink-50/50 border border-pink-200 rounded-2xl px-3 py-2 text-xs sm:text-sm text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              <option value="all">All Types</option>
              <option value="expense">Spending Only</option>
              <option value="income">Income Only</option>
              <option value="transfer">Transfers Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transaction List Cards */}
      <div className="bg-white border border-pink-100 rounded-3xl p-4 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-pink-100">
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center space-x-2">
            <span>Recorded Spending</span>
            <span className="px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 text-xs font-bold">
              {filteredTransactions.length}
            </span>
          </h3>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs font-medium">
            No transactions found. Copy an M-Pesa transaction SMS or add one manually.
          </div>
        ) : (
          <div className="divide-y divide-pink-50">
            {filteredTransactions.map((tx) => {
              const isIncome = tx.type === 'income';
              const isExpanded = expandedId === tx.id;

              return (
                <div key={tx.id} className="py-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    {/* Left: Icon & Merchant details */}
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
                        <div className="flex items-center space-x-2">
                          <p className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-[180px] sm:max-w-md">
                            {tx.party || 'Transaction'}
                          </p>
                          {tx.code && (
                            <span className="hidden sm:inline text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                              {tx.code}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 mt-0.5 text-[11px] text-slate-400">
                          <span>{formatDate(tx.date)}</span>
                          {tx.time && <span>• {tx.time}</span>}
                          {tx.accountNumber && (
                            <span className="hidden sm:inline text-slate-400">• Acc: {tx.accountNumber}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Amount & Category selector */}
                    <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
                      <div className="text-right">
                        <p className={`text-xs sm:text-sm font-black ${isIncome ? 'text-emerald-600' : 'text-slate-900'}`}>
                          {isIncome ? '+' : '-'}{formatCurrency(tx.amount)}
                        </p>
                        {tx.fee !== undefined && tx.fee > 0 && (
                          <p className="text-[10px] text-amber-600 font-medium">
                            Fee: {formatCurrency(tx.fee)}
                          </p>
                        )}
                      </div>

                      {/* Category selector dropdown */}
                      <select
                        value={tx.categoryId}
                        onChange={(e) => onUpdateCategory(tx.id, e.target.value)}
                        className="bg-pink-50 hover:bg-pink-100 text-pink-700 rounded-xl px-2.5 py-1 text-xs font-bold border border-pink-200 focus:outline-none focus:ring-1 focus:ring-pink-500 cursor-pointer max-w-[110px] sm:max-w-[140px] truncate"
                        title="Change category"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>

                      {/* Expand / Raw SMS toggle */}
                      <button
                        onClick={() => toggleExpand(tx.id)}
                        className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                        title="View details"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => onDeleteTransaction(tx.id)}
                        className="p-1 rounded-xl text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Delete transaction"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Accordion: Raw SMS, Balance After */}
                  {isExpanded && (
                    <div className="mt-2 p-3.5 rounded-2xl bg-pink-50/50 border border-pink-100 text-xs space-y-2">
                      {tx.rawMessage && (
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Original M-Pesa Message:</span>
                          <p className="font-mono text-slate-700 text-[11px] mt-1 bg-white p-2.5 rounded-xl border border-pink-100">
                            {tx.rawMessage}
                          </p>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-4 text-slate-500 text-[11px] pt-1">
                        {tx.balanceAfter !== undefined && (
                          <span>M-Pesa Balance After: <strong className="text-slate-900 font-bold">{formatCurrency(tx.balanceAfter)}</strong></span>
                        )}
                        {tx.code && (
                          <span>Code: <strong className="text-slate-800 font-mono">{tx.code}</strong></span>
                        )}
                        {tx.notes && (
                          <span>Notes: <strong className="text-slate-800">{tx.notes}</strong></span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
