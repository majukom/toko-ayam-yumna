import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ProductCard } from './ProductCard';
import { ProductCutModal } from './ProductCutModal';
import { FlashSaleBanner } from './FlashSaleBanner';
import { Product } from '../types';
import {
  Search,
  Sparkles,
  ShieldCheck,
  Clock,
  Bike,
  CheckCircle2,
  Receipt,
  Scissors,
  ArrowRight,
  Filter,
} from 'lucide-react';

export const BuyerStorefront: React.FC = () => {
  const {
    products,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    orders,
    currentUser,
    setActiveReceiptOrder,
    setIsCartOpen,
  } = useApp();

  const [selectedProductForCut, setSelectedProductForCut] = useState<Product | null>(null);

  const categories = ['Semua', 'Daging Ayam', 'Telur', 'Jeroan/Lainnya'];

  // Filter products by category & search
  const filteredProducts = products.filter((p) => {
    if (activeCategory !== 'Semua' && p.category !== activeCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.cutOptions.some((c) => c.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Recent active orders for this device / user
  const latestActiveOrder = orders.find(
    (o) =>
      o.status !== 'SIAP' &&
      ((currentUser?.phone && o.customerPhone === currentUser.phone) ||
        (!currentUser && orders.length > 0))
  );

  return (
    <div className="space-y-8">
      {/* Hero Banner Section with Fresh Poultry & Eggs Background Image */}
      <section className="relative overflow-hidden rounded-3xl text-white shadow-xl min-h-[320px] sm:min-h-[380px] flex items-center border border-emerald-800/40">
        {/* Background Photo: Fresh poultry & farm eggs */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 ease-out hover:scale-102"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=1600&q=85')`,
          }}
          role="img"
          aria-label="Daging ayam segar dan telur ayam berkualitas tinggi"
        />

        {/* Multi-Layer Contrast Overlay: Rich Emerald to Charcoal/Black gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-stone-950/85 to-black/60" />
        <div className="absolute inset-0 bg-black/25 backdrop-blur-[0.5px]" />

        {/* Ambient Warm Golden & Emerald Glow */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-80 h-80 rounded-full bg-emerald-600/20 blur-3xl pointer-events-none" />

        {/* Content Box */}
        <div className="relative z-10 p-6 sm:p-10 md:p-12 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold mb-4 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Spesialis Potong Segar Subuh & Telur Berkualitas</span>
          </div>

          <h2 className="text-2xl sm:text-4xl md:text-[2.6rem] font-black tracking-tight leading-tight text-white drop-shadow-sm">
            Daging Ayam Segar, Higienis, & <span className="text-amber-400">Bebas Antre Lama</span>
          </h2>

          <p className="mt-3 text-stone-200 text-xs sm:text-sm md:text-base leading-relaxed max-w-xl font-normal drop-shadow-xs">
            Pilih jenis potongan daging ayam sesukamu (Utuh, Potong 4, 8, 12, Fillet). Pesan sekarang, pantau nomor antrean dapur secara live, ambil di toko atau kirim langsung ke rumah!
          </p>

          {/* Quick Value Badges */}
          <div className="mt-6 flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-semibold text-emerald-100">
            <div className="flex items-center gap-1.5 bg-emerald-950/70 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-emerald-600/40 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Halal & Bersih</span>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-950/70 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-emerald-600/40 shadow-xs">
              <Scissors className="w-4 h-4 text-amber-400" />
              <span>Bisa Request Potongan</span>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-950/70 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-emerald-600/40 shadow-xs">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Slot Antrean 07:00 - 12:00</span>
            </div>
          </div>
        </div>
      </section>

      {/* FLASH SALE HARI INI Banner with Countdown Timer */}
      <FlashSaleBanner onOpenCutModal={(prod) => setSelectedProductForCut(prod)} />

      {/* Customer Live Queue Tracker Banner if there is an active order */}
      {latestActiveOrder && (
        <section className="bg-amber-500/10 border-2 border-amber-500/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-stone-950 font-mono font-black text-xl flex items-center justify-center shadow-md flex-shrink-0">
              {latestActiveOrder.queueNumber}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Antrean Aktif Anda
                </span>
                <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-950 text-[10px] font-extrabold animate-pulse">
                  {latestActiveOrder.status === 'DIPOTONG'
                    ? 'Sedang Dipotong'
                    : 'Pesanan Diterima'}
                </span>
              </div>
              <p className="text-xs text-stone-700 mt-0.5 font-medium">
                Pesanan atas nama <span className="font-bold">{latestActiveOrder.customerName}</span> · Slot {latestActiveOrder.timeSlot}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveReceiptOrder(latestActiveOrder)}
            className="flex items-center gap-1.5 py-2 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-400 font-bold text-xs shadow-sm active:scale-95 transition"
          >
            <Receipt className="w-4 h-4" />
            <span>Lihat Nota & Live Progress</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </section>
      )}

      {/* Search and Category Filter Controls */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`py-2 px-4 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari ayam negeri, fillet, telur..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs"
            />
          </div>
        </div>

        {/* Catalog Grid */}
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 text-stone-400">
            <Search className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <p className="font-bold text-stone-700 text-sm">Tidak ditemukan produk</p>
            <p className="text-xs text-stone-400 mt-0.5">
              Coba kata kunci lain atau pilih kategori "Semua".
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenCutModal={(prod) => setSelectedProductForCut(prod)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Meat Cut Modal */}
      <ProductCutModal
        product={selectedProductForCut}
        onClose={() => setSelectedProductForCut(null)}
      />
    </div>
  );
};
