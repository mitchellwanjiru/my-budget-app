import { Category, CategorizationRule } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'cat_groceries',
    name: 'Food & Groceries',
    icon: 'ShoppingCart',
    color: '#ec4899', // pink
    type: 'expense',
    budgetMonthly: 0,
    isDefault: true,
  },
  {
    id: 'cat_dining',
    name: 'Dining & Drinks',
    icon: 'Utensils',
    color: '#f43f5e', // rose
    type: 'expense',
    budgetMonthly: 0,
    isDefault: true,
  },
  {
    id: 'cat_utilities',
    name: 'Bills & Utilities',
    icon: 'Zap',
    color: '#8b5cf6', // purple
    type: 'expense',
    budgetMonthly: 0,
    isDefault: true,
  },
  {
    id: 'cat_transport',
    name: 'Transport & Fuel',
    icon: 'Car',
    color: '#06b6d4', // cyan
    type: 'expense',
    budgetMonthly: 0,
    isDefault: true,
  },
  {
    id: 'cat_airtime',
    name: 'Airtime & Data',
    icon: 'PhoneCall',
    color: '#f59e0b', // amber
    type: 'expense',
    budgetMonthly: 0,
    isDefault: true,
  },
  {
    id: 'cat_shopping',
    name: 'Shopping & Clothes',
    icon: 'ShoppingBag',
    color: '#d946ef', // fuchsia
    type: 'expense',
    budgetMonthly: 0,
    isDefault: true,
  },
  {
    id: 'cat_health',
    name: 'Health & Pharmacy',
    icon: 'HeartPulse',
    color: '#fb7185', // coral
    type: 'expense',
    budgetMonthly: 0,
    isDefault: true,
  },
  {
    id: 'cat_entertainment',
    name: 'Fun & Leisure',
    icon: 'Film',
    color: '#a855f7', // violet
    type: 'expense',
    budgetMonthly: 0,
    isDefault: true,
  },
  {
    id: 'cat_family',
    name: 'Family & Transfers',
    icon: 'Users',
    color: '#14b8a6', // teal
    type: 'expense',
    budgetMonthly: 0,
    isDefault: true,
  },
  {
    id: 'cat_fees',
    name: 'M-Pesa Charges',
    icon: 'Receipt',
    color: '#94a3b8', // slate
    type: 'expense',
    budgetMonthly: 0,
    isDefault: true,
  },
  {
    id: 'cat_savings',
    name: 'Savings & Investments',
    icon: 'PiggyBank',
    color: '#10b981', // emerald
    type: 'expense',
    budgetMonthly: 0,
    isDefault: true,
  },
  {
    id: 'cat_income',
    name: 'Salary & Earnings',
    icon: 'Wallet',
    color: '#059669', // green
    type: 'income',
    isDefault: true,
  },
  {
    id: 'cat_general',
    name: 'Other Spending',
    icon: 'HelpCircle',
    color: '#cbd5e1',
    type: 'expense',
    budgetMonthly: 0,
    isDefault: true,
  }
];

export const DEFAULT_RULES: CategorizationRule[] = [
  // Groceries
  { id: 'rule_1', keyword: 'NAIVAS', categoryId: 'cat_groceries', matchField: 'party' },
  { id: 'rule_2', keyword: 'QUICK MART', categoryId: 'cat_groceries', matchField: 'party' },
  { id: 'rule_3', keyword: 'QUICKMART', categoryId: 'cat_groceries', matchField: 'party' },
  { id: 'rule_4', keyword: 'CARREFOUR', categoryId: 'cat_groceries', matchField: 'party' },
  { id: 'rule_5', keyword: 'CHANDARANA', categoryId: 'cat_groceries', matchField: 'party' },
  { id: 'rule_6', keyword: 'CLEANSHELF', categoryId: 'cat_groceries', matchField: 'party' },
  { id: 'rule_7', keyword: 'SUPERMARKET', categoryId: 'cat_groceries', matchField: 'party' },
  { id: 'rule_8', keyword: 'BUTCHERY', categoryId: 'cat_groceries', matchField: 'party' },
  { id: 'rule_9', keyword: 'GROCERY', categoryId: 'cat_groceries', matchField: 'party' },

  // Dining
  { id: 'rule_10', keyword: 'JAVA', categoryId: 'cat_dining', matchField: 'party' },
  { id: 'rule_11', keyword: 'ARTCAFFE', categoryId: 'cat_dining', matchField: 'party' },
  { id: 'rule_12', keyword: 'KFC', categoryId: 'cat_dining', matchField: 'party' },
  { id: 'rule_13', keyword: 'PIZZA', categoryId: 'cat_dining', matchField: 'party' },
  { id: 'rule_14', keyword: 'BURGER', categoryId: 'cat_dining', matchField: 'party' },
  { id: 'rule_15', keyword: 'RESTAURANT', categoryId: 'cat_dining', matchField: 'party' },
  { id: 'rule_16', keyword: 'CAFE', categoryId: 'cat_dining', matchField: 'party' },
  { id: 'rule_17', keyword: 'HOTEL', categoryId: 'cat_dining', matchField: 'party' },
  { id: 'rule_18', keyword: 'GALITOS', categoryId: 'cat_dining', matchField: 'party' },
  { id: 'rule_19', keyword: 'CHICKEN INN', categoryId: 'cat_dining', matchField: 'party' },
  { id: 'rule_20', keyword: 'LOUNGE', categoryId: 'cat_dining', matchField: 'party' },
  { id: 'rule_21', keyword: 'BAR', categoryId: 'cat_dining', matchField: 'party' },

  // Utilities
  { id: 'rule_22', keyword: 'KPLC', categoryId: 'cat_utilities', matchField: 'party' },
  { id: 'rule_23', keyword: 'KENYA POWER', categoryId: 'cat_utilities', matchField: 'party' },
  { id: 'rule_24', keyword: 'STIMA', categoryId: 'cat_utilities', matchField: 'party' },
  { id: 'rule_25', keyword: 'NAIROBI WATER', categoryId: 'cat_utilities', matchField: 'party' },
  { id: 'rule_26', keyword: 'WATER', categoryId: 'cat_utilities', matchField: 'party' },
  { id: 'rule_27', keyword: 'ZUKU', categoryId: 'cat_utilities', matchField: 'party' },
  { id: 'rule_28', keyword: 'FAIBA', categoryId: 'cat_utilities', matchField: 'party' },
  { id: 'rule_29', keyword: 'SAFARICOM HOME FIBRE', categoryId: 'cat_utilities', matchField: 'party' },
  { id: 'rule_30', keyword: 'RENT', categoryId: 'cat_utilities', matchField: 'party' },

  // Transport
  { id: 'rule_31', keyword: 'UBER', categoryId: 'cat_transport', matchField: 'party' },
  { id: 'rule_32', keyword: 'BOLT', categoryId: 'cat_transport', matchField: 'party' },
  { id: 'rule_33', keyword: 'LITTLE CAB', categoryId: 'cat_transport', matchField: 'party' },
  { id: 'rule_34', keyword: 'TOTAL', categoryId: 'cat_transport', matchField: 'party' },
  { id: 'rule_35', keyword: 'RUBIS', categoryId: 'cat_transport', matchField: 'party' },
  { id: 'rule_36', keyword: 'SHELL', categoryId: 'cat_transport', matchField: 'party' },
  { id: 'rule_37', keyword: 'OLA ENERGY', categoryId: 'cat_transport', matchField: 'party' },
  { id: 'rule_38', keyword: 'PETROL', categoryId: 'cat_transport', matchField: 'party' },
  { id: 'rule_39', keyword: 'SACCO', categoryId: 'cat_transport', matchField: 'party' },
  { id: 'rule_40', keyword: 'MATATU', categoryId: 'cat_transport', matchField: 'party' },

  // Airtime
  { id: 'rule_41', keyword: 'AIRTIME', categoryId: 'cat_airtime', matchField: 'raw' },
  { id: 'rule_42', keyword: 'TUNUKIWA', categoryId: 'cat_airtime', matchField: 'raw' },
  { id: 'rule_43', keyword: 'BUNDLES', categoryId: 'cat_airtime', matchField: 'raw' },
  { id: 'rule_44', keyword: 'DATA', categoryId: 'cat_airtime', matchField: 'raw' },

  // Health
  { id: 'rule_45', keyword: 'PHARMACY', categoryId: 'cat_health', matchField: 'party' },
  { id: 'rule_46', keyword: 'CHEMIST', categoryId: 'cat_health', matchField: 'party' },
  { id: 'rule_47', keyword: 'GOODLIFE', categoryId: 'cat_health', matchField: 'party' },
  { id: 'rule_48', keyword: 'HOSPITAL', categoryId: 'cat_health', matchField: 'party' },
  { id: 'rule_49', keyword: 'CLINIC', categoryId: 'cat_health', matchField: 'party' },

  // Shopping
  { id: 'rule_50', keyword: 'JUMIA', categoryId: 'cat_shopping', matchField: 'party' },
  { id: 'rule_51', keyword: 'KILIMALL', categoryId: 'cat_shopping', matchField: 'party' },

  // Entertainment
  { id: 'rule_52', keyword: 'NETFLIX', categoryId: 'cat_entertainment', matchField: 'party' },
  { id: 'rule_53', keyword: 'SPOTIFY', categoryId: 'cat_entertainment', matchField: 'party' },
  { id: 'rule_54', keyword: 'SHOWMAX', categoryId: 'cat_entertainment', matchField: 'party' },
  { id: 'rule_55', keyword: 'CINEMA', categoryId: 'cat_entertainment', matchField: 'party' },

  // Savings / MMF / Investments
  { id: 'rule_56', keyword: 'M-SHWARI', categoryId: 'cat_savings', matchField: 'raw' },
  { id: 'rule_57', keyword: 'KCB M-PESA', categoryId: 'cat_savings', matchField: 'raw' },
  { id: 'rule_58', keyword: 'CIC ASSET', categoryId: 'cat_savings', matchField: 'party' },
  { id: 'rule_59', keyword: 'SANLAM', categoryId: 'cat_savings', matchField: 'party' },
  { id: 'rule_60', keyword: 'STANBIC', categoryId: 'cat_savings', matchField: 'party' },
  { id: 'rule_61', keyword: 'BRITAM', categoryId: 'cat_savings', matchField: 'party' },
  { id: 'rule_62', keyword: 'CHAMA', categoryId: 'cat_savings', matchField: 'party' },
];
