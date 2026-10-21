import React, { useState } from 'react';
import { 
  Target, 
  PiggyBank, 
  Plus, 
  Edit2, 
  Trash2, 
  PlusCircle,
  X
} from 'lucide-react';
import { Category, SavingsGoal, Transaction } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface BudgetsAndGoalsProps {
  categories: Category[];
  transactions: Transaction[];
  savingsGoals: SavingsGoal[];
  onSaveCategory: (cat: Category) => void;
  onSaveGoal: (goal: SavingsGoal) => void;
  onDeleteGoal: (id: string) => void;
  onContributeToGoal: (goalId: string, amount: number) => void;
}

export const BudgetsAndGoals: React.FC<BudgetsAndGoalsProps> = ({
  categories,
  transactions,
  savingsGoals,
  onSaveCategory,
  onSaveGoal,
  onDeleteGoal,
  onContributeToGoal
}) => {
  const [activeSection, setActiveSection] = useState<'budgets' | 'goals'>('budgets');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newBudgetVal, setNewBudgetVal] = useState('');

  // New Goal modal
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [goalName, setGoalName] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalCurrent, setGoalCurrent] = useState('0');
  const [goalDate, setGoalDate] = useState('');
  const [goalNotes, setGoalNotes] = useState('');

  // Contribute modal
  const [contributeGoal, setContributeGoal] = useState<SavingsGoal | null>(null);
  const [contributeAmount, setContributeAmount] = useState('');

  // Calculate current month spending per category
  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const monthTransactions = transactions.filter(t => t.date.startsWith(currentMonthStr));
  
  const categorySpendMap = new Map<string, number>();
  for (const t of monthTransactions) {
    if (t.type === 'expense' || t.type === 'transfer') {
      const prev = categorySpendMap.get(t.categoryId) || 0;
      categorySpendMap.set(t.categoryId, prev + t.amount);
    }
  }

  const expenseCategories = categories.filter(c => c.type === 'expense');
  const totalBudgeted = expenseCategories.reduce((sum, c) => sum + (c.budgetMonthly || 0), 0);
  const totalSpent = expenseCategories.reduce((sum, c) => sum + (categorySpendMap.get(c.id) || 0), 0);
  const remainingBudget = Math.max(0, totalBudgeted - totalSpent);

  const handleStartEdit = (cat: Category) => {
    setEditingCategory(cat);
    setNewBudgetVal(cat.budgetMonthly?.toString() || '0');
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    const budgetVal = parseFloat(newBudgetVal);
    onSaveCategory({
      ...editingCategory,
      budgetMonthly: isNaN(budgetVal) ? 0 : Math.max(0, budgetVal)
    });
    setEditingCategory(null);
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(goalTarget);
    const initial = parseFloat(goalCurrent) || 0;
    if (isNaN(target) || target <= 0 || !goalName.trim()) return;

    const newGoal: SavingsGoal = {
      id: `goal_${Date.now()}`,
      name: goalName.trim(),
      targetAmount: target,
      currentAmount: initial,
      targetDate: goalDate || undefined,
      notes: goalNotes.trim(),
      color: '#ec4899',
      icon: 'PiggyBank',
      createdAt: Date.now()
    };

    onSaveGoal(newGoal);
    setIsGoalModalOpen(false);
    setGoalName('');
    setGoalTarget('');
    setGoalCurrent('0');
    setGoalDate('');
    setGoalNotes('');
  };

  const handleContributeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contributeGoal) return;
    const addVal = parseFloat(contributeAmount);
    if (isNaN(addVal) || addVal <= 0) return;

    onContributeToGoal(contributeGoal.id, addVal);
    setContributeGoal(null);
    setContributeAmount('');
  };

  return (
    <div className="space-y-6">
      {/* Top Toggle Switch */}
      <div className="flex items-center justify-between bg-white border border-pink-100 rounded-3xl p-1.5 max-w-sm shadow-sm">
        <button
          onClick={() => setActiveSection('budgets')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-2xl text-xs sm:text-sm font-bold transition ${
            activeSection === 'budgets'
              ? 'bg-pink-500 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Category Budgets</span>
        </button>
        <button
          onClick={() => setActiveSection('goals')}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-2xl text-xs sm:text-sm font-bold transition ${
            activeSection === 'goals'
              ? 'bg-pink-500 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <PiggyBank className="w-4 h-4" />
          <span>Savings Goals</span>
        </button>
      </div>

      {/* SECTION 1: CATEGORY BUDGETS */}
      {activeSection === 'budgets' && (
        <div className="space-y-6">
          {/* Budget Overview Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-pink-100 rounded-3xl p-5 shadow-sm">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Monthly Budget</span>
              <h3 className="text-2xl font-black text-slate-900 mt-2">{formatCurrency(totalBudgeted)}</h3>
              <p className="text-xs text-slate-400 mt-1">Across {expenseCategories.length} categories</p>
            </div>
            <div className="bg-white border border-pink-100 rounded-3xl p-5 shadow-sm">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Spent This Month</span>
              <h3 className="text-2xl font-black text-pink-600 mt-2">{formatCurrency(totalSpent)}</h3>
              <p className="text-xs text-slate-400 mt-1">
                {totalBudgeted > 0 ? Math.round((totalSpent / totalBudgeted) * 100) : 0}% of budget used
              </p>
            </div>
            <div className="bg-white border border-pink-100 rounded-3xl p-5 shadow-sm">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Remaining Buffer</span>
              <h3 className="text-2xl font-black text-emerald-600 mt-2">{formatCurrency(remainingBudget)}</h3>
              <p className="text-xs text-slate-400 mt-1">Safe to spend this month</p>
            </div>
          </div>

          {/* Category Budgets Grid */}
          <div className="bg-white border border-pink-100 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-pink-100">
              <div>
                <h3 className="text-base font-black text-slate-900">Monthly Spending Limits</h3>
                <p className="text-xs text-slate-400">Click any category limit to update your monthly target</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {expenseCategories.map((cat) => {
                const spent = categorySpendMap.get(cat.id) || 0;
                const budget = cat.budgetMonthly || 0;
                const percent = budget > 0 ? Math.round((spent / budget) * 100) : 0;
                const isOver = budget > 0 && spent > budget;

                return (
                  <div
                    key={cat.id}
                    className="p-4 rounded-2xl bg-pink-50/40 border border-pink-100 hover:border-pink-200 transition space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <span
                          className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="text-sm font-bold text-slate-800">{cat.name}</span>
                      </div>
                      <button
                        onClick={() => handleStartEdit(cat)}
                        className="flex items-center space-x-1 text-xs text-pink-600 hover:text-pink-700 font-bold px-2 py-1 rounded-xl bg-white border border-pink-200 transition"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit Limit</span>
                      </button>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="font-bold text-slate-700">
                          {formatCurrency(spent)} spent
                        </span>
                        <span className="font-semibold text-slate-400">
                          of {formatCurrency(budget)} limit
                        </span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-pink-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isOver ? 'bg-rose-500' : percent > 80 ? 'bg-amber-400' : 'bg-pink-500'
                          }`}
                          style={{ width: `${Math.min(100, percent)}%` }}
                        />
                      </div>
                    </div>

                    {/* Status badge */}
                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className={`font-bold ${isOver ? 'text-rose-600' : 'text-slate-500'}`}>
                        {isOver ? `Over budget by ${formatCurrency(spent - budget)}` : `${formatCurrency(Math.max(0, budget - spent))} remaining`}
                      </span>
                      <span className={`font-bold px-2.5 py-0.5 rounded-full ${
                        isOver ? 'bg-rose-100 text-rose-700' : percent > 80 ? 'bg-amber-100 text-amber-700' : 'bg-pink-100 text-pink-700'
                      }`}>
                        {percent}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: SAVINGS GOALS */}
      {activeSection === 'goals' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white border border-pink-100 rounded-3xl p-6 shadow-sm">
            <div>
              <h3 className="text-base font-black text-slate-900">Personal Savings Goals</h3>
              <p className="text-xs text-slate-400">Track targets for emergency funds, holidays, big purchases, or investments</p>
            </div>
            <button
              onClick={() => setIsGoalModalOpen(true)}
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-black shadow-md shadow-pink-500/25 transition active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Create Goal</span>
            </button>
          </div>

          {/* Goals Grid */}
          {savingsGoals.length === 0 ? (
            <div className="bg-white border border-pink-100 rounded-3xl p-8 text-center space-y-3 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-500 flex items-center justify-center mx-auto">
                <PiggyBank className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">No Savings Goals Yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Create a savings goal for an emergency fund, gadget, or vacation to stay disciplined.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {savingsGoals.map((goal) => {
                const percent = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
                const isCompleted = goal.currentAmount >= goal.targetAmount;

                return (
                  <div
                    key={goal.id}
                    className="bg-white border border-pink-100 rounded-3xl p-5 shadow-sm space-y-4 hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-base font-bold text-slate-900">{goal.name}</h4>
                        {goal.targetDate && (
                          <p className="text-[11px] text-slate-400 mt-0.5">Target: {formatDate(goal.targetDate)}</p>
                        )}
                      </div>
                      <button
                        onClick={() => onDeleteGoal(goal.id)}
                        className="p-1 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition"
                        title="Delete goal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {goal.notes && (
                      <p className="text-xs text-slate-500 bg-pink-50/50 p-2.5 rounded-2xl border border-pink-100">
                        {goal.notes}
                      </p>
                    )}

                    {/* Progress info */}
                    <div>
                      <div className="flex items-baseline justify-between mb-1.5">
                        <span className="text-lg font-black text-pink-600">{formatCurrency(goal.currentAmount)}</span>
                        <span className="text-xs font-semibold text-slate-400">target: {formatCurrency(goal.targetAmount)}</span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-pink-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-pink-500 to-rose-400 transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs mt-1.5">
                        <span className="text-slate-500 font-medium">
                          {isCompleted ? 'Goal Reached! 🌸' : `${formatCurrency(goal.targetAmount - goal.currentAmount)} to go`}
                        </span>
                        <span className="font-black text-pink-600">{percent}%</span>
                      </div>
                    </div>

                    {/* Add Funds Button */}
                    <button
                      onClick={() => {
                        setContributeGoal(goal);
                        setContributeAmount('');
                      }}
                      className="w-full py-2.5 rounded-2xl bg-pink-50 hover:bg-pink-100 text-pink-700 font-bold text-xs flex items-center justify-center space-x-1.5 border border-pink-200 transition"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Deposit / Add Funds</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Edit Category Budget Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pink-950/40 backdrop-blur-sm">
          <div className="bg-white border-2 border-pink-200 rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Edit Monthly Limit</h3>
            <p className="text-xs text-slate-500">Set budget limit for {editingCategory.name}</p>
            <form onSubmit={handleSaveBudget} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Monthly Limit (Ksh)</label>
                <input
                  type="number"
                  step="any"
                  required
                  autoFocus
                  value={newBudgetVal}
                  onChange={(e) => setNewBudgetVal(e.target.value)}
                  className="w-full bg-pink-50/50 border border-pink-200 rounded-xl px-3 py-2 text-slate-900 font-black focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-pink-500 text-white font-bold text-xs hover:bg-pink-600 shadow-md shadow-pink-500/20"
                >
                  Save Limit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Goal Modal */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pink-950/40 backdrop-blur-sm">
          <div className="bg-white border-2 border-pink-200 rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-pink-100">
              <h3 className="text-base font-bold text-slate-900">Create Savings Goal</h3>
              <button onClick={() => setIsGoalModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateGoal} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Goal Name *</label>
                <input
                  type="text"
                  required
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  placeholder="e.g. Emergency Fund, New Phone, Vacation"
                  className="w-full bg-pink-50/50 border border-pink-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Target (Ksh) *</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(e.target.value)}
                    placeholder="e.g. 50000"
                    className="w-full bg-pink-50/50 border border-pink-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 font-bold focus:ring-2 focus:ring-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Saved So Far (Ksh)</label>
                  <input
                    type="number"
                    step="any"
                    value={goalCurrent}
                    onChange={(e) => setGoalCurrent(e.target.value)}
                    className="w-full bg-pink-50/50 border border-pink-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-pink-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Target Date (optional)</label>
                <input
                  type="date"
                  value={goalDate}
                  onChange={(e) => setGoalDate(e.target.value)}
                  className="w-full bg-pink-50/50 border border-pink-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Notes (optional)</label>
                <input
                  type="text"
                  value={goalNotes}
                  onChange={(e) => setGoalNotes(e.target.value)}
                  placeholder="e.g. Save Ksh 5,000 every month"
                  className="w-full bg-pink-50/50 border border-pink-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div className="flex items-center justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsGoalModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-2xl bg-pink-500 text-white font-bold text-xs hover:bg-pink-600 shadow-md shadow-pink-500/20"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contribute to Goal Modal */}
      {contributeGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pink-950/40 backdrop-blur-sm">
          <div className="bg-white border-2 border-pink-200 rounded-3xl w-full max-w-sm p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Deposit to {contributeGoal.name}</h3>
            <p className="text-xs text-slate-500">Current balance: {formatCurrency(contributeGoal.currentAmount)}</p>
            <form onSubmit={handleContributeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Amount to Add (Ksh) *</label>
                <input
                  type="number"
                  step="any"
                  required
                  autoFocus
                  value={contributeAmount}
                  onChange={(e) => setContributeAmount(e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full bg-pink-50/50 border border-pink-200 rounded-xl px-3 py-2 text-slate-900 font-black focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setContributeGoal(null)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-pink-500 text-white font-bold text-xs hover:bg-pink-600 shadow-md shadow-pink-500/20"
                >
                  Confirm Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
