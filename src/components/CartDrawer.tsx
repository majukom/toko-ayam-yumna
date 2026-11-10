import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DeliveryType, PaymentMethod } from '../types';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Store,
  Bike,
  Clock,
  CreditCard,
  Banknote,
  QrCode,
  ArrowRight,
  AlertCircle,
  Scissors,
  CheckCircle2,
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    cartTotal,
    cartItemCount,
    isCartOpen,
    setIsCartOpen,
    updateCartQuantity,
    removeCartItem,
    clearCart,
    placeOrder,
    timeSlots,
    getSlotUsage,
    currentUser,
  } = useApp();

  const [step, setStep] = useState<'CART' | 'CHECKOUT'>('CART');

  // Checkout form fields
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('AMBIL');
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [deliveryAddress, setDeliveryAddress] = useState(currentUser?.address || '');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(timeSlots[0]?.slot || '07:00 - 08:00');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('QRIS');
  const [formError, setFormError] = useState<string | null>(null);

  // Sync user info if user logs in while cart is open
  React.useEffect(() => {
    if (currentUser) {
      if (!customerName) setCustomerName(currentUser.name);
      if (!customerPhone) setCustomerPhone(currentUser.phone);
      if (!deliveryAddress && currentUser.address) setDeliveryAddress(currentUser.address);
    }
  }, [currentUser]);

  if (!isCartOpen) return null;

  const handleClose = () => {
    setIsCartOpen(false);
    setStep('CART');
    setFormError(null);
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!customerName.trim()) {
      setFormError('Mohon isi nama lengkap pemesan.');
      return;
    }
    if (!customerPhone.trim() || customerPhone.trim().length < 8) {
      setFormError('Mohon masukkan nomor WhatsApp yang valid.');
      return;
    }
    if (deliveryType === 'DELIVERY' && !deliveryAddress.trim()) {
      setFormError('Mohon masukkan alamat lengkap pengiriman.');
      return;
    }

    // Check slot quota
    const currentUsage = getSlotUsage(selectedSlot);
    const targetSlotConfig = timeSlots.find((s) => s.slot === selectedSlot);
    const maxQuota = targetSlotConfig?.maxQuota ?? 10;
    if (currentUsage >= maxQuota || targetSlotConfig?.isClosed) {
      setFormError(`Slot antrean jam ${selectedSlot} sudah penuh. Silakan pilih slot lainnya.`);
      return;
    }

    // Place the order
    await placeOrder({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      deliveryType,
      deliveryAddress: deliveryType === 'DELIVERY' ? deliveryAddress.trim() : undefined,
      deliveryNotes: deliveryType === 'DELIVERY' ? deliveryNotes.trim() : undefined,
      timeSlot: selectedSlot,
      paymentMethod,
    });

    setIsCartOpen(false);
    setStep('CART');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      {/* Drawer Container */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-stone-200">
          {/* Header */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-900 to-emerald-800 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-white/10 text-amber-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base sm:text-lg leading-tight">
                  {step === 'CART' ? 'Keranjang Belanja' : 'Form Checkout Pesanan'}
                </h3>
                <p className="text-[11px] text-emerald-200">
                  {step === 'CART'
                    ? `${cartItemCount} item pilihan Anda`
                    : 'Konfirmasi rincian pengiriman & nomor antrean'}
                </p>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="p-1.5 rounded-full text-stone-300 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Stepper Navigation */}
          {cart.length > 0 && (
            <div className="flex border-b border-stone-200 bg-stone-50 text-xs font-bold">
              <button
                type="button"
                onClick={() => setStep('CART')}
                className={`flex-1 py-2.5 text-center transition ${
                  step === 'CART'
                    ? 'border-b-2 border-emerald-700 text-emerald-900 bg-white'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                1. Daftar Item ({cartItemCount})
              </button>
              <button
                type="button"
                onClick={() => setStep('CHECKOUT')}
                className={`flex-1 py-2.5 text-center transition ${
                  step === 'CHECKOUT'
                    ? 'border-b-2 border-emerald-700 text-emerald-900 bg-white'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                2. Pengiriman & Antrean
              </button>
            </div>
          )}

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-stone-400">
                <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mb-3">
                  <ShoppingBag className="w-8 h-8 text-stone-300" />
                </div>
                <h4 className="font-bold text-stone-700 text-sm">Keranjang Anda Masih Kosong</h4>
                <p className="text-xs text-stone-400 mt-1 max-w-xs">
                  Pilih ayam segar atau telur favorit Anda dari etalase untuk memesan.
                </p>
                <button
                  onClick={handleClose}
                  className="mt-5 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition"
                >
                  Lihat Menu Ayam & Telur
                </button>
              </div>
            ) : step === 'CART' ? (
              /* Step 1: Items List */
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                    Item dalam Keranjang
                  </span>
                  <button
                    onClick={clearCart}
                    className="text-[11px] text-red-600 hover:text-red-700 font-semibold flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Kosongkan</span>
                  </button>
                </div>

                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 flex gap-3 items-start"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-xl object-cover bg-stone-200 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="font-bold text-stone-900 text-xs sm:text-sm truncate">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeCartItem(item.id)}
                          className="text-stone-400 hover:text-red-600 p-0.5"
                          title="Hapus"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Cut Option Tag */}
                      {item.selectedCut && item.selectedCut !== 'Tanpa Potongan' && (
                        <div className="flex items-center gap-1 mt-0.5 text-[11px] text-amber-800 font-semibold bg-amber-100/70 px-1.5 py-0.5 rounded w-fit">
                          <Scissors className="w-3 h-3 text-amber-700" />
                          <span>{item.selectedCut}</span>
                        </div>
                      )}

                      {/* Notes if any */}
                      {item.notes && (
                        <p className="text-[11px] text-stone-500 italic mt-0.5 line-clamp-1">
                          "{item.notes}"
                        </p>
                      )}

                      {/* Quantity & Subtotal */}
                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-stone-200/60">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-emerald-800">
                            Rp {item.subtotal.toLocaleString('id-ID')}
                          </span>
                          {item.originalPrice && item.originalPrice > item.price && (
                            <span className="text-[10px] text-stone-400 line-through font-semibold">
                              Coret: Rp {(item.quantity * item.originalPrice).toLocaleString('id-ID')}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 bg-white rounded-lg border border-stone-200 px-1 py-0.5">
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.id, -1)}
                            className="p-1 hover:bg-stone-100 rounded text-stone-600"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold text-stone-800 px-1">
                            {item.quantity} {item.unit}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateCartQuantity(item.id, 1)}
                            className="p-1 hover:bg-stone-100 rounded text-stone-600"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Step 2: Checkout Form */
              <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="space-y-4">
                {formError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* 1. Opsi Penyerahan: Ambil Sendiri vs Delivery */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider">
                    Metode Penyerahan <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 rounded-2xl border border-stone-200">
                    <button
                      type="button"
                      onClick={() => setDeliveryType('AMBIL')}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition ${
                        deliveryType === 'AMBIL'
                          ? 'bg-emerald-700 text-white shadow-sm'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      <Store className="w-4 h-4" />
                      <span>Ambil di Toko</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryType('DELIVERY')}
                      className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition ${
                        deliveryType === 'DELIVERY'
                          ? 'bg-emerald-700 text-white shadow-sm'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      <Bike className="w-4 h-4" />
                      <span>Dikirim (Delivery)</span>
                    </button>
                  </div>
                </div>

                {/* 2. Identitas Pemesan */}
                <div className="space-y-3 bg-stone-50 p-3.5 rounded-2xl border border-stone-200/80">
                  <span className="text-xs font-bold text-stone-800 block">Identitas Pemesan</span>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      Nama Lengkap Pemesan *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Contoh: Ibu Ratna Susanti"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                      Nomor WhatsApp Aktif *
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="0812-XXXX-XXXX"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                    <p className="text-[10px] text-stone-400 mt-1">
                      Nomor antrean dan konfirmasi pesanan akan dikirim ke nomor ini.
                    </p>
                  </div>
                </div>

                {/* 3. Alamat Kirim (Hanya jika Delivery) */}
                {deliveryType === 'DELIVERY' && (
                  <div className="space-y-3 bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200/80 animate-in fade-in">
                    <div className="flex items-center gap-1.5">
                      <Bike className="w-4 h-4 text-amber-700" />
                      <span className="text-xs font-bold text-amber-950">
                        Alamat Pengiriman Rumah
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                        Alamat Lengkap *
                      </label>
                      <textarea
                        required
                        rows={2}
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, patokan pagar"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                        Catatan Pengiriman / Rumah (Opsional)
                      </label>
                      <input
                        type="text"
                        value={deliveryNotes}
                        onChange={(e) => setDeliveryNotes(e.target.value)}
                        placeholder="Contoh: Bel rumah rusak, tolong panggil dari luar"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                )}

                {/* 4. Pilihan Slot Jam Antrean */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-emerald-700" />
                      <label className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                        Pilih Slot Jam Antrean *
                      </label>
                    </div>
                    <span className="text-[10px] text-stone-500">Maks 10 Pesanan / Slot</span>
                  </div>

                  <div className="space-y-2">
                    {timeSlots.map((ts) => {
                      const usage = getSlotUsage(ts.slot);
                      const isFull = usage >= ts.maxQuota || ts.isClosed;
                      const isSelected = selectedSlot === ts.slot;

                      return (
                        <button
                          key={ts.slot}
                          type="button"
                          disabled={isFull}
                          onClick={() => setSelectedSlot(ts.slot)}
                          className={`w-full p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-xs'
                              : isFull
                              ? 'border-stone-200 bg-stone-100 text-stone-400 cursor-not-allowed opacity-60'
                              : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50 font-medium'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-700' : 'text-stone-400'}`} />
                            <span className="text-xs">{ts.slot}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {isFull ? (
                              <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded">
                                Penuh
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded">
                                Sisa {ts.maxQuota - usage} kuota
                              </span>
                            )}
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-700" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 5. Opsi Pembayaran */}
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1.5 uppercase tracking-wider">
                    Metode Pembayaran *
                  </label>
                  <div className="space-y-2">
                    <label
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                        paymentMethod === 'QRIS'
                          ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950'
                          : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === 'QRIS'}
                          onChange={() => setPaymentMethod('QRIS')}
                          className="accent-emerald-700"
                        />
                        <QrCode className="w-4 h-4 text-emerald-700" />
                        <div>
                          <span className="text-xs font-bold block">QRIS / Transfer Bank</span>
                          <span className="text-[10px] text-stone-500">BCA, Mandiri, GoPay, OVO, Dana</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        Praktis
                      </span>
                    </label>

                    <label
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                        paymentMethod === 'COD'
                          ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950'
                          : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === 'COD'}
                          onChange={() => setPaymentMethod('COD')}
                          className="accent-emerald-700"
                        />
                        <Banknote className="w-4 h-4 text-amber-600" />
                        <div>
                          <span className="text-xs font-bold block">Bayar Tunai / COD</span>
                          <span className="text-[10px] text-stone-500">Bayar di kios atau saat kurir tiba</span>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* Footer Actions */}
          {cart.length > 0 && (() => {
            const totalSavings = cart.reduce((acc, curr) => {
              if (curr.originalPrice && curr.originalPrice > curr.price) {
                return acc + (curr.originalPrice - curr.price) * curr.quantity;
              }
              return acc;
            }, 0);

            return (
              <div className="p-4 bg-stone-50 border-t border-stone-200 space-y-3">
                {totalSavings > 0 && (
                  <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-red-50 border border-red-200 text-red-800 font-bold">
                    <span>🎉 Total Hemat Promo Flash Sale:</span>
                    <span>- Rp {totalSavings.toLocaleString('id-ID')}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-stone-500">Total Pembayaran:</span>
                  <span className="text-lg font-black text-stone-900 tracking-tight">
                    Rp {cartTotal.toLocaleString('id-ID')}
                  </span>
                </div>

              {step === 'CART' ? (
                <button
                  type="button"
                  onClick={() => setStep('CHECKOUT')}
                  className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md shadow-emerald-900/10 active:scale-98 transition flex items-center justify-center gap-2"
                >
                  <span>Lanjut ke Formulir Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStep('CART')}
                    className="py-3 px-4 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 font-bold text-xs transition"
                  >
                    Kembali
                  </button>
                  <button
                    type="submit"
                    form="checkout-form"
                    className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-extrabold text-xs sm:text-sm shadow-md active:scale-98 transition flex items-center justify-center gap-2"
                  >
                    <span>Konfirmasi & Dapatkan Nomor Antrean</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};
