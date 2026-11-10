import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus } from '../../types';
import {
  Scissors,
  CheckCircle2,
  Clock,
  Store,
  Bike,
  MessageCircle,
  Search,
  Filter,
  AlertCircle,
  Check,
  ChevronRight,
} from 'lucide-react';

export const KitchenQueueTab: React.FC = () => {
  const { orders, updateOrderStatus, timeSlots } = useApp();
  const [selectedSlotFilter, setSelectedSlotFilter] = useState<string>('SEMUA');
  const [statusFilter, setStatusFilter] = useState<'SEMUA' | OrderStatus>('SEMUA');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    if (selectedSlotFilter !== 'SEMUA' && order.timeSlot !== selectedSlotFilter) {
      return false;
    }
    if (statusFilter !== 'SEMUA' && order.status !== statusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchQueue = order.queueNumber.toLowerCase().includes(q);
      const matchName = order.customerName.toLowerCase().includes(q);
      const matchPhone = order.customerPhone.includes(q);
      if (!matchQueue && !matchName && !matchPhone) return false;
    }
    return true;
  });

  const countDiterima = orders.filter((o) => o.status === 'DITERIMA').length;
  const countDipotong = orders.filter((o) => o.status === 'DIPOTONG').length;
  const countSiap = orders.filter((o) => o.status === 'SIAP').length;

  const handleOpenWhatsApp = (order: Order) => {
    const text = encodeURIComponent(
      `Halo Kak *${order.customerName}*, dari Toko Ayam Potong Yumna. Pesanan antrean *${order.queueNumber}* Anda dengan status: *${
        order.status === 'SIAP'
          ? 'SUDAH SIAP'
          : order.status === 'DIPOTONG'
          ? 'SEDANG DIPOTONG'
          : 'DITERIMA'
      }*. Terima kasih!`
    );
    window.open(`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Stat Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
            Total Antrean Masuk
          </span>
          <span className="text-2xl font-black text-stone-900 mt-1 block">
            {orders.length}
          </span>
        </div>

        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 shadow-xs">
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
            Menunggu Potong
          </span>
          <span className="text-2xl font-black text-amber-900 mt-1 block">
            {countDiterima}
          </span>
        </div>

        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 shadow-xs">
          <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">
            Sedang Dipotong
          </span>
          <span className="text-2xl font-black text-blue-900 mt-1 block">
            {countDipotong}
          </span>
        </div>

        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
            Siap Diambil / Kirim
          </span>
          <span className="text-2xl font-black text-emerald-900 mt-1 block">
            {countSiap}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nomor antrean (#A-01), nama pemesan, atau nomor WA..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-stone-50/50"
          />
        </div>

        {/* Slot Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-bold text-stone-500 whitespace-nowrap">Slot Jam:</span>
          <select
            value={selectedSlotFilter}
            onChange={(e) => setSelectedSlotFilter(e.target.value)}
            className="text-xs font-semibold py-2 px-3 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            <option value="SEMUA">Semua Slot Jam</option>
            {timeSlots.map((ts) => (
              <option key={ts.slot} value={ts.slot}>
                {ts.slot}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl">
          {(['SEMUA', 'DITERIMA', 'DIPOTONG', 'SIAP'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                statusFilter === st
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              {st === 'SEMUA'
                ? 'Semua'
                : st === 'DITERIMA'
                ? 'Menunggu'
                : st === 'DIPOTONG'
                ? 'Dipotong'
                : 'Siap'}
            </button>
          ))}
        </div>
      </div>

      {/* Queue Cards Grid */}
      {filteredOrders.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 text-stone-400">
          <Clock className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h4 className="font-bold text-stone-700 text-base">Tidak Ada Antrean yang Cocok</h4>
          <p className="text-xs text-stone-400 mt-1">
            Ubah filter slot jam atau kata kunci pencarian Anda.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredOrders.map((order) => {
            const isAmbil = order.deliveryType === 'AMBIL';

            return (
              <div
                key={order.id}
                className={`bg-white rounded-2xl border transition-all p-5 shadow-xs flex flex-col justify-between ${
                  order.status === 'DIPOTONG'
                    ? 'border-blue-400 ring-2 ring-blue-100'
                    : order.status === 'DITERIMA'
                    ? 'border-amber-300 bg-amber-50/20'
                    : 'border-stone-200'
                }`}
              >
                <div>
                  {/* Card Header: Queue Number + Badges */}
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-stone-100">
                    <div className="flex items-center gap-3">
                      <div className="px-3.5 py-1.5 rounded-xl bg-stone-900 text-amber-400 font-mono font-black text-xl shadow-xs">
                        {order.queueNumber}
                      </div>

                      <div>
                        <h4 className="font-extrabold text-stone-900 text-sm sm:text-base leading-tight">
                          {order.customerName}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-stone-500">
                          <span>{order.customerPhone}</span>
                          <button
                            onClick={() => handleOpenWhatsApp(order)}
                            className="p-1 text-emerald-700 hover:text-emerald-900 rounded bg-emerald-50 hover:bg-emerald-100 transition"
                            title="Chat WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] font-bold text-stone-700 bg-stone-100 px-2.5 py-1 rounded-lg block w-fit ml-auto">
                        {order.timeSlot}
                      </span>
                      <span className="text-[10px] text-stone-400 mt-1 block">
                        {new Date(order.createdAt).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        WIB
                      </span>
                    </div>
                  </div>

                  {/* Delivery & Address Info */}
                  <div className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      {isAmbil ? (
                        <span className="flex items-center gap-1 font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                          <Store className="w-3.5 h-3.5" />
                          <span>Ambil di Toko</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded">
                          <Bike className="w-3.5 h-3.5" />
                          <span>Delivery</span>
                        </span>
                      )}
                      <span className="font-semibold text-stone-500">
                        Bayar: {order.paymentMethod}
                      </span>
                    </div>

                    <span className="font-extrabold text-stone-900">
                      Rp {order.totalAmount.toLocaleString('id-ID')}
                    </span>
                  </div>

                  {/* Delivery Address if delivery */}
                  {order.deliveryAddress && (
                    <div className="p-2.5 bg-stone-50 rounded-xl text-xs text-stone-600 mb-3 border border-stone-100">
                      <p className="font-semibold text-stone-800">Alamat Kirim:</p>
                      <p className="text-[11px] mt-0.5">{order.deliveryAddress}</p>
                      {order.deliveryNotes && (
                        <p className="text-[10px] text-amber-800 italic mt-0.5">
                          Patokan: "{order.deliveryNotes}"
                        </p>
                      )}
                    </div>
                  )}

                  {/* Items & Cut Instructions - CRITICAL FOR KITCHEN BUTCHER */}
                  <div className="space-y-2 mt-2">
                    <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                      Instruksi Dapur Potong:
                    </span>
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/90 text-xs"
                      >
                        <div className="flex items-center justify-between font-bold text-stone-900">
                          <span className="flex items-center gap-1.5 flex-wrap">
                            <span>{item.quantity} {item.unit} — {item.name}</span>
                            {item.isPromo && (
                              <span className="text-[9px] font-black bg-red-100 text-red-700 px-1.5 py-0.2 rounded">
                                FLASH SALE
                              </span>
                            )}
                          </span>
                        </div>

                        {item.selectedCut && item.selectedCut !== 'Tanpa Potongan' && (
                          <div className="mt-1 flex items-center gap-1.5 text-xs font-black text-amber-950">
                            <Scissors className="w-3.5 h-3.5 text-amber-700 flex-shrink-0" />
                            <span>POTONGAN: {item.selectedCut.toUpperCase()}</span>
                          </div>
                        )}

                        {item.notes && (
                          <div className="mt-1 p-1.5 rounded bg-white/80 border border-amber-200 text-stone-800 text-[11px] font-medium">
                            <span className="font-bold text-red-600">Catatan Khusus: </span>
                            <span>"{item.notes}"</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom 1-Click Action Buttons */}
                <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-stone-500">Status Saat Ini:</span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        order.status === 'SIAP'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.status === 'DIPOTONG'
                          ? 'bg-blue-100 text-blue-800 animate-pulse'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {order.status === 'SIAP'
                        ? 'Siap Diambil/Kirim'
                        : order.status === 'DIPOTONG'
                        ? 'Sedang Dipotong'
                        : 'Pesanan Diterima'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {order.status === 'DITERIMA' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'DIPOTONG')}
                        className="py-2 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs active:scale-95 transition flex items-center gap-1.5"
                      >
                        <Scissors className="w-3.5 h-3.5" />
                        <span>Mulai Potong</span>
                      </button>
                    )}

                    {order.status === 'DIPOTONG' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'SIAP')}
                        className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs active:scale-95 transition flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Siap Diambil / Kirim</span>
                      </button>
                    )}

                    {order.status === 'SIAP' && (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Selesai Dapur</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
