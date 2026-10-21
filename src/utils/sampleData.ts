import { Transaction, SavingsGoal } from '../types';

export const SAMPLE_MPESA_MESSAGES = [
  `QA12BC34DE Confirmed. Ksh1,200.00 paid to QUICK MART SUPERMARKET. on 21/10/26 at 11:15 AM. New M-PESA balance is Ksh13,300.00. Transaction cost, Ksh0.00.`,
  `RB98LK77GH Confirmed. Ksh2,450.00 sent to KPLC PREPAID for account 14288901234 on 20/10/26 at 8:00 PM. New M-PESA balance is Ksh10,850.00. Transaction cost, Ksh23.00.`,
  `TC44MN88OP Confirmed. Ksh850.00 paid to JAVA HOUSE on 20/10/26 at 1:30 PM. New M-PESA balance is Ksh10,000.00. Transaction cost, Ksh0.00.`,
  `WE33OP99QQ confirmed. You bought Ksh100.00 of airtime on 19/10/26 at 10:15 AM. New M-PESA balance is Ksh9,900.00. Transaction cost, Ksh0.00.`
];

// Completely empty default data - user starts with a clean slate
export const SAMPLE_TRANSACTIONS: Transaction[] = [];

export const SAMPLE_SAVINGS_GOALS: SavingsGoal[] = [];
