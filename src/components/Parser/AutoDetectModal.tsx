import React, { useState } from 'react';
import { Sparkles, Check, X, Tag, DollarSign, Calendar, Clock, Receipt } from 'lucide-react';
import { ParsedMessageResult, Category, CategorizationRule, Transaction } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface AutoDetectModalProps {
  detected: ParsedMessageResult | null;
  categories: Category[];
  onConfirm: (transaction: Transaction, newRule?: CategorizationRule) => void;
  onDismiss: () => void;
}

export const AutoDetectModal: React.FC<AutoDetectModalProps> = ({
  detected,
  categories,
  onConfirm,
  onDismiss,
}) => {
  if (!detected || !detected.isValid) return null;

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    detected.suggestedCategoryId || categories[0]?.id || 'cat_groceries'
  );
  const [rememberRule, setRememberRule] = useState<boolean>(true);
  const [customNote, setCustomNote] = useState<string>('');

  const isIncome = detected.type === 'income';

  const handleSave = () => {
    const tx: Transaction = {
      id: `tx_${Date.now()}`,
      code: detected.code,
      type: detected.type,
      amount: detected.amount,
      fee: detected.fee || 0,
      currency: detected.currency || 'Ksh',
      date: detected.date,
      time: detected.time,
      party: detected.party,
      accountNumber: detected.accountNumber,
      categoryId: selectedCategoryId,
      notes: customNote.trim() || undefined,
      rawMessage: detected.rawMessage,
      balanceAfter: detected.balanceAfter,
      source: 'mpesa',
      createdAt: Date.now()
    };

    let newRule: CategorizationRule | undefined = undefined;
    if (rememberRule && detected.party && detected.party !== 'Unknown') {
      const cleanKeyword = detected.party.split('(')[0].trim().toUpperCase();
      if (cleanKeyword.length >= 3) {
        newRule = {
          id: `rule_${Date.now()}`,
          keyword: cleanKeyword,
          categoryId: selectedCategoryId,
          matchField: 'party'
        };
      }
    }

    onConfirm(tx, newRule);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pink-950/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white border-2 border-pink-200 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 fill-pink-500 text-pink-500" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">
                  New M-Pesa Detected!
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-slate-800 mt-0.5">
                Classify This Transaction
              </h3>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Transaction Summary Card */}
        <div className="p-4 rounded-2xl bg-pink-50/70 border border-pink-100 space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-semibold text-slate-500">Amount</span>
            <span className={`text-2xl font-black ${isIncome ? 'text-emerald-600' : 'text-pink-600'}`}>
              {isIncome ? '+' : '-'}{formatCurrency(detected.amount)}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-700 font-semibold pt-1 border-t border-pink-200/50">
            <span className="text-slate-500">Merchant / Recipient:</span>
            <span className="font-bold text-slate-800 truncate max-w-[200px]">
              {detected.party}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Date & Time:</span>
            <span>{formatDate(detected.date)} {detected.time ? `at ${detected.time}` : ''}</span>
          </div>

          {detected.fee !== undefined && detected.fee > 0 && (
            <div className="flex items-center justify-between text-xs text-amber-700">
              <span>Transaction Fee:</span>
              <span className="font-bold">{formatCurrency(detected.fee)}</span>
            </div>
          )}

          {detected.code && (
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Code:</span>
              <span>{detected.code}</span>
            </div>
          )}
        </div>

        {/* Category Classification Pills */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
            Choose Category:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-44 overflow-y-auto p-1">
            {categories.map((cat) => {
              const isSelected = selectedCategoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold text-left transition border flex items-center justify-between ${
                    isSelected
                      ? 'bg-pink-600 text-white border-pink-600 shadow-md shadow-pink-500/20'
                      : 'bg-white hover:bg-pink-50 text-slate-700 border-slate-200'
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 stroke-[3] ml-1 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Remember rule checkbox */}
        <div className="pt-1">
          <label className="flex items-center space-x-2 text-xs font-semibold text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberRule}
              onChange={(e) => setRememberRule(e.target.checked)}
              className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500 border-slate-300"
            />
            <span>Remember this category for <strong>{detected.party.split('(')[0].trim()}</strong></span>
          </label>
        </div>

        {/* Optional quick note */}
        <div>
          <input
            type="text"
            value={customNote}
            onChange={(e) => setCustomNote(e.target.value)}
            placeholder="Add an optional note (e.g. dinner with friends)..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onDismiss}
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
          >
            Ignore
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-extrabold shadow-lg shadow-pink-500/25 transition active:scale-95"
          >
            Confirm & Record
          </button>
        </div>

      </div>
    </div>
  );
};
