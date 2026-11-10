import React from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Printer,
  Share2,
  CheckCircle2,
  Clock,
  Scissors,
  PackageCheck,
  Store,
  Bike,
  QrCode,
  AlertCircle,
  Copy,
} from 'lucide-react';

export const DigitalReceiptModal: React.FC = () => {
  const { activeReceiptOrder, setActiveReceiptOrder } = useApp();

  if (!activeReceiptOrder) return null;

  const order = activeReceiptOrder;
  const isAmbil = order.deliveryType === 'AMBIL';

  // 3-Stage Progress: [1. Pesanan Diterima] -> [2. Sedang Dipotong] -> [3. Siap Diambil / Pengiriman]
  const stages = [
    { key: 'DITERIMA', label: '1. Pesanan Diterima', desc: 'Antrean diverifikasi staf' },
    { key: 'DIPOTONG', label: '2. Sedang Dipotong', desc: 'Dikerjakan di dapur potong' },
    {
      key: 'SIAP',
      label: isAmbil ? '3. Siap Diambil' : '3. Siap Pengiriman',
      desc: isAmbil ? 'Silakan ambil di kios Yumna' : 'Kurir mengantar ke alamat',
    },
  ];

  const currentStageIndex =
    order.status === 'SIAP' ? 2 : order.status === 'DIPOTONG' ? 1 : 0;

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const itemsList = order.items
      .map(
        (i, idx) =>
          `${idx + 1}. *${i.name}* (${i.quantity} ${i.unit}) - ${i.selectedCut}${
            i.notes ? `\n   Catatan: _"${i.notes}"_` : ''
          }`
      )
      .join('\n');

    const message = `*NOTA PEMESANAN TOKO AYAM POTONG YUMNA*
================================
*No Antrean: ${order.queueNumber}*
*ID Pesanan:* ${order.id}
*Nama Pemesan:* ${order.customerName}
*No. WhatsApp:* ${order.customerPhone}
*Metode:* ${isAmbil ? 'Ambil Sendiri di Toko' : 'Dikirim ke Rumah (Delivery)'}
*Slot Jam:* ${order.timeSlot}
${order.deliveryAddress ? `*Alamat:* ${order.deliveryAddress}\n` : ''}${
      order.deliveryNotes ? `*Catatan Rumah:* ${order.deliveryNotes}\n` : ''
    }
*Rincian Pesanan:*
${itemsList}

*Total Biaya:* Rp ${order.totalAmount.toLocaleString('id-ID')}
*Metode Bayar:* ${order.paymentMethod}
*Status:* ${
      order.status === 'SIAP'
        ? 'Siap Diambil/Kirim'
        : order.status === 'DIPOTONG'
        ? 'Sedang Dipotong di Dapur'
        : 'Pesanan Diterima'
    }
================================
Terima kasih telah memesan daging ayam segar & telur di Toko Ayam Potong Yumna!`;

    const encoded = encodeURIComponent(message);
    const sellerWaNumber = '6281234567890';
    window.open(`https://wa.me/${sellerWaNumber}?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-6">
        {/* Header Bar */}
        <div className="p-4 bg-emerald-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-400 text-stone-900 font-extrabold flex items-center justify-center text-xs">
              Y
            </div>
            <span className="font-bold text-sm tracking-wide">
              Nota Digital Toko Ayam Potong Yumna
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition"
              title="Cetak Nota"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveReceiptOrder(null)}
              className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Big Queue Card Banner */}
        <div className="p-6 bg-gradient-to-b from-stone-50 to-white text-center border-b border-stone-100">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-widest block">
            Nomor Antrean Anda
          </span>
          <div className="mt-1 inline-block px-6 py-2 rounded-2xl bg-amber-500 text-stone-950 shadow-md border-2 border-amber-600">
            <span className="text-4xl sm:text-5xl font-black tracking-tight font-mono">
              {order.queueNumber}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-center gap-2 text-xs font-bold text-stone-700">
            {isAmbil ? (
              <span className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                <Store className="w-3.5 h-3.5" />
                <span>Ambil Langsung di Toko</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-blue-800 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                <Bike className="w-3.5 h-3.5" />
                <span>Pengiriman Kurir ke Rumah</span>
              </span>
            )}
            <span className="flex items-center gap-1.5 text-amber-900 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Slot: {order.timeSlot}</span>
            </span>
          </div>
        </div>

        {/* 3-Stage Progress Bar */}
        <div className="p-6 bg-stone-50/60 border-b border-stone-200">
          <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block mb-4">
            Live Status Pengerjaan Dapur:
          </span>

          <div className="relative">
            {/* Horizontal Line */}
            <div className="absolute top-4 left-6 right-6 h-1 bg-stone-200 -z-0">
              <div
                className="h-full bg-emerald-600 transition-all duration-500"
                style={{
                  width: `${(currentStageIndex / (stages.length - 1)) * 100}%`,
                }}
              />
            </div>

            {/* Stages */}
            <div className="flex items-start justify-between relative z-10">
              {stages.map((stage, idx) => {
                const isPassed = idx <= currentStageIndex;
                const isCurrent = idx === currentStageIndex;

                return (
                  <div key={stage.key} className="flex flex-col items-center text-center max-w-[100px]">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                        isPassed
                          ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                          : 'bg-white text-stone-400 border-2 border-stone-300'
                      }`}
                    >
                      {idx === 0 ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : idx === 1 ? (
                        <Scissors className="w-4 h-4" />
                      ) : (
                        <PackageCheck className="w-4 h-4" />
                      )}
                    </div>
                    <span
                      className={`text-[11px] font-bold mt-2 leading-tight ${
                        isCurrent ? 'text-emerald-800' : isPassed ? 'text-stone-800' : 'text-stone-400'
                      }`}
                    >
                      {stage.label}
                    </span>
                    <span className="text-[10px] text-stone-500 mt-0.5 leading-snug">
                      {stage.desc}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order Details & Items */}
        <div className="p-6 space-y-4 max-h-[35vh] overflow-y-auto">
          {/* Buyer info */}
          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-stone-500">Nama Pemesan:</span>
              <span className="font-bold text-stone-900">{order.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">WhatsApp:</span>
              <span className="font-bold text-stone-900">{order.customerPhone}</span>
            </div>
            {order.deliveryAddress && (
              <div className="pt-1 border-t border-stone-200">
                <span className="text-stone-500 block">Alamat Pengiriman:</span>
                <span className="font-medium text-stone-800">{order.deliveryAddress}</span>
                {order.deliveryNotes && (
                  <p className="text-[11px] text-stone-500 italic mt-0.5">
                    Patokan: {order.deliveryNotes}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Items List */}
          <div>
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block mb-2">
              Rincian Daging & Telur:
            </span>
            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl border border-stone-200 bg-white flex items-start justify-between gap-2 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-stone-900">
                        {item.name} × {item.quantity} {item.unit}
                      </span>
                      {item.isPromo && (
                        <span className="text-[9px] font-black bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                          PROMO
                        </span>
                      )}
                    </div>
                    {item.selectedCut && item.selectedCut !== 'Tanpa Potongan' && (
                      <p className="text-[11px] text-amber-800 font-semibold flex items-center gap-1 mt-0.5">
                        <Scissors className="w-3 h-3 text-amber-600" />
                        <span>Potongan: {item.selectedCut}</span>
                      </p>
                    )}
                    {item.notes && (
                      <p className="text-[11px] text-stone-500 italic mt-0.5">
                        Catatan: "{item.notes}"
                      </p>
                    )}
                  </div>
                  <span className="font-bold text-stone-900 flex-shrink-0">
                    Rp {item.subtotal.toLocaleString('id-ID')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* QRIS / Payment Instruction if QRIS */}
          {order.paymentMethod === 'QRIS' && (
            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
              <span className="text-xs font-bold text-emerald-900 block mb-1">
                Pembayaran via QRIS Toko Ayam Yumna
              </span>
              <p className="text-[11px] text-emerald-700 mb-2">
                Pindai kode QRIS menggunakan GoPay, OVO, Dana, BCA, atau mobile banking:
              </p>
              <div className="inline-block p-2 bg-white rounded-xl shadow-xs border border-emerald-200">
                <img
                  src="https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=TOKO_AYAM_YUMNA_TOTAL_RP_"
                  alt="QRIS Toko Yumna"
                  className="w-28 h-28 object-contain"
                />
              </div>
              <p className="text-[10px] text-stone-500 mt-1 font-mono">
                NMID: ID1020261110099
              </p>
            </div>
          )}

          {/* Total Row */}
          <div className="pt-2 border-t border-stone-200 flex justify-between items-center text-sm">
            <span className="font-bold text-stone-700">Total Tagihan:</span>
            <span className="text-lg font-black text-emerald-800">
              Rp {order.totalAmount.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleWhatsAppShare}
            className="flex-1 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-sm active:scale-98 transition flex items-center justify-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            <span>Kirim Nota ke WhatsApp Toko</span>
          </button>

          <button
            onClick={() => setActiveReceiptOrder(null)}
            className="py-3 px-5 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 font-bold text-xs transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
