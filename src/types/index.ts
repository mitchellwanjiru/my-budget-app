export type TransactionType = 'expense' | 'income' | 'transfer';

export interface Transaction {
  id: string;
  code?: string; // M-Pesa reference code e.g. QA12BC34DE
  type: TransactionType;
  amount: number;
  fee?: number; // Transaction fee e.g. M-Pesa charges
  currency: string;
  date: string; // ISO date YYYY-MM-DD
  time?: string; // HH:mm format
  party: string; // Merchant, Paybill name, Sender, or Recipient
  accountNumber?: string; // Paybill or Till or Phone number
  categoryId: string;
  notes?: string;
  rawMessage?: string; // The original SMS text
  balanceAfter?: number; // Balance after transaction
  source: 'mpesa' | 'sms' | 'manual' | 'import';
  createdAt: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string; // Lucide icon name
  color: string; // Tailwind color class or hex
  type: 'expense' | 'income';
  budgetMonthly?: number; // Base/default monthly budget limit in currency
  monthlyBudgets?: Record<string, number>; // Month-specific budgets e.g. { '2026-10': 15000, '2026-11': 20000 }
  isDefault?: boolean;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  category?: string;
  color: string;
  icon: string;
  notes?: string;
  createdAt: number;
}

export interface CategorizationRule {
  id: string;
  keyword: string; // e.g. "NAIVAS", "KPLC", "JAVA"
  categoryId: string;
  matchField: 'party' | 'notes' | 'raw';
  isRegex?: boolean;
  priority?: number;
}

export interface ParsedMessageResult {
  code?: string;
  type: TransactionType;
  amount: number;
  fee?: number;
  currency: string;
  date: string;
  time?: string;
  party: string;
  accountNumber?: string;
  balanceAfter?: number;
  suggestedCategoryId: string;
  confidence: number; // 0-1
  rawMessage: string;
  isValid: boolean;
  error?: string;
}

export interface BudgetHealthReport {
  totalIncome: number; // Pure actual inflows / income received
  totalAvailableFunds: number; // Baseline budget + actual inflows
  totalExpense: number;
  totalFees: number;
  netSavings: number;
  savingsRate: number; // percentage
  topExpenseCategories: { category: Category; amount: number; percentage: number }[];
  budgetAlerts: { category: Category; spent: number; budget: number; percentage: number; isOver: boolean }[];
  insights: {
    type: 'positive' | 'warning' | 'tip' | 'info';
    title: string;
    description: string;
    actionable?: string;
  }[];
}
