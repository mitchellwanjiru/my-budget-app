# Smart Budget | Personal Finance & M-Pesa Tracker

A private, 100% offline personal budgeting application built with React, TypeScript, Tailwind CSS, and local browser `IndexedDB`. Designed to track spending, monitor saving habits, analyze areas of financial improvement, and parse M-Pesa transaction SMS messages automatically.

---

## 🌟 Key Features

### 1. 📩 Smart M-Pesa & Bank SMS Parser
- **Paste & Auto-Detect**: Paste a single SMS or an entire batch of M-Pesa notification messages.
- **Accurate Extraction**:
  - Reference Code (e.g. `QA12BC34DE`)
  - Amount & Transaction Fee (e.g. Ksh 23 tariff)
  - Date & Time
  - Merchant / Recipient / Account / Till Number
  - Running M-Pesa Balance after transaction
- **Supported Formats**:
  - Buy Goods (Till Number) payments
  - Paybill payments
  - Send Money (P2P transfers)
  - Received Money (Income)
  - Safaricom Airtime purchases
  - Agent Cash Withdrawals
- **Duplicate Prevention**: Prevents importing the same M-Pesa code twice.
- **Rule Learning**: Automatically offers to remember your category choice when editing a merchant.

### 2. 📊 Interactive Dashboard & Charts
- **Income, Spending & Net Savings**: Track real-time cash flow and savings rate percentage.
- **M-Pesa Tariff Cost Audit**: Calculates total fees paid on transactions and provides suggestions on fee-free options (e.g., using Till/Buy Goods).
- **Category Donut Chart**: Dynamic SVG visual breakdown of your highest spending areas.
- **Daily Cash Flow**: Side-by-side inflow vs. outflow activity bars.

### 3. 🎯 Budgets & Savings Goals
- **Category Monthly Limits**: Set spending caps for Groceries, Dining, Utilities, Transport, etc., with visual color-coded warnings (green, yellow, red over-budget).
- **Savings Goals Tracker**: Track targets for Emergency Funds, Vacations, Equipment, or Chamas with progress bars and 1-click deposit tracking.

### 4. 💡 "Where to Improve" Financial Insights
- **Financial Health Score (0-100)**: Evaluates spending discipline, savings rate, and fee efficiency.
- **50/30/20 Rule Analysis**: Evaluates your ratio of Needs (50%), Lifestyle Wants (30%), and Savings (20%).
- **Micro-Spending Audit ("Latte Factor")**: Detects frequent small payments under Ksh 300 (snacks, airtime) that accumulate into significant sums.
- **Actionable Advice**: Clear, personalized next steps to trim unnecessary expenses.

### 5. 🔒 100% Offline & Private
- **Zero Cloud Dependencies**: All data resides strictly in your device's browser `IndexedDB`.
- **JSON Backup & Restore**: One-click full database export and restore.
- **CSV Export**: Export transactions anytime for Excel or Google Sheets.
- **PWA Ready**: Can be installed to your desktop or mobile home screen for native-app experience.

---

