import React, { useState, useEffect } from 'react';
import { Sparkles, Heart } from 'lucide-react';

interface WelcomeScreenProps {
  onDismiss: () => void;
  durationMs?: number;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ 
  onDismiss, 
  durationMs = 2200 
}) => {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Smooth progress bar fill
    const interval = 20;
    const step = 100 / (durationMs / interval);
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          return 100;
        }
        return prev + step;
      });
    }, interval);

    // Trigger fade out before complete dismiss
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, durationMs - 350);

    // Final dismiss
    const dismissTimer = setTimeout(() => {
      onDismiss();
    }, durationMs);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(fadeTimer);
      clearTimeout(dismissTimer);
    };
  }, [durationMs, onDismiss]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(onDismiss, 200);
  };

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-between py-12 px-6 bg-gradient-to-b from-[#fff5f8] via-[#ffeaf1] to-[#fff0f5] cursor-pointer select-none transition-all duration-300 ${
        isFadingOut ? 'opacity-0 scale-98 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{
        paddingTop: 'max(env(safe-area-inset-top, 0px), 48px)',
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 32px)'
      }}
    >
      {/* Top spacer */}
      <div className="w-full flex justify-end">
        <span className="text-[11px] font-bold text-pink-400 bg-white/70 backdrop-blur-sm px-3 py-1 rounded-full border border-pink-100 shadow-xs">
          Tap to skip
        </span>
      </div>

      {/* Center Welcome Card */}
      <div className="flex flex-col items-center text-center max-w-sm -mt-6">
        {/* Animated Icon Avatar */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-pink-500 via-rose-400 to-pink-300 flex items-center justify-center shadow-xl shadow-pink-500/30 transform transition-transform hover:scale-105 active:scale-95 animate-pulse">
            <span className="text-4xl filter drop-shadow-md">🌸</span>
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md border border-pink-100">
            <Sparkles className="w-4 h-4 text-pink-500 fill-pink-500" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2">
          My Budget
        </h1>

        {/* Subtitle / Tagline */}
        <p className="text-sm font-semibold text-pink-600 mb-1">
          Simple & Mindful Expense Tracker
        </p>
        <p className="text-xs text-slate-500 font-medium">
          M-Pesa Auto-Detection & Instant Insights
        </p>

        {/* Minimalist Progress Line */}
        <div className="w-44 h-1.5 bg-pink-200/60 rounded-full mt-8 overflow-hidden shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-pink-400 to-pink-600 rounded-full transition-all duration-75 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Footer reassurance */}
      <div className="flex items-center space-x-1.5 text-xs text-pink-400/80 font-semibold">
        <Heart className="w-3.5 h-3.5 fill-pink-300 stroke-pink-400" />
        <span>100% Private & Offline First</span>
      </div>
    </div>
  );
};
