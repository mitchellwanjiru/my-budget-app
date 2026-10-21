import React, { useState } from 'react';
import { 
  MessageSquareCode, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Save
} from 'lucide-react';
import { Category, CategorizationRule, ParsedMessageResult, Transaction } from '../../types';
import { parseBatchMessages } from '../../parser/mpesaParser';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { SAMPLE_MPESA_MESSAGES } from '../../utils/sampleData';

interface MessageImportProps {
  categories: Category[];
  rules: CategorizationRule[];
  onImportSuccess: (transactions: Transaction[], newRules: CategorizationRule[]) => void;
}

export const MessageImport: React.FC<MessageImportProps> = ({
  categories,
  rules,
  onImportSuccess
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
        // Strip out account details in parentheses for rule matching
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
      message: `Successfully processed ${transactionsToImport.length} transaction(s) into your offline database!`
    });
    setParsedItems([]);
    setInputText('');
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <MessageSquareCode className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-black text-white">Smart M-Pesa & SMS Message Parser</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-2xl">
              Paste your M-Pesa transaction alerts or bank notification SMS below. The intelligent parser will automatically extract the amount, date, merchant, transaction fees, and assign categories offline.
            </p>
          </div>
          <button
            onClick={handleLoadSample}
            className="flex items-center justify-center space-x-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition flex-shrink-0"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Load Sample M-Pesa SMS</span>
          </button>
        </div>

        {/* Text Input Area */}
        <div className="mt-4">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste one or more M-Pesa SMS messages here...&#10;&#10;e.g. QA12BC34DE Confirmed. Ksh1,200.00 paid to QUICK MART SUPERMARKET. on 15/10/26 at 11:15 AM. New M-PESA balance is Ksh3,300.00. Transaction cost, Ksh0.00."
            rows={5}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono transition"
          />
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Supports Paybill, Buy Goods (Till), Send Money, Airtime, Received Money, and Agent Withdrawals.
          </span>
          <button
            onClick={handleParse}
            disabled={!inputText.trim()}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 text-xs sm:text-sm font-black shadow-md shadow-emerald-500/20 transition active:scale-95"
          >
            <Sparkles className="w-4 h-4" />
            <span>Parse Messages</span>
          </button>
        </div>
      </div>

      {/* Status Alert */}
      {importStatus && (
        <div className={`p-4 rounded-xl flex items-center space-x-3 text-xs sm:text-sm font-semibold border ${
          importStatus.type === 'success' 
            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' 
            : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
        }`}>
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{importStatus.message}</span>
        </div>
      )}

      {/* Parsed Preview Table */}
      {parsedItems.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Verified Parsed Transactions</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                  {parsedItems.filter(i => i.isValid).length} ready
                </span>
              </h3>
              <p className="text-xs text-slate-400">Review and customize categories before adding to your budget</p>
            </div>

            <button
              onClick={handleSaveAll}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs sm:text-sm font-black shadow-md shadow-emerald-500/20 transition active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Import All Transactions</span>
            </button>
          </div>

          <div className="space-y-3">
            {parsedItems.map((item, index) => {
              if (!item.isValid) {
                return (
                  <div key={index} className="p-3 rounded-xl bg-rose-950/20 border border-rose-800/40 flex items-center justify-between text-xs text-rose-300">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate max-w-md">{item.rawMessage}</span>
                    </div>
                    <span className="font-semibold text-rose-400">{item.error || 'Invalid'}</span>
                  </div>
                );
              }

              const isIncome = item.type === 'income';

              return (
                <div 
                  key={index}
                  className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      {item.code && (
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {item.code}
                        </span>
                      )}
                      <span className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
                        {item.party}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className={`text-base font-black ${isIncome ? 'text-emerald-400' : 'text-slate-100'}`}>
                        {isIncome ? '+' : '-'}{formatCurrency(item.amount)}
                      </span>
                      <button
                        onClick={() => handleRemoveItem(index)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition"
                        title="Discard this item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Meta details & Category Selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center text-xs pt-2 border-t border-slate-800/60">
                    <div className="sm:col-span-4 flex items-center space-x-3 text-slate-400">
                      <span>{formatDate(item.date)}</span>
                      {item.time && <span>• {item.time}</span>}
                      {item.fee !== undefined && item.fee > 0 && (
                        <span className="text-amber-400 font-medium">Fee: {formatCurrency(item.fee)}</span>
                      )}
                    </div>

                    {/* Category Selector */}
                    <div className="sm:col-span-5 flex items-center space-x-2">
                      <span className="text-slate-400 font-semibold whitespace-nowrap">Category:</span>
                      <select
                        value={selectedCategories[index] || item.suggestedCategoryId}
                        onChange={(e) => handleCategoryChange(index, e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
                      <label className="flex items-center space-x-1.5 cursor-pointer text-slate-400 hover:text-slate-200">
                        <input
                          type="checkbox"
                          checked={rememberRules[index] || false}
                          onChange={() => handleToggleRemember(index)}
                          className="w-3.5 h-3.5 rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0"
                        />
                        <span className="text-[11px] font-medium">Remember Rule</span>
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
