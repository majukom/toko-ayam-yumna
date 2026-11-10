import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import {
  isPromoActive,
  getEffectivePrice,
  getOriginalPrice,
  getDiscountPercentage,
  getPromoProgress,
  getRemainingTime,
} from '../utils/promo';
import { Zap, Clock, Flame, ChevronRight, Plus, Scissors } from 'lucide-react';

interface FlashSaleBannerProps {
  onOpenCutModal: (product: Product) => void;
}

export const FlashSaleBanner: React.FC<FlashSaleBannerProps> = ({ onOpenCutModal }) => {
  const { products, addToCart } = useApp();

  // Find all products that have an active promo
  const promoProducts = products.filter((p) => isPromoActive(p) && p.isAvailable);

  // Find earliest end time among active promos
  const earliestEndTime = promoProducts
    .map((p) => p.promo?.endTime)
    .filter(Boolean)
    .sort()[0];

  const [timeLeft, setTimeLeft] = useState(() => getRemainingTime(earliestEndTime));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getRemainingTime(earliestEndTime));
    }, 1000);

    return () => clearInterval(timer);
  }, [earliestEndTime]);

  // If no active flash sale products, do not render
  if (promoProducts.length === 0) {
    return null;
  }

  const handleProductClick = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    if (product.cutOptions && product.cutOptions.length > 0) {
      onOpenCutModal(product);
    } else {
      const effectivePrice = getEffectivePrice(product);
      const originalPrice = getOriginalPrice(product);
      addToCart({
        productId: product.id,
        name: product.name,
        category: product.category,
        price: effectivePrice,
        originalPrice,
        isPromo: true,
        unit: product.unit,
        quantity: 1,
        selectedCut: 'Tanpa Potongan',
        notes: '',
        image: product.image,
      });
    }
  };

  return (
    <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 p-4 sm:p-6 text-white shadow-xl relative border border-red-400/40 animate-in fade-in">
      {/* Background flare & glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-60 h-60 rounded-full bg-yellow-300/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-60 h-60 rounded-full bg-red-900/40 blur-3xl pointer-events-none" />

      {/* Header with Title and Real-time Countdown */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-white/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white text-red-600 flex items-center justify-center shadow-md shadow-red-950/20">
            <Flame className="w-6 h-6 fill-red-600 text-red-600 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-2xl font-black tracking-tight text-white uppercase drop-shadow-xs">
                FLASH SALE HARI INI
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-yellow-400 text-stone-950 text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-xs">
                Promo Terbatas
              </span>
            </div>
            <p className="text-xs text-rose-100 font-medium">
              Harga daging ayam & telur segar diskon khusus potong subuh!
            </p>
          </div>
        </div>

        {/* Countdown Box */}
        <div className="flex items-center gap-2 bg-black/35 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/20 shadow-xs self-stretch sm:self-auto justify-between sm:justify-start">
          <div className="flex items-center gap-1.5 text-yellow-300 text-xs font-bold">
            <Clock className="w-4 h-4 animate-spin text-yellow-300" style={{ animationDuration: '6s' }} />
            <span>Berakhir Dalam:</span>
          </div>

          <div className="flex items-center gap-1 font-mono font-black text-sm sm:text-base">
            <span className="bg-white/20 px-2 py-0.5 rounded-lg text-white shadow-2xs">
              {String(timeLeft.hours).padStart(2, '0')}
            </span>
            <span className="text-yellow-300 font-bold">:</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-lg text-white shadow-2xs">
              {String(timeLeft.minutes).padStart(2, '0')}
            </span>
            <span className="text-yellow-300 font-bold">:</span>
            <span className="bg-white/20 px-2 py-0.5 rounded-lg text-white shadow-2xs">
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      {/* Promo Products Cards Horizontal Grid */}
      <div className="relative z-10 mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {promoProducts.map((product) => {
          const originalPrice = getOriginalPrice(product);
          const effectivePrice = getEffectivePrice(product);
          const discountPct = getDiscountPercentage(originalPrice, effectivePrice);
          const soldCount = product.promo?.soldCount || 0;
          const quota = product.promo?.quota || 50;
          const progressPct = getPromoProgress(soldCount, quota);
          const hasCutOptions = product.cutOptions && product.cutOptions.length > 0;

          return (
            <div
              key={product.id}
              onClick={(e) => handleProductClick(product, e)}
              className="bg-white text-stone-900 rounded-2xl p-3 sm:p-3.5 shadow-md border border-rose-100 flex gap-3.5 items-center cursor-pointer hover:shadow-xl transition-all duration-300 group hover:-translate-y-0.5"
            >
              {/* Product Thumbnail with Discount Badge */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-1 left-1 bg-red-600 text-white font-black text-[10px] px-1.5 py-0.5 rounded-md shadow-xs">
                  -{discountPct}%
                </div>
              </div>

              {/* Product Info & Scarcity Progress Bar */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 text-[10px] font-bold text-red-600 uppercase tracking-wider">
                  <Zap className="w-3 h-3 fill-red-600 text-red-600" />
                  <span>Flash Deal</span>
                </div>

                <h4 className="font-extrabold text-stone-900 text-xs sm:text-sm truncate leading-snug group-hover:text-red-600 transition-colors">
                  {product.name}
                </h4>

                {/* Price Row: Promo Price + Harga Coret */}
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-sm sm:text-base font-black text-red-600 tracking-tight">
                    Rp {effectivePrice.toLocaleString('id-ID')}
                  </span>
                  <span className="text-xs text-stone-400 line-through font-semibold">
                    Rp {originalPrice.toLocaleString('id-ID')}
                  </span>
                </div>

                {/* Scarcity Progress Meter: Terjual XX% */}
                <div className="mt-1.5 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-red-700 flex items-center gap-0.5">
                      <Flame className="w-2.5 h-2.5 fill-red-600 text-red-600" />
                      <span>Terjual {progressPct}%</span>
                    </span>
                    <span className="text-stone-400 font-normal">
                      Sisa {Math.max(0, quota - soldCount)} {product.unit}
                    </span>
                  </div>

                  <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-500 to-red-600 rounded-full transition-all duration-500"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                {/* Quick Add CTA */}
                <div className="mt-2 flex items-center justify-between pt-1 border-t border-stone-100 text-[11px]">
                  <span className="text-stone-500 font-medium">
                    /{product.unit}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleProductClick(product, e)}
                    className="flex items-center gap-1 font-bold text-xs text-white bg-red-600 hover:bg-red-700 px-2.5 py-1 rounded-lg shadow-xs transition active:scale-95"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{hasCutOptions ? 'Pilih Potongan' : '+ Beli Promo'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
