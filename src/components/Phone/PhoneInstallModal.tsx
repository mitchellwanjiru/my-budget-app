import React from 'react';
import { Smartphone, X, Copy, Check, QrCode, ExternalLink } from 'lucide-react';

interface PhoneInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  localIp: string;
}

export const PhoneInstallModal: React.FC<PhoneInstallModalProps> = ({
  isOpen,
  onClose,
  localIp
}) => {
  const [copied, setCopied] = React.useState(false);
  if (!isOpen) return null;

  const url = `http://${localIp || '192.168.1.23'}:5173`;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pink-950/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white border-2 border-pink-200 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-pink-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center flex-shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Open & Install on Your Phone</h3>
              <p className="text-xs text-slate-400">Test directly on mobile</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps */}
        <div className="space-y-3 text-xs text-slate-700">
          <div className="p-3.5 rounded-2xl bg-pink-50/70 border border-pink-100 space-y-2">
            <span className="font-bold text-slate-800">1. On your phone (connected to your Wi-Fi):</span>
            <p className="text-slate-500">Open Chrome, Safari, or Brave and go to:</p>
            <div className="flex items-center space-x-2 bg-white p-2.5 rounded-xl border border-pink-200">
              <span className="font-mono font-bold text-pink-600 text-sm truncate flex-1">{url}</span>
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 rounded-lg bg-pink-100 hover:bg-pink-200 text-pink-700 font-bold text-xs flex items-center space-x-1 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-pink-50/70 border border-pink-100 space-y-1.5">
            <span className="font-bold text-slate-800">2. Install to your Home Screen:</span>
            <ul className="list-disc list-inside space-y-1 text-slate-500">
              <li><strong>Android (Chrome):</strong> Tap the 3 dots menu &rarr; tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
              <li><strong>iPhone (Safari):</strong> Tap the Share button (square with arrow) &rarr; tap <strong>"Add to Home Screen"</strong>.</li>
            </ul>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-[11px] leading-relaxed">
            🌸 <strong>Mobile M-Pesa Test:</strong> Once on your phone, copy any real M-Pesa SMS from your messages app, switch to My Budget, and the classification pop-up will appear automatically!
          </div>
        </div>

        {/* Close Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-black shadow-md shadow-pink-500/20 transition active:scale-95"
          >
            Got It
          </button>
        </div>

      </div>
    </div>
  );
};
