import React, { useState } from 'react';
import { 
  Download, 
  Upload, 
  FileSpreadsheet, 
  Trash2, 
  ShieldCheck, 
  CheckCircle2, 
  Plus
} from 'lucide-react';
import { CategorizationRule, Category } from '../../types';

interface DataManagementProps {
  categories: Category[];
  rules: CategorizationRule[];
  onExportJSON: () => void;
  onImportJSON: (jsonStr: string) => void;
  onExportCSV: () => void;
  onClearAllData: () => void;
  onAddRule: (rule: CategorizationRule) => void;
  onDeleteRule: (id: string) => void;
}

export const DataManagement: React.FC<DataManagementProps> = ({
  categories,
  rules,
  onExportJSON,
  onImportJSON,
  onExportCSV,
  onClearAllData,
  onAddRule,
  onDeleteRule
}) => {
  const [newKeyword, setNewKeyword] = useState('');
  const [newCatId, setNewCatId] = useState(categories[0]?.id || 'cat_groceries');
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        onImportJSON(content);
        setStatusMsg({ text: 'Backup imported successfully!', type: 'success' });
      } catch (err) {
        setStatusMsg({ text: 'Failed to read backup file.', type: 'error' });
      }
    };
    reader.readAsText(file);
  };

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyword.trim()) return;

    const rule: CategorizationRule = {
      id: `rule_${Date.now()}`,
      keyword: newKeyword.trim().toUpperCase(),
      categoryId: newCatId,
      matchField: 'party'
    };
    onAddRule(rule);
    setNewKeyword('');
    setStatusMsg({ text: `Rule for "${rule.keyword}" added!`, type: 'success' });
  };

  const categoryMap = new Map(categories.map(c => [c.id, c]));

  return (
    <div className="space-y-6">
      {/* Privacy Banner */}
      <div className="bg-white border border-pink-100 rounded-3xl p-6 shadow-sm">
        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 rounded-2xl bg-pink-100 text-pink-600 flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-900">100% Private & Stored on Your Device</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
              Your transaction details, spending habits, and M-Pesa records are stored only on this device inside your browser's local database (`IndexedDB`). Nothing is sent to any remote server or cloud.
            </p>
          </div>
        </div>
      </div>

      {statusMsg && (
        <div className={`p-4 rounded-2xl flex items-center space-x-2 text-xs sm:text-sm font-bold border ${
          statusMsg.type === 'success' ? 'bg-pink-50 border-pink-200 text-pink-700' : 'bg-rose-50 border-rose-200 text-rose-700'
        }`}>
          <CheckCircle2 className="w-4 h-4" />
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Backup & Portability */}
      <div className="bg-white border border-pink-100 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="text-base font-black text-slate-900">Backup & Spreadsheets</h3>
        <p className="text-xs text-slate-400">
          Export your transactions anytime or create a full JSON database backup.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {/* Export JSON */}
          <button
            onClick={onExportJSON}
            className="p-4 rounded-2xl bg-pink-50/50 border border-pink-100 hover:border-pink-200 hover:bg-pink-50 flex flex-col items-center justify-center text-center group transition"
          >
            <Download className="w-6 h-6 text-pink-500 mb-2 group-hover:scale-110 transition" />
            <span className="text-xs font-bold text-slate-900">Download Backup</span>
            <span className="text-[10px] text-slate-400 mt-0.5">JSON format</span>
          </button>

          {/* Import JSON */}
          <label className="p-4 rounded-2xl bg-pink-50/50 border border-pink-100 hover:border-pink-200 hover:bg-pink-50 flex flex-col items-center justify-center text-center group transition cursor-pointer">
            <Upload className="w-6 h-6 text-pink-500 mb-2 group-hover:scale-110 transition" />
            <span className="text-xs font-bold text-slate-900">Restore Backup</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Upload JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
          </label>

          {/* Export CSV */}
          <button
            onClick={onExportCSV}
            className="p-4 rounded-2xl bg-pink-50/50 border border-pink-100 hover:border-pink-200 hover:bg-pink-50 flex flex-col items-center justify-center text-center group transition"
          >
            <FileSpreadsheet className="w-6 h-6 text-pink-500 mb-2 group-hover:scale-110 transition" />
            <span className="text-xs font-bold text-slate-900">Export CSV</span>
            <span className="text-[10px] text-slate-400 mt-0.5">Excel / Sheets compatible</span>
          </button>
        </div>

        {/* Clear Data */}
        <div className="pt-4 border-t border-pink-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-800">Clear All Transactions</span>
            <p className="text-[11px] text-slate-400">Wipes all stored spending records clean</p>
          </div>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to clear all transactions?')) {
                onClearAllData();
                setStatusMsg({ text: 'All transactions cleared.', type: 'success' });
              }
            }}
            className="px-3.5 py-1.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 text-xs font-bold transition flex items-center space-x-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset Data</span>
          </button>
        </div>
      </div>

      {/* Auto-Categorization Rules */}
      <div className="bg-white border border-pink-100 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-pink-100">
          <div>
            <h3 className="text-base font-black text-slate-900">Learned Classification Rules</h3>
            <p className="text-xs text-slate-400">
              When an M-Pesa SMS contains these keywords, it is assigned the corresponding category automatically.
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700">
            {rules.length} Rules
          </span>
        </div>

        {/* Add New Rule */}
        <form onSubmit={handleCreateRule} className="p-3.5 rounded-2xl bg-pink-50/40 border border-pink-100 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-5">
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Merchant / Keyword</label>
            <input
              type="text"
              required
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              placeholder="e.g. NAIVAS, UBER, SHELL"
              className="w-full bg-white border border-pink-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-pink-500 font-bold"
            />
          </div>

          <div className="sm:col-span-5">
            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Target Category</label>
            <select
              value={newCatId}
              onChange={(e) => setNewCatId(e.target.value)}
              className="w-full bg-white border border-pink-200 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-pink-500 font-semibold"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-black shadow-md shadow-pink-500/20 transition flex items-center justify-center space-x-1"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add</span>
            </button>
          </div>
        </form>

        {/* Rules Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-[300px] overflow-y-auto pr-1">
          {rules.map((rule) => {
            const cat = categoryMap.get(rule.categoryId);
            return (
              <div
                key={rule.id}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-pink-50/40 border border-pink-100 text-xs"
              >
                <div className="min-w-0 pr-2">
                  <span className="font-bold text-slate-800 truncate block">
                    "{rule.keyword}"
                  </span>
                  <span
                    className="text-[10px] font-bold truncate block mt-0.5"
                    style={{ color: cat?.color || '#ec4899' }}
                  >
                    &rarr; {cat?.name || 'Category'}
                  </span>
                </div>
                <button
                  onClick={() => onDeleteRule(rule.id)}
                  className="p-1 rounded text-slate-300 hover:text-rose-600 transition"
                  title="Remove rule"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
