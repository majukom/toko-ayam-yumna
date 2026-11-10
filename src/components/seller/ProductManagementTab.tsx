import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, ProductCategory, ProductPromo } from '../../types';
import {
  isPromoActive,
  getEffectivePrice,
  getOriginalPrice,
  getDiscountPercentage,
} from '../../utils/promo';
import {
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Package,
  CheckCircle2,
  XCircle,
  Scissors,
  Save,
  Zap,
  Clock,
  Flame,
  Tag,
} from 'lucide-react';

function toDateTimeLocal(dateStr?: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export const ProductManagementTab: React.FC = () => {
  const {
    products,
    updateProductPrice,
    toggleProductStock,
    addProduct,
    updateProduct,
    deleteProduct,
  } = useApp();

  // Inline price edit state
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<number>(0);

  // Modal Add / Edit product
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Basic Form State
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<ProductCategory>('Daging Ayam');
  const [formPrice, setFormPrice] = useState<number>(35000);
  const [formUnit, setFormUnit] = useState<'ekor' | 'kg' | 'butir' | 'pack'>('ekor');
  const [formCutOptionsStr, setFormCutOptionsStr] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImage, setFormImage] = useState('');

  // Flash Sale / Harga Coret Promo Form State
  const [formPromoActive, setFormPromoActive] = useState<boolean>(false);
  const [formOriginalPrice, setFormOriginalPrice] = useState<number>(35000);
  const [formDiscountPrice, setFormDiscountPrice] = useState<number>(29900);
  const [formPromoStartTime, setFormPromoStartTime] = useState<string>('');
  const [formPromoEndTime, setFormPromoEndTime] = useState<string>('');
  const [formPromoQuota, setFormPromoQuota] = useState<number>(50);
  const [formPromoSoldCount, setFormPromoSoldCount] = useState<number>(0);

  const handleStartEditPrice = (product: Product) => {
    setEditingPriceId(product.id);
    setTempPrice(product.price);
  };

  const handleSavePrice = (id: string) => {
    updateProductPrice(id, tempPrice);
    setEditingPriceId(null);
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategory('Daging Ayam');
    setFormPrice(35000);
    setFormUnit('ekor');
    setFormCutOptionsStr('Utuh Bersih, Potong 4, Potong 8, Potong 12');
    setFormDescription('Daging ayam segar pilihan berkualitas tinggi.');
    setFormImage('https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=700&q=80');

    // Promo defaults
    setFormPromoActive(false);
    setFormOriginalPrice(35000);
    setFormDiscountPrice(29900);
    const now = new Date();
    const later = new Date(now.getTime() + 6 * 3600000);
    setFormPromoStartTime(toDateTimeLocal(now.toISOString()));
    setFormPromoEndTime(toDateTimeLocal(later.toISOString()));
    setFormPromoQuota(50);
    setFormPromoSoldCount(0);

    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormCategory(product.category);
    setFormPrice(product.price);
    setFormUnit(product.unit);
    setFormCutOptionsStr(product.cutOptions.join(', '));
    setFormDescription(product.description);
    setFormImage(product.image);

    // Load existing promo settings
    if (product.promo) {
      setFormPromoActive(product.promo.isActive ?? false);
      setFormOriginalPrice(product.promo.originalPrice || product.price);
      setFormDiscountPrice(product.promo.discountPrice || Math.round(product.price * 0.85));
      setFormPromoStartTime(toDateTimeLocal(product.promo.startTime));
      setFormPromoEndTime(toDateTimeLocal(product.promo.endTime));
      setFormPromoQuota(product.promo.quota || 50);
      setFormPromoSoldCount(product.promo.soldCount || 0);
    } else {
      setFormPromoActive(false);
      setFormOriginalPrice(product.price);
      setFormDiscountPrice(Math.round(product.price * 0.85));
      const now = new Date();
      const later = new Date(now.getTime() + 6 * 3600000);
      setFormPromoStartTime(toDateTimeLocal(now.toISOString()));
      setFormPromoEndTime(toDateTimeLocal(later.toISOString()));
      setFormPromoQuota(50);
      setFormPromoSoldCount(0);
    }

    setIsModalOpen(true);
  };

  const handleQuickTogglePromo = (product: Product) => {
    const isCurrentlyActive = product.promo?.isActive ?? false;
    const originalPrice = product.promo?.originalPrice || product.price;
    const discountPrice =
      product.promo?.discountPrice || Math.round(originalPrice * 0.85);

    const updatedPromo: ProductPromo = {
      isActive: !isCurrentlyActive,
      originalPrice,
      discountPrice,
      startTime: product.promo?.startTime || new Date().toISOString(),
      endTime:
        product.promo?.endTime ||
        new Date(Date.now() + 6 * 3600000).toISOString(),
      quota: product.promo?.quota || 50,
      soldCount: product.promo?.soldCount || 0,
    };

    updateProduct({
      ...product,
      price: !isCurrentlyActive ? discountPrice : originalPrice,
      promo: updatedPromo,
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const cutOptions = formCutOptionsStr
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    // Build promo payload
    const promoPayload: ProductPromo = {
      isActive: formPromoActive,
      originalPrice: Number(formOriginalPrice) || Number(formPrice),
      discountPrice: Number(formDiscountPrice) || Number(formPrice),
      startTime: formPromoStartTime ? new Date(formPromoStartTime).toISOString() : undefined,
      endTime: formPromoEndTime ? new Date(formPromoEndTime).toISOString() : undefined,
      quota: Number(formPromoQuota) || 50,
      soldCount: Number(formPromoSoldCount) || 0,
    };

    const finalEffectivePrice = formPromoActive
      ? Number(formDiscountPrice)
      : Number(formPrice);

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        name: formName.trim(),
        category: formCategory,
        price: finalEffectivePrice,
        unit: formUnit,
        cutOptions,
        description: formDescription.trim(),
        image: formImage.trim() || editingProduct.image,
        isChickenCount:
          formCategory === 'Daging Ayam' &&
          (formUnit === 'ekor' || formName.toLowerCase().includes('ekor')),
        promo: promoPayload,
      });
    } else {
      addProduct({
        name: formName.trim(),
        category: formCategory,
        price: finalEffectivePrice,
        unit: formUnit,
        cutOptions,
        isAvailable: true,
        description: formDescription.trim(),
        image:
          formImage.trim() ||
          'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=700&q=80',
        isChickenCount: formCategory === 'Daging Ayam' && formUnit === 'ekor',
        promo: promoPayload,
      });
    }

    setIsModalOpen(false);
  };

  // Preview calculated discount percentage in modal
  const modalCalculatedDiscount = getDiscountPercentage(
    Number(formOriginalPrice),
    Number(formDiscountPrice)
  );
  const modalSavings = Math.max(0, Number(formOriginalPrice) - Number(formDiscountPrice));

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-stone-900 text-base sm:text-lg">
              Katalog Produk & Flash Sale Dapur
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-extrabold text-[10px] uppercase flex items-center gap-1">
              <Zap className="w-3 h-3 fill-red-600 text-red-600" />
              <span>Promo Diskon Aktif</span>
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Kelola harga harian ayam/telur, atur Flash Sale waktu terbatas & kuota harga coret.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-sm active:scale-95 transition"
        >
          <Plus className="w-4 h-4" />
          <span>+ Tambah Produk Baru</span>
        </button>
      </div>

      {/* Table of Products */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase font-bold text-[11px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Produk</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4">Harga / Satuan</th>
                <th className="py-3.5 px-4 text-center">Status Flash Sale</th>
                <th className="py-3.5 px-4">Opsi Potongan</th>
                <th className="py-3.5 px-4 text-center">Stok</th>
                <th className="py-3.5 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {products.map((product) => {
                const isEditingPrice = editingPriceId === product.id;
                const isPromo = isPromoActive(product);
                const effectivePrice = getEffectivePrice(product);
                const originalPrice = getOriginalPrice(product);
                const discountPct = getDiscountPercentage(originalPrice, effectivePrice);

                return (
                  <tr key={product.id} className="hover:bg-stone-50/70 transition">
                    {/* Product Name & Photo */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 rounded-xl object-cover bg-stone-100 flex-shrink-0"
                          />
                          {isPromo && (
                            <span className="absolute -top-1 -right-1 bg-red-600 text-white font-black text-[9px] px-1 rounded-sm shadow-xs">
                              -{discountPct}%
                            </span>
                          )}
                        </div>
                        <div>
                          <span className="font-bold text-stone-900 text-xs sm:text-sm block">
                            {product.name}
                          </span>
                          <span className="text-[10px] text-stone-500 line-clamp-1 max-w-xs">
                            {product.description}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-800 font-semibold text-[11px]">
                        {product.category}
                      </span>
                    </td>

                    {/* Price Display with Strike-through if promo */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {isEditingPrice ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-stone-500 font-bold">Rp</span>
                          <input
                            type="number"
                            value={tempPrice}
                            onChange={(e) => setTempPrice(Number(e.target.value))}
                            className="w-24 px-2 py-1 rounded-lg border border-emerald-500 text-xs font-bold focus:outline-none"
                            autoFocus
                          />
                          <span className="text-stone-400">/{product.unit}</span>
                          <button
                            onClick={() => handleSavePrice(product.id)}
                            className="p-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                            title="Simpan Harga"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingPriceId(null)}
                            className="p-1 rounded-lg bg-stone-200 text-stone-600 hover:bg-stone-300"
                            title="Batal"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => handleStartEditPrice(product)}
                          className="flex flex-col group cursor-pointer p-1 rounded-lg hover:bg-amber-50 w-fit"
                          title="Klik untuk ubah harga cepat"
                        >
                          <div className="flex items-baseline gap-1.5">
                            <span
                              className={`font-black text-xs sm:text-sm ${
                                isPromo ? 'text-red-600' : 'text-stone-900'
                              }`}
                            >
                              Rp {effectivePrice.toLocaleString('id-ID')}
                            </span>
                            <span className="text-stone-500 font-medium">/{product.unit}</span>
                            <Edit2 className="w-3 h-3 text-stone-400 group-hover:text-amber-600 transition" />
                          </div>

                          {/* Harga Coret if Promo */}
                          {isPromo && (
                            <span className="text-[11px] text-stone-400 line-through font-semibold">
                              Coret: Rp {originalPrice.toLocaleString('id-ID')}
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Status Flash Sale Toggle */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleQuickTogglePromo(product)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition shadow-2xs ${
                          isPromo
                            ? 'bg-red-100 text-red-800 border border-red-200 hover:bg-red-200'
                            : 'bg-stone-100 text-stone-600 border border-stone-200 hover:bg-stone-200'
                        }`}
                        title="Klik untuk mengaktifkan atau menonaktifkan Flash Sale"
                      >
                        <Zap
                          className={`w-3.5 h-3.5 ${
                            isPromo ? 'fill-red-600 text-red-600' : 'text-stone-400'
                          }`}
                        />
                        <span>{isPromo ? `Flash Sale (-${discountPct}%)` : 'Normal (Non-Promo)'}</span>
                      </button>
                      {isPromo && product.promo?.quota && (
                        <span className="block text-[10px] text-stone-500 mt-0.5">
                          Kuota: {product.promo.soldCount || 0}/{product.promo.quota} {product.unit}
                        </span>
                      )}
                    </td>

                    {/* Cut Options */}
                    <td className="py-3 px-4">
                      {product.cutOptions.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {product.cutOptions.map((opt) => (
                            <span
                              key={opt}
                              className="text-[10px] font-semibold bg-amber-50 text-amber-900 border border-amber-200/60 px-1.5 py-0.5 rounded"
                            >
                              {opt}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-stone-400 italic">
                          Tanpa Opsi Potong
                        </span>
                      )}
                    </td>

                    {/* Stock Status Toggle */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => toggleProductStock(product.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition ${
                          product.isAvailable
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                        title="Klik untuk ubah status ketersediaan"
                      >
                        {product.isAvailable ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Ready</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-red-700" />
                            <span>Habis</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEditModal(product)}
                          className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition"
                          title="Edit Produk & Promo"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus produk "${product.name}"?`)) {
                              deleteProduct(product.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition"
                          title="Hapus Produk"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal with Flash Sale Settings */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6 flex flex-col max-h-[92vh]">
            <div className="p-5 bg-stone-900 text-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base">
                  {editingProduct ? 'Edit Data Produk & Promo' : 'Tambah Produk Baru'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
              {/* Basic Fields */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Nama Produk <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Sayap Ayam Segar"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Kategori *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ProductCategory)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                  >
                    <option value="Daging Ayam">Daging Ayam</option>
                    <option value="Telur">Telur</option>
                    <option value="Jeroan/Lainnya">Jeroan/Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Satuan Jual *</label>
                  <select
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                  >
                    <option value="ekor">ekor</option>
                    <option value="kg">kg</option>
                    <option value="butir">butir</option>
                    <option value="pack">pack</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Harga Normal Standar (Rp) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={formPrice}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setFormPrice(val);
                    if (!formOriginalPrice) setFormOriginalPrice(val);
                  }}
                  placeholder="35000"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 font-bold"
                />
              </div>

              {/* ================================================================= */}
              {/* SECTION: PENGATURAN HARGA CORET & FLASH SALE PROMO */}
              {/* ================================================================= */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-red-50 via-rose-50 to-amber-50 border border-red-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-red-600 text-white">
                      <Zap className="w-4 h-4 fill-white" />
                    </div>
                    <div>
                      <span className="font-extrabold text-stone-900 text-sm block">
                        Harga Coret & Flash Sale (Promo Waktu Terbatas)
                      </span>
                      <span className="text-[11px] text-stone-500">
                        Aktifkan diskon coret untuk memicu efek diskon dan countdown
                      </span>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formPromoActive}
                      onChange={(e) => {
                        setFormPromoActive(e.target.checked);
                        if (e.target.checked && !formOriginalPrice) {
                          setFormOriginalPrice(formPrice);
                          setFormDiscountPrice(Math.round(formPrice * 0.85));
                        }
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                  </label>
                </div>

                {formPromoActive && (
                  <div className="space-y-3 pt-3 border-t border-red-200/80 animate-in fade-in">
                    {/* Discount Preview Badge */}
                    <div className="p-2.5 rounded-xl bg-white border border-red-200 flex items-center justify-between text-xs">
                      <span className="font-bold text-stone-700">Preview Diskon:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-stone-400 line-through font-semibold">
                          Rp {Number(formOriginalPrice).toLocaleString('id-ID')}
                        </span>
                        <span className="font-extrabold text-red-600 text-sm">
                          Rp {Number(formDiscountPrice).toLocaleString('id-ID')}
                        </span>
                        <span className="bg-red-600 text-white font-black px-2 py-0.5 rounded text-[11px]">
                          -{modalCalculatedDiscount}%
                        </span>
                      </div>
                    </div>

                    {/* Inputs: Harga Asli (Coret) & Harga Promo (Diskon) */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">
                          Harga Asli (Coret) (Rp) *
                        </label>
                        <input
                          type="number"
                          value={formOriginalPrice}
                          onChange={(e) => setFormOriginalPrice(Number(e.target.value))}
                          placeholder="35000"
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-500 font-bold"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-stone-700 mb-1">
                          Harga Promo (Diskon) (Rp) *
                        </label>
                        <input
                          type="number"
                          value={formDiscountPrice}
                          onChange={(e) => setFormDiscountPrice(Number(e.target.value))}
                          placeholder="29900"
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-500 font-bold text-red-700"
                        />
                      </div>
                    </div>

                    {/* Promo Times: Start & End Countdown */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-stone-700 mb-1 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-stone-500" />
                          <span>Waktu Mulai Promo</span>
                        </label>
                        <input
                          type="datetime-local"
                          value={formPromoStartTime}
                          onChange={(e) => setFormPromoStartTime(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-stone-700 mb-1 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-red-600" />
                          <span>Waktu Berakhir (Countdown)</span>
                        </label>
                        <input
                          type="datetime-local"
                          value={formPromoEndTime}
                          onChange={(e) => setFormPromoEndTime(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                    </div>

                    {/* Kuota Promo & Jumlah Terjual */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-stone-700 mb-1">
                          Batas Kuota Promo ({formUnit})
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={formPromoQuota}
                          onChange={(e) => setFormPromoQuota(Number(e.target.value))}
                          placeholder="50"
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-stone-700 mb-1">
                          Jumlah Sudah Terjual
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={formPromoSoldCount}
                          onChange={(e) => setFormPromoSoldCount(Number(e.target.value))}
                          placeholder="0"
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Opsi Potongan (Pisahkan dengan koma)
                </label>
                <input
                  type="text"
                  value={formCutOptionsStr}
                  onChange={(e) => setFormCutOptionsStr(e.target.value)}
                  placeholder="Contoh: Utuh, Potong 4, Potong 8, Potong 12 (kosongkan jika tanpa potongan)"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Jelaskan kualitas dan keunggulan daging/telur ini"
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">URL Gambar Produk</label>
                <input
                  type="url"
                  value={formImage}
                  onChange={(e) => setFormImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-stone-100 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-2.5 px-4 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{editingProduct ? 'Simpan Perubahan' : 'Tambah Produk'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
