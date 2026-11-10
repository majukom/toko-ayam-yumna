import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { KitchenQueueTab } from './seller/KitchenQueueTab';
import { ProductManagementTab } from './seller/ProductManagementTab';
import { CustomerDataTab } from './seller/CustomerDataTab';
import { SalesReportTab } from './seller/SalesReportTab';
import { QuotaManagementTab } from './seller/QuotaManagementTab';
import {
  ChefHat,
  ShoppingBag,
  Package,
  Users,
  BarChart3,
  Sliders,
  LogOut,
  Store,
  Clock,
  Sparkles,
} from 'lucide-react';

export const SellerDashboard: React.FC = () => {
  const { setRole, logout, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<
    'QUEUE' | 'PRODUCTS' | 'CUSTOMERS' | 'REPORTS' | 'QUOTA'
  >('QUEUE');

  const tabs = [
    { id: 'QUEUE', label: '1. Antrean Dapur', icon: ChefHat },
    { id: 'PRODUCTS', label: '2. Manajemen Produk', icon: Package },
    { id: 'CUSTOMERS', label: '3. Data Pelanggan', icon: Users },
    { id: 'REPORTS', label: '4. Laporan Penjualan', icon: BarChart3 },
    { id: 'QUOTA', label: '5. Kelola Kuota', icon: Sliders },
  ] as const;

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col">
      {/* Seller Center Header */}
      <header className="bg-stone-900 text-white border-b border-stone-800 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">
          {/* Brand & Admin Badge */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-500 text-stone-950 font-black flex items-center justify-center shadow-md">
              <ChefHat className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Seller Center Dapur Yumna
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider">
                  Admin Dapur
                </span>
                <span className="hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Firestore Live
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                Pusat Kendali Pemotongan, Antrean, dan Penjualan Harian (toko-ayam-yumna)
              </p>
            </div>
          </div>

          {/* Quick Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setRole('PEMBELI')}
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-400 font-bold text-xs border border-stone-700 transition"
              title="Buka tampilan toko pembeli"
            >
              <Store className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lihat Tampilan Toko</span>
            </button>

            <button
              onClick={logout}
              className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-red-950/80 hover:bg-red-900 text-red-200 font-bold text-xs border border-red-800/60 transition"
              title="Keluar dari Admin Dapur"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>

        {/* 5-Tab Navigation Bar */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 overflow-x-auto">
          <nav className="flex space-x-1 sm:space-x-2 py-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    isActive
                      ? 'bg-amber-500 text-stone-950 shadow-md font-extrabold'
                      : 'text-stone-300 hover:text-white hover:bg-stone-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Tab Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        {activeTab === 'QUEUE' && <KitchenQueueTab />}
        {activeTab === 'PRODUCTS' && <ProductManagementTab />}
        {activeTab === 'CUSTOMERS' && <CustomerDataTab />}
        {activeTab === 'REPORTS' && <SalesReportTab />}
        {activeTab === 'QUOTA' && <QuotaManagementTab />}
      </main>
    </div>
  );
};
