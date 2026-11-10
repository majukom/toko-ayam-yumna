import React from 'react';
import { useApp } from '../context/AppContext';
import { RefreshCw, ChefHat, ShoppingBag } from 'lucide-react';

export const DemoRoleSwitcher: React.FC = () => {
  const { role, setRole } = useApp();

  return (
    <div className="fixed bottom-4 right-4 z-40 flex items-center gap-1.5 p-1 rounded-2xl bg-stone-900/90 backdrop-blur-md shadow-2xl border border-stone-700/80 text-white">
      <div className="hidden sm:flex items-center gap-1 px-2.5 text-[11px] font-bold text-amber-400">
        <RefreshCw className="w-3 h-3" />
        <span>Demo Switcher:</span>
      </div>

      <button
        onClick={() => setRole('PEMBELI')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
          role === 'PEMBELI'
            ? 'bg-emerald-600 text-white shadow-sm'
            : 'text-stone-300 hover:text-white hover:bg-stone-800'
        }`}
      >
        <ShoppingBag className="w-3.5 h-3.5" />
        <span>Pembeli</span>
      </button>

      <button
        onClick={() => setRole('PENJUAL')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
          role === 'PENJUAL'
            ? 'bg-amber-500 text-stone-950 shadow-sm'
            : 'text-stone-300 hover:text-white hover:bg-stone-800'
        }`}
      >
        <ChefHat className="w-3.5 h-3.5" />
        <span>Penjual (Admin)</span>
      </button>
    </div>
  );
};
