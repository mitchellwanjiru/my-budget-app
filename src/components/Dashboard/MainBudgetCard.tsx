import React, { useState } from 'react';
import { Target, Edit3, Plus, Sparkles, Smartphone, Check, X, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface MainBudgetCardProps {
  overallBudget: number;
  totalSpent: number;
  onUpdateBudget: (newBudget: number) => void;
  onOpenPhoneModal: () => void;
  onQuickPaste: (text: string) => void;
}

export const MainBudgetCard: React.FC<MainBudgetCardProps> = ({
  overallBudget,
  totalSpent,
  onUpdateBudget,
  onOpenPhoneModal,
  onQuickPaste,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [budgetInput, setBudgetInput] = useState(overallBudget > 0 ? overallBudget.toString() : '');
  const [showPasteBox, setShowPasteBox] = useState(false);
  const [pastedSms, setPastedSms] = useState('');

  const remaining = overallBudget > 0 ? overallBudget - totalSpent : 0;
  const percentUsed = overallBudget > 0 ? Math.min(100, Math.round((totalSpent / overallBudget) * 100)) : 0;
  const isOver = overallBudget > 0 && totalSpent > overallBudget;

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(budgetInput);
    if (!isNaN(val) && val >= 0) {
      onUpdateBudget(val);
      setIsEditing(false);
    }
  };

  const handleManualPasteSubmit = () => {
    if (!pastedSms.trim()) return;
    onQuickPaste(pastedSms.trim());
    setPastedSms('');
    setShowPasteBox(false);
  };

  return (
    <div className="bg-white border-2 border-pink-200 rounded-3xl p-6 shadow-sm space-y-5">
      {/* Top Header: Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center flex-shrink-0">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">This Month's Budget</h2>
            <p className="text-xs text-slate-400">Track your total spending against your goal</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Open on Phone Pill */}
          <button
            onClick={onOpenPhoneModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 text-xs font-bold transition"
            title="Download or open on your mobile phone"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Use on Phone</span>
          </button>

          {/* Quick Paste Toggle */}
          <button
            onClick={() => setShowPasteBox(!showPasteBox)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-pink-50 text-slate-600 hover:text-pink-600 border border-slate-200 text-xs font-bold transition"
          >
            {showPasteBox ? 'Close Paste' : 'Paste SMS'}
          </button>
        </div>
      </div>

      {/* Quick Paste Slide-down */}
      {showPasteBox && (
        <div className="p-3.5 rounded-2xl bg-pink-50/70 border border-pink-100 space-y-2 animate-in fade-in duration-150">
          <span className="text-xs font-bold text-slate-700">Paste M-Pesa Message Text:</span>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={pastedSms}
              onChange={(e) => setPastedSms(e.target.value)}
              placeholder="e.g. QA12BC34DE Confirmed. Ksh1,200.00 paid to QUICK MART..."
              className="flex-1 bg-white border border-pink-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500 font-mono"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleManualPasteSubmit();
              }}
            />
            <button
              onClick={handleManualPasteSubmit}
              disabled={!pastedSms.trim()}
              className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 disabled:opacity-40 text-white text-xs font-bold transition"
            >
              Parse
            </button>
          </div>
        </div>
      )}

      {/* Main Budget Display */}
      {overallBudget === 0 && !isEditing ? (
        <div className="p-6 rounded-2xl bg-pink-50/50 border border-dashed border-pink-300 text-center space-y-3">
          <p className="text-sm font-bold text-slate-700">You haven't set your monthly budget yet.</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Set a monthly spending limit (e.g. Ksh 30,000) to track how much you have left to spend each day.
          </p>
          <button
            onClick={() => {
              setBudgetInput('');
              setIsEditing(true);
            }}
            className="px-5 py-2.5 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-black shadow-md shadow-pink-500/20 transition active:scale-95 inline-flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Set My Monthly Budget</span>
          </button>
        </div>
      ) : isEditing ? (
        <form onSubmit={handleSaveBudget} className="p-4 rounded-2xl bg-pink-50/70 border border-pink-200 space-y-3 animate-in fade-in duration-150">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Enter Your Monthly Spending Target (Ksh):
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              step="any"
              autoFocus
              required
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              placeholder="e.g. 30000"
              className="w-full sm:w-64 bg-white border border-pink-300 rounded-xl px-4 py-2 text-base font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-extrabold shadow-sm"
            >
              Save Budget
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          {/* Metrics Trio */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 1. Monthly Budget */}
            <div className="p-4 rounded-2xl bg-pink-50/50 border border-pink-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Monthly Budget</span>
                <p className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(overallBudget)}</p>
              </div>
              <button
                onClick={() => {
                  setBudgetInput(overallBudget.toString());
                  setIsEditing(true);
                }}
                className="p-2 rounded-xl text-pink-600 hover:text-pink-700 hover:bg-pink-100 transition"
                title="Edit monthly budget"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>

            {/* 2. Total Spent */}
            <div className="p-4 rounded-2xl bg-pink-50/50 border border-pink-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Spent So Far</span>
              <p className="text-2xl font-black text-pink-600 mt-1">{formatCurrency(totalSpent)}</p>
            </div>

            {/* 3. Remaining */}
            <div className="p-4 rounded-2xl bg-pink-50/50 border border-pink-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {isOver ? 'Over Budget By' : 'Remaining To Spend'}
              </span>
              <p className={`text-2xl font-black mt-1 ${isOver ? 'text-rose-600' : 'text-emerald-600'}`}>
                {formatCurrency(Math.abs(remaining))}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
              <span className="text-slate-600">
                {isOver ? 'Budget exceeded' : `${percentUsed}% of budget used`}
              </span>
              <span className={isOver ? 'text-rose-600' : 'text-emerald-600'}>
                {isOver ? `Ksh ${Math.abs(remaining).toLocaleString()} over limit` : `Ksh ${remaining.toLocaleString()} left this month`}
              </span>
            </div>
            <div className="w-full h-3.5 rounded-full bg-pink-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isOver ? 'bg-rose-500' : percentUsed > 80 ? 'bg-amber-400' : 'bg-pink-500'
                }`}
                style={{ width: `${Math.min(100, isOver ? 100 : percentUsed)}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
