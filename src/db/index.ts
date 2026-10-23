import { Transaction, Category, SavingsGoal, CategorizationRule } from '../types';
import { DEFAULT_CATEGORIES, DEFAULT_RULES } from '../utils/defaultCategories';

const DB_NAME = 'smart_budget_db';
const DB_VERSION = 2;

class BudgetDB {
  private dbPromise: Promise<IDBDatabase>;

  constructor() {
    this.dbPromise = this.initDB();
  }

  private initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('transactions')) {
          const txStore = db.createObjectStore('transactions', { keyPath: 'id' });
          txStore.createIndex('by_date', 'date');
          txStore.createIndex('by_category', 'categoryId');
          txStore.createIndex('by_code', 'code', { unique: false });
        }

        if (!db.objectStoreNames.contains('categories')) {
          db.createObjectStore('categories', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('savingsGoals')) {
          db.createObjectStore('savingsGoals', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('rules')) {
          const ruleStore = db.createObjectStore('rules', { keyPath: 'id' });
          ruleStore.createIndex('by_keyword', 'keyword');
        }

        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };

      request.onsuccess = async () => {
        const db = request.result;
        await this.seedDefaultsIfEmpty(db);
        resolve(db);
      };

      request.onerror = () => reject(request.error);
    });
  }

  private async seedDefaultsIfEmpty(db: IDBDatabase) {
    const tx = db.transaction(['categories', 'rules'], 'readwrite');
    const catStore = tx.objectStore('categories');
    const ruleStore = tx.objectStore('rules');

    const countReq = catStore.count();
    countReq.onsuccess = () => {
      if (countReq.result === 0) {
        for (const cat of DEFAULT_CATEGORIES) {
          catStore.put(cat);
        }
        for (const rule of DEFAULT_RULES) {
          ruleStore.put(rule);
        }
      }
    };
  }

  // --- Overall Monthly Budget Setting ---
  async getOverallMonthlyBudget(): Promise<number> {
    const db = await this.dbPromise;
    return new Promise((resolve) => {
      const tx = db.transaction('settings', 'readonly');
      const store = tx.objectStore('settings');
      const req = store.get('overall_monthly_budget');
      req.onsuccess = () => {
        if (req.result && typeof req.result.value === 'number') {
          resolve(req.result.value);
        } else {
          // Check local storage fallback
          const localVal = localStorage.getItem('my_monthly_budget');
          resolve(localVal ? parseFloat(localVal) || 0 : 0);
        }
      };
      req.onerror = () => resolve(0);
    });
  }

  async setOverallMonthlyBudget(amount: number): Promise<void> {
    localStorage.setItem('my_monthly_budget', amount.toString());
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction('settings', 'readwrite');
      const store = tx.objectStore('settings');
      const req = store.put({ key: 'overall_monthly_budget', value: amount });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // --- Transactions ---

  async getTransactions(): Promise<Transaction[]> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction('transactions', 'readonly');
      const store = tx.objectStore('transactions');
      const request = store.getAll();
      request.onsuccess = () => {
        const items = request.result as Transaction[];
        items.sort((a, b) => {
          const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
          if (dateDiff !== 0) return dateDiff;
          return (b.createdAt || 0) - (a.createdAt || 0);
        });
        resolve(items);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async addTransaction(transaction: Transaction): Promise<void> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction('transactions', 'readwrite');
      const store = tx.objectStore('transactions');
      const req = store.put(transaction);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async updateTransaction(transaction: Transaction): Promise<void> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction('transactions', 'readwrite');
      const store = tx.objectStore('transactions');
      const req = store.put(transaction);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async deleteTransaction(id: string): Promise<void> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction('transactions', 'readwrite');
      const store = tx.objectStore('transactions');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // --- Categories ---

  async getCategories(): Promise<Category[]> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction('categories', 'readwrite');
      const store = tx.objectStore('categories');
      const request = store.getAll();
      request.onsuccess = () => {
        const existing = (request.result || []) as Category[];
        const existingIds = new Set(existing.map(c => c.id));
        for (const defCat of DEFAULT_CATEGORIES) {
          if (!existingIds.has(defCat.id)) {
            store.put(defCat);
            existing.push(defCat);
          }
        }
        resolve(existing);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async saveCategory(category: Category): Promise<void> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction('categories', 'readwrite');
      const store = tx.objectStore('categories');
      const req = store.put(category);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // --- Savings Goals ---

  async getSavingsGoals(): Promise<SavingsGoal[]> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction('savingsGoals', 'readonly');
      const store = tx.objectStore('savingsGoals');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async saveSavingsGoal(goal: SavingsGoal): Promise<void> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction('savingsGoals', 'readwrite');
      const store = tx.objectStore('savingsGoals');
      const req = store.put(goal);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async deleteSavingsGoal(id: string): Promise<void> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction('savingsGoals', 'readwrite');
      const store = tx.objectStore('savingsGoals');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // --- Rules ---

  async getRules(): Promise<CategorizationRule[]> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction('rules', 'readwrite');
      const store = tx.objectStore('rules');
      const request = store.getAll();
      request.onsuccess = () => {
        const existing = (request.result || []) as CategorizationRule[];
        const existingIds = new Set(existing.map(r => r.id));
        for (const defRule of DEFAULT_RULES) {
          if (!existingIds.has(defRule.id)) {
            store.put(defRule);
            existing.push(defRule);
          }
        }
        resolve(existing);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async saveRule(rule: CategorizationRule): Promise<void> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction('rules', 'readwrite');
      const store = tx.objectStore('rules');
      const req = store.put(rule);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async deleteRule(id: string): Promise<void> {
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction('rules', 'readwrite');
      const store = tx.objectStore('rules');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // --- Backup & Restore ---

  async exportAllData(): Promise<string> {
    const [transactions, categories, savingsGoals, rules, overallBudget] = await Promise.all([
      this.getTransactions(),
      this.getCategories(),
      this.getSavingsGoals(),
      this.getRules(),
      this.getOverallMonthlyBudget()
    ]);

    const backup = {
      version: 2,
      exportedAt: new Date().toISOString(),
      appName: 'MyBudget',
      overallBudget,
      data: {
        transactions,
        categories,
        savingsGoals,
        rules
      }
    };

    return JSON.stringify(backup, null, 2);
  }

  async importData(jsonString: string): Promise<boolean> {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.data) throw new Error('Invalid backup file');

      if (parsed.overallBudget !== undefined) {
        await this.setOverallMonthlyBudget(parsed.overallBudget);
      }

      const db = await this.dbPromise;
      const tx = db.transaction(['transactions', 'categories', 'savingsGoals', 'rules'], 'readwrite');

      if (parsed.data.categories) {
        const catStore = tx.objectStore('categories');
        for (const cat of parsed.data.categories) catStore.put(cat);
      }
      if (parsed.data.rules) {
        const ruleStore = tx.objectStore('rules');
        for (const r of parsed.data.rules) ruleStore.put(r);
      }
      if (parsed.data.savingsGoals) {
        const goalStore = tx.objectStore('savingsGoals');
        for (const g of parsed.data.savingsGoals) goalStore.put(g);
      }
      if (parsed.data.transactions) {
        const txStore = tx.objectStore('transactions');
        for (const t of parsed.data.transactions) txStore.put(t);
      }

      return new Promise((resolve) => {
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      });
    } catch (err) {
      console.error('Import failed', err);
      return false;
    }
  }

  async clearAllData(): Promise<void> {
    localStorage.removeItem('my_monthly_budget');
    const db = await this.dbPromise;
    return new Promise((resolve, reject) => {
      const tx = db.transaction(['transactions', 'categories', 'savingsGoals', 'rules', 'settings'], 'readwrite');
      tx.objectStore('transactions').clear();
      tx.objectStore('categories').clear();
      tx.objectStore('savingsGoals').clear();
      tx.objectStore('rules').clear();
      tx.objectStore('settings').clear();

      tx.oncomplete = async () => {
        for (const cat of DEFAULT_CATEGORIES) {
          await this.saveCategory(cat);
        }
        for (const rule of DEFAULT_RULES) {
          await this.saveRule(rule);
        }
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  }
}

export const db = new BudgetDB();
