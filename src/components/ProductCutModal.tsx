import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import {
  isPromoActive,
  getEffectivePrice,
  getOriginalPrice,
  getDiscountPercentage,
} from '../utils/promo';
import { X, Scissors, Plus, Minus, Check, MessageSquare, Zap } from 'lucide-react';

interface ProductCutModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductCutModal: React.FC<ProductCutModalProps> = ({ product, onClose }) => {
  const { addToCart } = useApp();
  const [quantity, setQuantity] = useState(1);
  const [selectedCut, setSelectedCut] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (product) {
      setQuantity(1);
      setNotes('');
      // Default to first cut option if available, otherwise 'Tanpa Potongan'
      if (product.cutOptions && product.cutOptions.length > 0) {
        setSelectedCut(product.cutOptions[0]);
      } else {
        setSelectedCut('Tanpa Potongan');
      }
    }
  }, [product]);

  if (!product) return null;

  const isPromo = isPromoActive(product);
  const effectivePrice = getEffectivePrice(product);
  const originalPrice = getOriginalPrice(product);
  const discountPct = getDiscountPercentage(originalPrice, effectivePrice);
  const hasCutOptions = product.cutOptions && product.cutOptions.length > 0;
  const subtotal = quantity * effectivePrice;

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      category: product.category,
      price: effectivePrice,
      originalPrice: isPromo ? originalPrice : undefined,
      isPromo,
      unit: product.unit,
      quantity,
      selectedCut: hasCutOptions ? selectedCut : 'Tanpa Potongan',
      notes: notes.trim(),
      image: product.image,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-stone-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="relative h-44 sm:h-52 w-full bg-stone-100 flex-shrink-0">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-xs transition"
          >
            <X className="w-5 h-5" />
          </button>

          {isPromo && (
            <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-black px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-md">
              <Zap className="w-3.5 h-3.5 fill-yellow-300 text-yellow-300" />
              <span>FLASH SALE -{discountPct}%</span>
            </div>
          )}

          <div className="absolute bottom-4 left-4 right-4 text-white">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
              {product.category}
            </span>
            <h3 className="text-xl font-extrabold leading-tight">{product.name}</h3>

            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-base sm:text-lg font-black text-amber-300">
                Rp {effectivePrice.toLocaleString('id-ID')}
              </span>
              {isPromo && (
                <span className="text-xs text-stone-300 line-through font-bold">
                  Rp {originalPrice.toLocaleString('id-ID')}
                </span>
              )}
              <span className="text-xs text-stone-300">
                /{product.unit}
              </span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 text-stone-800">
          <p className="text-xs text-stone-600 leading-relaxed">
            {product.description}
          </p>

          {/* Opsi Potongan Daging */}
          {hasCutOptions && (
            <div>
              <div className="flex items-center gap-1.5 mb-2.5">
                <Scissors className="w-4 h-4 text-emerald-700" />
                <label className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                  Pilih Model Potongan <span className="text-red-500">*</span>
                </label>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {product.cutOptions.map((opt) => {
                  const isSelected = selectedCut === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setSelectedCut(opt)}
                      className={`py-2 px-3 text-xs font-semibold rounded-xl border text-left transition flex items-center justify-between ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                          : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700'
                      }`}
                    >
                      <span>{opt}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Kolom Catatan Khusus */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <MessageSquare className="w-4 h-4 text-amber-600" />
              <label className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Catatan Khusus untuk Dapur (Opsional)
              </label>
            </div>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: ceker dibersihkan kuku, leher dipisah, lemak dibuang"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-stone-50/50"
            />
            <p className="text-[11px] text-stone-400 mt-1">
              Juru potong kami akan membaca instruksi ini secara teliti sebelum memotong.
            </p>
          </div>

          {/* Jumlah Item */}
          <div className="flex items-center justify-between pt-2 border-t border-stone-100">
            <div>
              <span className="text-xs font-bold text-stone-900 block">Jumlah Pesanan</span>
              <span className="text-[11px] text-stone-500">Satuan ({product.unit})</span>
            </div>
            <div className="flex items-center gap-3 bg-stone-100 p-1 rounded-2xl border border-stone-200">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-xl bg-white shadow-xs flex items-center justify-center text-stone-700 hover:bg-stone-200 transition active:scale-95 disabled:opacity-50"
                disabled={quantity <= 1}
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center text-sm font-bold text-stone-900">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-8 h-8 rounded-xl bg-white shadow-xs flex items-center justify-center text-stone-700 hover:bg-stone-200 transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer with Total & CTA */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-4 flex-shrink-0">
          <div>
            <span className="text-[11px] text-stone-500 block">Subtotal</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-extrabold text-emerald-800">
                Rp {subtotal.toLocaleString('id-ID')}
              </span>
              {isPromo && (
                <span className="text-xs text-stone-400 line-through font-bold">
                  Rp {(quantity * originalPrice).toLocaleString('id-ID')}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            className={`flex-1 py-3 px-4 rounded-2xl text-white font-bold text-xs sm:text-sm shadow-md active:scale-98 transition flex items-center justify-center gap-2 ${
              isPromo
                ? 'bg-red-600 hover:bg-red-700 shadow-red-900/10'
                : 'bg-emerald-700 hover:bg-emerald-800 shadow-emerald-900/10'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>{isPromo ? '+ Masukkan Keranjang (Promo)' : '+ Masukkan Keranjang'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
