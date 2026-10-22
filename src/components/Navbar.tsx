import React from 'react';
import { 
  LayoutDashboard, 
  ReceiptText, 
  Target, 
  Lightbulb, 
  Settings, 
  Plus, 
  Smartphone 
} from 'lucide-react';

export type ActiveTab = 'dashboard' | 'transactions' | 'budgets' | 'insights' | 'settings';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAddModal: () => void;
  onOpenPhoneModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onOpenPhoneModal
}) => {
  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'transactions' as ActiveTab, label: 'Spending', icon: ReceiptText },
    { id: 'budgets' as ActiveTab, label: 'Budgets & Goals', icon: Target },
    { id: 'insights' as ActiveTab, label: 'Insights', icon: Lightbulb },
    { id: 'settings' as ActiveTab, label: 'Settings', icon: Settings },
  ];

  return (
    <header 
      className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-pink-100 shadow-xs transition-all"
      style={{
        paddingTop: 'max(env(safe-area-inset-top, 0px), 14px)'
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-2.5 pt-1">
        <div className="flex items-center justify-between h-14">
          
          {/* Logo & Brand */}
          <div 
            className="flex items-center space-x-2.5 cursor-pointer group" 
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center shadow-md shadow-pink-500/20 group-hover:scale-105 transition">
              <span className="font-extrabold text-lg text-white">🌸</span>
            </div>
            <div>
              <span className="font-black text-lg text-slate-900 tracking-tight">My Budget</span>
              <p className="text-[11px] text-pink-600 font-semibold -mt-0.5">M-Pesa Expense Tracker</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 bg-pink-50/60 p-1 rounded-2xl border border-pink-100">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-white text-pink-600 shadow-sm border border-pink-100'
                      : 'text-slate-600 hover:text-pink-600 hover:bg-white/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-pink-500' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {/* Phone button */}
            <button
              onClick={onOpenPhoneModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 text-xs font-bold transition"
              title="Open or install on mobile phone"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Phone App</span>
            </button>

            {/* Add Transaction Button */}
            <button
              onClick={onOpenAddModal}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-extrabold shadow-md shadow-pink-500/25 transition active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add</span>
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div 
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t border-pink-100 px-3 py-2 shadow-lg"
        style={{
          paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 10px)'
        }}
      >
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center py-1 px-2 rounded-xl text-[10px] font-bold transition ${
                  isActive ? 'text-pink-600 bg-pink-50' : 'text-slate-500'
                }`}
              >
                <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'text-pink-500' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
