import React, { useState } from 'react';
import {
  MessageSquareCode,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Save,
  ArrowLeft
} from 'lucide-react';
import { Category, CategorizationRule, ParsedMessageResult, Transaction } from '../../types';
import { parseBatchMessages } from '../../parser/mpesaParser';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { SAMPLE_MPESA_MESSAGES } from '../../utils/sampleData';

interface MessageImportProps {
  categories: Category[];
  rules: CategorizationRule[];
  onImportSuccess: (transactions: Transaction[], newRules: CategorizationRule[]) => void;
  onCancel?: () => void;
}

export const MessageImport: React.FC<MessageImportProps> = ({
  categories,
  rules,
  onImportSuccess,
  onCancel
}) => {
  const [inputText, setInputText] = useState('');
  const [parsedItems, setParsedItems] = useState<ParsedMessageResult[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Record<number, string>>({});
  const [rememberRules, setRememberRules] = useState<Record<number, boolean>>({});
  const [importStatus, setImportStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleParse = () => {
    if (!inputText.trim()) return;
    const results = parseBatchMessages(inputText, rules, categories);
    setParsedItems(results);

    // Initialize selected categories and remember rule flags
    const initialCats: Record<number, string> = {};
    const initialRules: Record<number, boolean> = {};
    results.forEach((item, index) => {
      initialCats[index] = item.suggestedCategoryId;
      initialRules[index] = false;
    });
    setSelectedCategories(initialCats);
    setRememberRules(initialRules);
    setImportStatus(null);
  };

  const handleLoadSample = () => {
    // Pick 3-4 sample M-Pesa messages
    const sampleBatch = SAMPLE_MPESA_MESSAGES.slice(0, 4).join('\n\n');
    setInputText(sampleBatch);
  };

  const handleCategoryChange = (index: number, newCatId: string) => {
    setSelectedCategories(prev => ({ ...prev, [index]: newCatId }));
    // Auto-check "remember rule" if user deliberately changed the category
    setRememberRules(prev => ({ ...prev, [index]: true }));
  };

  const handleToggleRemember = (index: number) => {
    setRememberRules(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleRemoveItem = (index: number) => {
    setParsedItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveAll = () => {
    const validItems = parsedItems.filter(item => item.isValid);
    if (validItems.length === 0) return;

    const newRulesToCreate: CategorizationRule[] = [];
    const transactionsToImport: Transaction[] = [];

    parsedItems.forEach((item, index) => {
      if (!item.isValid) return;
      const assignedCatId = selectedCategories[index] || item.suggestedCategoryId;

      const tx: Transaction = {
        id: `tx_${Date.now()}_${index}`,
        code: item.code,
        type: item.type,
        amount: item.amount,
        fee: item.fee || 0,
        currency: item.currency || 'Ksh',
        date: item.date,
        time: item.time,
        party: item.party,
        accountNumber: item.accountNumber,
        categoryId: assignedCatId,
        rawMessage: item.rawMessage,
        balanceAfter: item.balanceAfter,
        source: 'mpesa',
        createdAt: Date.now() + index
      };
      transactionsToImport.push(tx);

      // Check if user requested to remember rule for this merchant
      if (rememberRules[index] && item.party && item.party !== 'Unknown') {
        const cleanKeyword = item.party.split('(')[0].trim();
        if (cleanKeyword.length >= 3) {
          newRulesToCreate.push({
            id: `rule_${Date.now()}_${index}`,
            keyword: cleanKeyword.toUpperCase(),
            categoryId: assignedCatId,
            matchField: 'party'
          });
        }
      }
    });

    onImportSuccess(transactionsToImport, newRulesToCreate);
    setImportStatus({
      type: 'success',
      message: `Successfully imported ${transactionsToImport.length} transaction(s) into your offline database!`
    });
    setParsedItems([]);
    setInputText('');
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white border-2 border-pink-200 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5">
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="p-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 transition mr-1"
                  title="Back to Transactions"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <span className="p-2.5 rounded-2xl bg-pink-100 text-pink-600">
                <MessageSquareCode className="w-5 h-5" />
              </span>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                Smart Batch M-Pesa SMS Parser
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-2xl leading-relaxed">
              Paste multiple M-Pesa confirmation SMS texts back-to-back below. The offline parser will extract every transaction's code, merchant, date, amount, fees, and assign categories automatically.
            </p>
          </div>
          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              onClick={handleLoadSample}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 text-xs font-bold transition"
            >
              <Sparkles className="w-4 h-4 text-pink-500" />
              <span>Load Samples</span>
            </button>
            {onCancel && (
              <button
                onClick={onCancel}
                className="px-3.5 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
              >
                Close
              </button>
            )}
          </div>
        </div>

        {/* Text Input Area */}
        <div className="mt-4">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste one or more M-Pesa SMS messages here...&#10;&#10;e.g. QA12BC34DE Confirmed. Ksh1,200.00 paid to QUICK MART SUPERMARKET. on 15/10/26 at 11:15 AM. New M-PESA balance is Ksh3,300.00. Transaction cost, Ksh0.00."
            rows={5}
            className="w-full bg-pink-50/40 border border-pink-200 rounded-2xl p-3.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 font-mono transition"
          />
        </div>

        <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-[11px] text-slate-400">
            Supports Till (Buy Goods), Paybill, Send Money, Airtime, and Cash Withdrawals.
          </span>
          <button
            onClick={handleParse}
            disabled={!inputText.trim()}
            className="flex items-center justify-center space-x-2 px-5 py-2.5 rounded-2xl bg-pink-500 hover:bg-pink-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-black shadow-md shadow-pink-500/20 transition active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Parse Messages ({inputText.trim() ? 'Ready' : 'Paste SMS First'})</span>
          </button>
        </div>
      </div>

      {/* Status Alert */}
      {importStatus && (
        <div className={`p-4 rounded-2xl flex items-center space-x-3 text-xs sm:text-sm font-bold border ${importStatus.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{importStatus.message}</span>
        </div>
      )}

      {/* Parsed Preview Table */}
      {parsedItems.length > 0 && (
        <div className="bg-white border border-pink-100 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-pink-100">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center space-x-2">
                <span>Verified Parsed Transactions</span>
                <span className="px-2.5 py-0.5 rounded-full bg-pink-100 text-pink-700 text-xs font-bold">
                  {parsedItems.filter(i => i.isValid).length} ready
                </span>
              </h3>
              <p className="text-xs text-slate-400">Review and customize categories before adding to your budget</p>
            </div>

            <button
              onClick={handleSaveAll}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white text-xs sm:text-sm font-black shadow-md shadow-pink-500/25 transition active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Import All ({parsedItems.filter(i => i.isValid).length})</span>
            </button>
          </div>

          <div className="space-y-3">
            {parsedItems.map((item, index) => {
              if (!item.isValid) {
                return (
                  <div key={index} className="p-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs text-rose-700">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate max-w-md">{item.rawMessage}</span>
                    </div>
                    <span className="font-semibold text-rose-600">{item.error || 'Invalid'}</span>
                  </div>
                );
              }

              const isIncome = item.type === 'income';

              return (
                <div
                  key={index}
                  className="p-4 rounded-2xl bg-pink-50/40 border border-pink-100 hover:border-pink-200 transition space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      {item.code && (
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg bg-pink-100 text-pink-700 border border-pink-200">
                          {item.code}
                        </span>
                      )}
                      <span className="text-sm font-bold text-slate-800 truncate max-w-xs sm:max-w-md">
                        {item.party}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className={`text-base font-black ${isIncome ? 'text-emerald-600' : 'text-slate-900'}`}>
                        {isIncome ? '+' : '-'}{formatCurrency(item.amount)}
                      </span>
                      <button
                        onClick={() => handleRemoveItem(index)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Discard this item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Meta details & Category Selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center text-xs pt-2 border-t border-pink-100">
                    <div className="sm:col-span-4 flex items-center space-x-3 text-slate-400">
                      <span>{formatDate(item.date)}</span>
                      {item.time && <span>• {item.time}</span>}
                      {item.fee !== undefined && item.fee > 0 && (
                        <span className="text-amber-600 font-medium">Fee: {formatCurrency(item.fee)}</span>
                      )}
                    </div>

                    {/* Category Selector */}
                    <div className="sm:col-span-5 flex items-center space-x-2">
                      <span className="text-slate-500 font-semibold whitespace-nowrap">Category:</span>
                      <select
                        value={selectedCategories[index] || item.suggestedCategoryId}
                        onChange={(e) => handleCategoryChange(index, e.target.value)}
                        className="w-full bg-white border border-pink-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-bold focus:outline-none focus:ring-1 focus:ring-pink-500"
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name} ({cat.type})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Learn Rule Checkbox */}
                    <div className="sm:col-span-3 flex items-center justify-end">
                      <label className="flex items-center space-x-1.5 cursor-pointer text-slate-500 hover:text-slate-800">
                        <input
                          type="checkbox"
                          checked={rememberRules[index] || false}
                          onChange={() => handleToggleRemember(index)}
                          className="w-3.5 h-3.5 rounded text-pink-600 focus:ring-pink-500 border-pink-300"
                        />
                        <span className="text-[11px] font-bold">Remember Rule</span>
                      </label>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
