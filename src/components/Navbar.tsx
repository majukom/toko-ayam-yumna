import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingBag, User as UserIcon, LogOut, Receipt, ChevronDown } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    cartItemCount,
    setIsCartOpen,
    setIsBuyerAuthOpen,
    logout,
    orders,
    setActiveReceiptOrder,
    role,
  } = useApp();

  const [showUserMenu, setShowUserMenu] = useState(false);

  // Find recent active orders for this user
  const userActiveOrders = orders.filter(
    (o) =>
      o.status !== 'SIAP' &&
      (currentUser?.phone && o.customerPhone === currentUser.phone)
  );

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-3">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <div className="relative flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 p-0.5 shadow-md shadow-emerald-900/10 flex items-center justify-center">
            <img
              src="/icon.svg"
              alt="Logo Toko Ayam Potong Yumna"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-xl font-extrabold text-stone-900 tracking-tight leading-none">
                Toko Ayam Potong <span className="text-amber-600">Yumna</span>
              </h1>
            </div>
            <p className="text-[11px] sm:text-xs font-medium text-emerald-700 tracking-wide mt-0.5">
              Spesialis Daging Ayam Segar & Sedia Telur
            </p>
          </div>
        </div>

        {/* Right: Controls & Buyer Login in POJOK KANAN ATAS */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* PWA Install Button */}
          <PWAInstallButton compact />

          {/* Customer Active Queue Shortcut (if any) */}
          {userActiveOrders.length > 0 && (
            <button
              onClick={() => setActiveReceiptOrder(userActiveOrders[0])}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold hover:bg-amber-100 transition animate-pulse"
              title="Lihat status pemotongan pesanan Anda"
            >
              <Receipt className="w-3.5 h-3.5 text-amber-600" />
              <span>Antrean {userActiveOrders[0].queueNumber}</span>
            </button>
          )}

          {/* Cart Trigger */}
          {role === 'PEMBELI' && (
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 sm:p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 transition active:scale-95"
              aria-label="Buka Keranjang Belanja"
            >
              <ShoppingBag className="w-5 h-5 text-emerald-800" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-600 px-1 text-[11px] font-bold text-white shadow-sm ring-2 ring-white">
                  {cartItemCount}
                </span>
              )}
            </button>
          )}

          {/* POJOK KANAN ATAS: Akses Masuk / Daftar Pembeli */}
          {currentUser && currentUser.role === 'PEMBELI' ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-semibold hover:bg-emerald-100 transition"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] font-bold">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[90px] sm:max-w-[130px] truncate">{currentUser.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-emerald-700" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-4 py-2 border-b border-stone-100">
                    <p className="text-xs font-bold text-stone-900">{currentUser.name}</p>
                    <p className="text-[11px] text-stone-500 truncate">{currentUser.phone}</p>
                    <span className="inline-block mt-1 text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">
                      Role: Pembeli
                    </span>
                  </div>

                  {userActiveOrders.length > 0 && (
                    <div className="px-2 py-1">
                      <p className="px-2 py-1 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                        Pesanan Hari Ini
                      </p>
                      {userActiveOrders.map((ord) => (
                        <button
                          key={ord.id}
                          onClick={() => {
                            setActiveReceiptOrder(ord);
                            setShowUserMenu(false);
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs font-medium text-stone-800 hover:bg-amber-50 hover:text-amber-900 rounded-lg flex items-center justify-between"
                        >
                          <span className="font-bold text-amber-700">{ord.queueNumber}</span>
                          <span className="text-[10px] text-stone-500 capitalize">{ord.status.toLowerCase()}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="pt-1 border-t border-stone-100">
                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Keluar Akun</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setIsBuyerAuthOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-stone-950 font-bold text-xs sm:text-sm shadow-xs transition"
              id="btn-login-pembeli"
            >
              <UserIcon className="w-3.5 h-3.5 text-stone-950" />
              <span>Masuk / Daftar Pembeli</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
