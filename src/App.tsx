import React, { useState, useEffect, useCallback } from 'react';
import { db } from './db';
import { 
  Transaction, 
  Category, 
  SavingsGoal, 
  CategorizationRule,
  ParsedMessageResult
} from './types';
import { calculateFinancialHealth } from './utils/insights';
import { checkClipboardForMpesa } from './utils/clipboardDetector';
import { parseMpesaMessage } from './parser/mpesaParser';

import { Navbar, ActiveTab } from './components/Navbar';
import { MainBudgetCard } from './components/Dashboard/MainBudgetCard';
import { StatCards } from './components/Dashboard/StatCards';
import { SpendingBreakdown } from './components/Dashboard/SpendingBreakdown';
import { CashflowChart } from './components/Dashboard/CashflowChart';
import { RecentTransactions } from './components/Dashboard/RecentTransactions';
import { TransactionList } from './components/Transactions/TransactionList';
import { AddTransactionModal } from './components/Transactions/AddTransactionModal';
import { AutoDetectModal } from './components/Parser/AutoDetectModal';
import { PhoneInstallModal } from './components/Phone/PhoneInstallModal';
import { BudgetsAndGoals } from './components/Budgets/BudgetsAndGoals';
import { FinancialInsights } from './components/Insights/FinancialInsights';
import { DataManagement } from './components/Settings/DataManagement';
import { WelcomeScreen } from './components/Welcome/WelcomeScreen';

export const App: React.FC = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [rules, setRules] = useState<CategorizationRule[]>([]);
  const [overallBudget, setOverallBudget] = useState<number>(0);
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Auto-Detect Pop-up state
  const [detectedTransaction, setDetectedTransaction] = useState<ParsedMessageResult | null>(null);

  // Load data from offline IndexedDB
  const loadData = useCallback(async () => {
    try {
      const [txList, catList, goalsList, rulesList, budgetVal] = await Promise.all([
        db.getTransactions(),
        db.getCategories(),
        db.getSavingsGoals(),
        db.getRules(),
        db.getOverallMonthlyBudget()
      ]);
      setTransactions(txList);
      setCategories(catList);
      setSavingsGoals(goalsList);
      setRules(rulesList);
      setOverallBudget(budgetVal);
    } catch (err) {
      console.error('Failed to load local DB data', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Clipboard Auto-Detection on Focus / Tab Switch
  const triggerClipboardCheck = useCallback(async () => {
    if (rules.length === 0 || categories.length === 0) return;
    const detected = await checkClipboardForMpesa(rules, categories);
    if (detected && detected.isValid) {
      setDetectedTransaction(detected);
    }
  }, [rules, categories]);

  useEffect(() => {
    const handleFocus = () => {
      triggerClipboardCheck();
    };
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        triggerClipboardCheck();
      }
    };

    // Native Android direct SMS receiver event listener
    const handleNativeMpesaSms = (e: any) => {
      const smsText = e.detail;
      if (smsText) {
        const parsed = parseMpesaMessage(smsText, rules, categories);
        if (parsed.isValid) {
          setDetectedTransaction(parsed);
        }
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('mpesa_sms_received', handleNativeMpesaSms);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('mpesa_sms_received', handleNativeMpesaSms);
    };
  }, [triggerClipboardCheck, rules, categories]);

  // Handlers for budget and transactions
  const handleUpdateOverallBudget = async (newBudget: number) => {
    await db.setOverallMonthlyBudget(newBudget);
    setOverallBudget(newBudget);
  };

  const handleAddTransaction = async (newTx: Transaction) => {
    await db.addTransaction(newTx);
    await loadData();
  };

  const handleDeleteTransaction = async (id: string) => {
    await db.deleteTransaction(id);
    await loadData();
  };

  const handleUpdateCategory = async (txId: string, newCategoryId: string) => {
    const tx = transactions.find(t => t.id === txId);
    if (!tx) return;
    const updated = { ...tx, categoryId: newCategoryId };
    await db.updateTransaction(updated);
    await loadData();
  };

  const handleConfirmAutoDetect = async (tx: Transaction, newRule?: CategorizationRule) => {
    await db.addTransaction(tx);
    if (newRule) {
      await db.saveRule(newRule);
    }
    setDetectedTransaction(null);
    await loadData();
  };

  const handleManualQuickParse = (text: string) => {
    const parsed = parseMpesaMessage(text, rules, categories);
    if (parsed.isValid) {
      setDetectedTransaction(parsed);
    } else {
      alert('Could not detect an M-Pesa transaction. Please verify amount and merchant.');
    }
  };

  const handleSaveCategory = async (cat: Category) => {
    await db.saveCategory(cat);
    await loadData();
  };

  const handleSaveGoal = async (goal: SavingsGoal) => {
    await db.saveSavingsGoal(goal);
    await loadData();
  };

  const handleDeleteGoal = async (id: string) => {
    await db.deleteSavingsGoal(id);
    await loadData();
  };

  const handleContributeToGoal = async (goalId: string, amount: number) => {
    const goal = savingsGoals.find(g => g.id === goalId);
    if (!goal) return;

    const updated = {
      ...goal,
      currentAmount: goal.currentAmount + amount
    };
    await db.saveSavingsGoal(updated);

    const tx: Transaction = {
      id: `tx_goal_${Date.now()}`,
      type: 'expense',
      amount,
      currency: 'Ksh',
      date: new Date().toISOString().split('T')[0],
      party: `Savings Deposit: ${goal.name}`,
      categoryId: 'cat_savings',
      notes: `Transferred to savings: ${goal.name}`,
      source: 'manual',
      createdAt: Date.now()
    };
    await db.addTransaction(tx);
    await loadData();
  };

  const handleAddRule = async (rule: CategorizationRule) => {
    await db.saveRule(rule);
    await loadData();
  };

  const handleDeleteRule = async (id: string) => {
    await db.deleteRule(id);
    await loadData();
  };

  const handleExportJSON = async () => {
    const jsonStr = await db.exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MyBudget_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = async (jsonStr: string) => {
    const success = await db.importData(jsonStr);
    if (success) {
      await loadData();
    }
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) return;
    const catMap = new Map(categories.map(c => [c.id, c.name]));
    const headers = ['Code', 'Date', 'Time', 'Type', 'Party', 'Category', 'Amount', 'Fee', 'BalanceAfter', 'Notes'];
    
    const rows = transactions.map(t => [
      `"${t.code || ''}"`,
      `"${t.date}"`,
      `"${t.time || ''}"`,
      `"${t.type}"`,
      `"${(t.party || '').replace(/"/g, '""')}"`,
      `"${catMap.get(t.categoryId) || 'Other'}"`,
      t.amount,
      t.fee || 0,
      t.balanceAfter || '',
      `"${(t.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Spending_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearAllData = async () => {
    await db.clearAllData();
    await loadData();
  };

  const report = calculateFinancialHealth(transactions, categories);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fff5f7] flex items-center justify-center text-pink-600">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin"></div>
          <span className="text-xs font-bold text-slate-600">Opening My Budget...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff5f7] text-slate-800 pb-20 md:pb-12">
      {/* Welcome Splash Screen */}
      {showWelcome && (
        <WelcomeScreen onDismiss={() => setShowWelcome(false)} />
      )}

      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={() => setIsAddModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Front & Center: My Monthly Budget Card */}
            <MainBudgetCard
              overallBudget={overallBudget}
              totalSpent={report.totalExpense}
              onUpdateBudget={handleUpdateOverallBudget}
              onQuickPaste={handleManualQuickParse}
            />

            {/* Quick Stat Summary Cards */}
            <StatCards
              totalIncome={report.totalIncome}
              totalExpense={report.totalExpense}
              netSavings={report.netSavings}
              savingsRate={report.savingsRate}
              totalFees={report.totalFees}
            />

            {/* Where I've Spent (Category Breakdown & Cash Flow) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6">
                <SpendingBreakdown
                  categorySpend={report.topExpenseCategories}
                  totalExpense={report.totalExpense}
                />
              </div>
              <div className="lg:col-span-6">
                <CashflowChart transactions={transactions} />
              </div>
            </div>

            {/* Recent Spending Activity */}
            <RecentTransactions
              transactions={transactions}
              categories={categories}
              onViewAll={() => setActiveTab('transactions')}
            />
          </div>
        )}

        {activeTab === 'transactions' && (
          <TransactionList
            transactions={transactions}
            categories={categories}
            onDeleteTransaction={handleDeleteTransaction}
            onUpdateCategory={handleUpdateCategory}
          />
        )}

        {activeTab === 'budgets' && (
          <BudgetsAndGoals
            categories={categories}
            transactions={transactions}
            savingsGoals={savingsGoals}
            onSaveCategory={handleSaveCategory}
            onSaveGoal={handleSaveGoal}
            onDeleteGoal={handleDeleteGoal}
            onContributeToGoal={handleContributeToGoal}
          />
        )}

        {activeTab === 'insights' && (
          <FinancialInsights
            transactions={transactions}
            categories={categories}
          />
        )}

        {activeTab === 'settings' && (
          <DataManagement
            categories={categories}
            rules={rules}
            onExportJSON={handleExportJSON}
            onImportJSON={handleImportJSON}
            onExportCSV={handleExportCSV}
            onClearAllData={handleClearAllData}
            onAddRule={handleAddRule}
            onDeleteRule={handleDeleteRule}
          />
        )}
      </main>

      {/* Manual Add Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        categories={categories}
        onAddTransaction={handleAddTransaction}
      />

      {/* Automatic M-Pesa Detection & Classification Pop-up */}
      <AutoDetectModal
        detected={detectedTransaction}
        categories={categories}
        onConfirm={handleConfirmAutoDetect}
        onDismiss={() => setDetectedTransaction(null)}
      />

      {/* Phone Install Modal */}
      <PhoneInstallModal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        localIp="192.168.1.23"
      />
    </div>
  );
};

export default App;
