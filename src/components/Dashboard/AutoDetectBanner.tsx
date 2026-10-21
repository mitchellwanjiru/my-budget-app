import React, { useState } from 'react';
import { Sparkles, ClipboardPaste, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import { parseMpesaMessage } from '../../parser/mpesaParser';
import { Category, CategorizationRule, ParsedMessageResult } from '../../types';

interface AutoDetectBannerProps {
  rules: CategorizationRule[];
  categories: Category[];
  onTriggerParsed: (result: ParsedMessageResult) => void;
  onSimulate: () => void;
}

export const AutoDetectBanner: React.FC<AutoDetectBannerProps> = ({
  rules,
  categories,
  onTriggerParsed,
  onSimulate
}) => {
  const [quickText, setQuickText] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  const handleQuickPaste = () => {
    if (!quickText.trim()) return;
    const result = parseMpesaMessage(quickText, rules, categories);
    if (result.isValid) {
      onTriggerParsed(result);
      setQuickText('');
    } else {
      alert('Could not detect an M-Pesa transaction in that text. Please ensure it contains amount and merchant.');
    }
  };

  return (
    <div className="bg-white border-2 border-pink-200 rounded-3xl p-5 shadow-sm space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-pink-500 fill-pink-500" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-extrabold text-slate-900">
                Automatic M-Pesa Transaction Listener
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Active
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Copy any M-Pesa SMS and return to this tab — a pop-up appears to let you classify and save it instantly.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0">
          <button
            onClick={onSimulate}
            className="px-3.5 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold shadow-sm shadow-pink-500/20 transition active:scale-95 flex items-center space-x-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Try Sample Pop-up</span>
          </button>
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="p-1.5 rounded-xl text-slate-400 hover:text-pink-600 hover:bg-pink-50 transition"
            title="How it works"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showHelp && (
        <div className="p-3.5 rounded-2xl bg-pink-50/60 border border-pink-100 text-xs text-slate-600 space-y-1.5 animate-in fade-in duration-150">
          <p className="font-bold text-pink-800">How Automatic Detection Works:</p>
          <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600">
            <li>When you receive an M-Pesa SMS on your phone, copy the message text.</li>
            <li>Switch to or open this Budget app in your browser.</li>
            <li>The app automatically recognizes the M-Pesa confirmation and pops up the classification modal!</li>
            <li>Tap your preferred category and confirm — it's recorded instantly into your offline database.</li>
          </ol>
        </div>
      )}

      {/* Manual fast paste bar */}
      <div className="flex items-center space-x-2 pt-1">
        <input
          type="text"
          value={quickText}
          onChange={(e) => setQuickText(e.target.value)}
          placeholder="Or paste M-Pesa message text here directly..."
          className="flex-1 bg-pink-50/50 border border-pink-200 rounded-2xl px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleQuickPaste();
          }}
        />
        <button
          onClick={handleQuickPaste}
          disabled={!quickText.trim()}
          className="px-4 py-2 rounded-2xl bg-pink-100 hover:bg-pink-200 disabled:opacity-40 disabled:cursor-not-allowed text-pink-700 text-xs font-bold transition flex items-center space-x-1"
        >
          <span>Classify</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
