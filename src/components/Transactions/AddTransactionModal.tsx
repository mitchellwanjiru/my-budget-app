import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Category, Transaction, TransactionType } from '../../types';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onAddTransaction: (transaction: Transaction) => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  categories,
  onAddTransaction
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [fee, setFee] = useState('');
  const [party, setParty] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'cat_groceries');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    const parsedFee = fee ? parseFloat(fee) : 0;

    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      type,
      amount: parsedAmount,
      fee: isNaN(parsedFee) ? 0 : parsedFee,
      currency: 'Ksh',
      date,
      time,
      party: party.trim() || 'Manual Entry',
      categoryId,
      notes: notes.trim(),
      source: 'manual',
      createdAt: Date.now()
    };

    onAddTransaction(newTx);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pink-950/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white border-2 border-pink-200 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-pink-100">
          <h3 className="text-base font-extrabold text-slate-900">Add Spending or Income</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Type Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-pink-50 rounded-2xl">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-1.5 text-xs font-bold rounded-xl transition ${
                type === 'expense'
                  ? 'bg-white text-pink-600 shadow-sm border border-pink-100'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Spending
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-1.5 text-xs font-bold rounded-xl transition ${
                type === 'income'
                  ? 'bg-white text-emerald-600 shadow-sm border border-emerald-100'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Income
            </button>
          </div>

          {/* Amount & Fee */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Amount (Ksh) *</label>
              <input
                type="number"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 1500"
                className="w-full bg-pink-50/50 border border-pink-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500 font-black"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">M-Pesa Fee (optional)</label>
              <input
                type="number"
                step="any"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                placeholder="e.g. 23"
                className="w-full bg-pink-50/50 border border-pink-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500 font-semibold"
              />
            </div>
          </div>

          {/* Party / Merchant */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Merchant / Recipient *</label>
            <input
              type="text"
              required
              value={party}
              onChange={(e) => setParty(e.target.value)}
              placeholder="e.g. Quickmart Supermarket, Java House, KPLC"
              className="w-full bg-pink-50/50 border border-pink-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-pink-50/50 border border-pink-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500 font-bold"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-pink-50/50 border border-pink-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-pink-50/50 border border-pink-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Notes (optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Groceries for the weekend"
              className="w-full bg-pink-50/50 border border-pink-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-black shadow-md shadow-pink-500/25 transition active:scale-95"
            >
              Save Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
