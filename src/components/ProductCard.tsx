import React from 'react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import {
  isPromoActive,
  getEffectivePrice,
  getOriginalPrice,
  getDiscountPercentage,
  getPromoProgress,
} from '../utils/promo';
import { Plus, Scissors, CheckCircle2, XCircle, Flame, Zap } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onOpenCutModal: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenCutModal }) => {
  const { addToCart } = useApp();
  const hasCutOptions = product.cutOptions && product.cutOptions.length > 0;
  const isPromo = isPromoActive(product);
  const effectivePrice = getEffectivePrice(product);
  const originalPrice = getOriginalPrice(product);
  const discountPct = getDiscountPercentage(originalPrice, effectivePrice);
  const soldCount = product.promo?.soldCount || 0;
  const quota = product.promo?.quota || 50;
  const progressPct = getPromoProgress(soldCount, quota);

  const handleCardClick = () => {
    if (!product.isAvailable) return;
    onOpenCutModal(product);
  };

  const handleDirectAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.isAvailable) return;

    if (hasCutOptions) {
      onOpenCutModal(product);
    } else {
      addToCart({
        productId: product.id,
        name: product.name,
        category: product.category,
        price: effectivePrice,
        originalPrice: isPromo ? originalPrice : undefined,
        isPromo,
        unit: product.unit,
        quantity: 1,
        selectedCut: 'Tanpa Potongan',
        notes: '',
        image: product.image,
      });
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative bg-white rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col cursor-pointer ${
        isPromo
          ? 'border-rose-300 shadow-sm hover:shadow-xl hover:border-red-400'
          : 'border-stone-200/90 shadow-xs hover:shadow-lg'
      } ${!product.isAvailable ? 'opacity-65 grayscale-25' : ''}`}
    >
      {/* Product Image Box */}
      <div className="relative aspect-4/3 w-full bg-stone-100 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Category Unboxed Badge */}
        <div className="absolute top-2.5 left-2.5 bg-stone-900/80 backdrop-blur-xs text-white text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded-md">
          {product.category}
        </div>

        {/* FLASH SALE / DISCOUNT BADGE */}
        {isPromo && (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-gradient-to-r from-red-600 to-rose-600 text-white text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-md shadow-md animate-pulse">
            <Zap className="w-3 h-3 fill-yellow-300 text-yellow-300" />
            <span>FLASH SALE -{discountPct}%</span>
          </div>
        )}

        {/* Stock Status if NOT promo (to avoid badge sandwich) */}
        {!isPromo && (
          <div className="absolute top-2.5 right-2.5">
            {product.isAvailable ? (
              <span className="flex items-center gap-1 bg-emerald-600/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                <CheckCircle2 className="w-3 h-3" />
                <span>Ready</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 bg-red-600/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
                <XCircle className="w-3 h-3" />
                <span>Habis</span>
              </span>
            )}
          </div>
        )}

        {/* Cut indicator badge if available */}
        {hasCutOptions && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-amber-500/95 text-stone-950 text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs shadow-xs">
            <Scissors className="w-3 h-3 text-stone-950" />
            <span>Pilih Potongan ({product.cutOptions.length} Opsi)</span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 flex flex-col flex-1 justify-between gap-3">
        <div>
          <h3 className="font-bold text-stone-900 text-sm sm:text-base leading-snug group-hover:text-emerald-800 transition-colors">
            {product.name}
          </h3>
          <p className="mt-1 text-xs text-stone-500 line-clamp-2 leading-relaxed">
            {product.description}
          </p>

          {/* Flash Sale Progress Bar (Terjual XX%) */}
          {isPromo && (
            <div className="mt-2 space-y-1 bg-rose-50/70 p-2 rounded-xl border border-rose-100">
              <div className="flex items-center justify-between text-[10px] font-bold">
                <span className="text-red-700 flex items-center gap-0.5">
                  <Flame className="w-3 h-3 fill-red-600 text-red-600 animate-bounce" />
                  <span>Terjual {progressPct}%</span>
                </span>
                <span className="text-stone-400 font-normal">
                  Sisa {Math.max(0, quota - soldCount)} {product.unit}
                </span>
              </div>
              <div className="h-1.5 w-full bg-stone-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-red-600 rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Price & CTA Button */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] text-stone-400 block font-medium">
              {isPromo ? 'Harga Promo Flash Sale' : 'Harga'}
            </span>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span
                className={`text-sm sm:text-base font-extrabold tracking-tight ${
                  isPromo ? 'text-red-600' : 'text-stone-900'
                }`}
              >
                Rp {effectivePrice.toLocaleString('id-ID')}
              </span>

              {/* Harga Coret (Diskon) */}
              {isPromo && (
                <span className="text-xs text-stone-400 line-through font-bold">
                  Rp {originalPrice.toLocaleString('id-ID')}
                </span>
              )}

              <span className="text-[11px] font-semibold text-stone-500">
                /{product.unit}
              </span>
            </div>
          </div>

          <button
            type="button"
            disabled={!product.isAvailable}
            onClick={handleDirectAdd}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs shadow-xs transition active:scale-95 ${
              product.isAvailable
                ? isPromo
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : hasCutOptions
                  ? 'bg-amber-500 hover:bg-amber-600 text-stone-950'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{hasCutOptions ? 'Pilih' : isPromo ? '+ Beli Promo' : '+ Tambah'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
