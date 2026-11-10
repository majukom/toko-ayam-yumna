import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  Download,
  DollarSign,
  PackageCheck,
  Egg,
  Calendar,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

export const SalesReportTab: React.FC = () => {
  const { orders } = useApp();

  // Financial & Volume calculations
  const totalOmzet = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalOrders = orders.length;

  // Count chicken carcasses (ekor) sold
  let totalEkorAyam = 0;
  let totalKgTelur = 0;
  let totalButirTelur = 0;
  let totalKgFilletPaha = 0;

  const productSalesMap = new Map<
    string,
    { name: string; category: string; quantity: number; unit: string; totalRevenue: number }
  >();

  orders.forEach((order) => {
    order.items.forEach((item) => {
      // Ekor count
      if (item.unit === 'ekor' || item.name.toLowerCase().includes('ekor')) {
        totalEkorAyam += item.quantity;
      }
      // Egg counts
      if (item.category === 'Telur') {
        if (item.unit === 'kg') totalKgTelur += item.quantity;
        if (item.unit === 'butir') totalButirTelur += item.quantity;
      }
      // Cut parts
      if (item.category === 'Daging Ayam' && item.unit === 'kg') {
        totalKgFilletPaha += item.quantity;
      }

      // Aggregate item sales
      const existing = productSalesMap.get(item.productId);
      if (existing) {
        existing.quantity += item.quantity;
        existing.totalRevenue += item.subtotal;
      } else {
        productSalesMap.set(item.productId, {
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          unit: item.unit,
          totalRevenue: item.subtotal,
        });
      }
    });
  });

  const topProducts = Array.from(productSalesMap.values()).sort(
    (a, b) => b.totalRevenue - a.totalRevenue
  );

  // Time slot breakdown
  const slotBreakdown = [
    '07:00 - 08:00',
    '08:00 - 09:00',
    '09:00 - 10:00',
    '10:00 - 11:00',
    '11:00 - 12:00',
  ].map((slot) => {
    const slotOrders = orders.filter((o) => o.timeSlot === slot);
    const revenue = slotOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    return {
      slot,
      orderCount: slotOrders.length,
      revenue,
    };
  });

  const maxSlotOrders = Math.max(...slotBreakdown.map((s) => s.orderCount), 1);

  // Download CSV compliant with Excel (sep=; and UTF-8 BOM)
  const handleDownloadCSV = () => {
    const headers = [
      'No Antrean',
      'ID Pesanan',
      'Tanggal & Jam',
      'Nama Pemesan',
      'No WhatsApp',
      'Metode Penyerahan',
      'Slot Jam',
      'Rincian Item',
      'Metode Pembayaran',
      'Total Biaya (Rp)',
      'Status',
    ];

    const rows = orders.map((o) => {
      const itemsDetail = o.items
        .map((i) => `${i.name} (${i.quantity} ${i.unit}) [${i.selectedCut}]`)
        .join(' + ');

      return [
        `"${o.queueNumber}"`,
        `"${o.id}"`,
        `"${new Date(o.createdAt).toLocaleString('id-ID')}"`,
        `"${o.customerName.replace(/"/g, '""')}"`,
        `"${o.customerPhone}"`,
        `"${o.deliveryType === 'AMBIL' ? 'Ambil di Toko' : 'Delivery Rumah'}"`,
        `"${o.timeSlot}"`,
        `"${itemsDetail.replace(/"/g, '""')}"`,
        `"${o.paymentMethod}"`,
        o.totalAmount,
        `"${o.status}"`,
      ];
    });

    const csvContent =
      '\uFEFF' +
      'sep=;\r\n' +
      [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `laporan_penjualan_yumna_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Excel Download */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h3 className="font-extrabold text-stone-900 text-base sm:text-lg">
            Laporan & Analitik Penjualan Toko Yumna
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Ringkasan omzet harian, total ekor ayam potong, dan volume telur terjual.
          </p>
        </div>

        <button
          onClick={handleDownloadCSV}
          className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-sm active:scale-95 transition"
        >
          <Download className="w-4 h-4" />
          <span>Unduh Laporan Penjualan (CSV)</span>
        </button>
      </div>

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Omzet Total */}
        <div className="p-5 bg-gradient-to-br from-emerald-800 to-emerald-950 text-white rounded-2xl shadow-sm relative overflow-hidden">
          <div className="absolute right-2 -bottom-2 opacity-10 text-white">
            <DollarSign className="w-24 h-24" />
          </div>
          <span className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider block">
            Total Omzet Penjualan
          </span>
          <span className="text-2xl sm:text-3xl font-black mt-1 block">
            Rp {totalOmzet.toLocaleString('id-ID')}
          </span>
          <span className="text-[10px] text-emerald-300 mt-2 block">
            Dari total {totalOrders} transaksi terkonfirmasi
          </span>
        </div>

        {/* Total Ekor Ayam */}
        <div className="p-5 bg-gradient-to-br from-amber-500 to-amber-600 text-stone-950 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="absolute right-2 -bottom-2 opacity-15 text-stone-900">
            <TrendingUp className="w-24 h-24" />
          </div>
          <span className="text-[11px] font-bold text-stone-900/80 uppercase tracking-wider block">
            Total Daging Ayam Terjual
          </span>
          <span className="text-2xl sm:text-3xl font-black mt-1 block">
            {totalEkorAyam} <span className="text-lg font-bold">Ekor</span>
          </span>
          <span className="text-[10px] text-stone-900/80 mt-2 block">
            + {totalKgFilletPaha} kg fillet & potongan paha
          </span>
        </div>

        {/* Total Telur */}
        <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Total Telur Terjual
            </span>
            <Egg className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl font-black text-stone-900 block">
            {totalKgTelur} <span className="text-sm font-bold text-stone-500">kg</span>
          </span>
          <span className="text-[10px] text-stone-400 mt-1 block">
            + {totalButirTelur} butir telur kampung
          </span>
        </div>

        {/* Rata-rata per Transaksi */}
        <div className="p-5 bg-white rounded-2xl border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">
              Rata-rata Belanja (AOV)
            </span>
            <PackageCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-black text-stone-900 block">
            Rp {totalOrders > 0 ? Math.round(totalOmzet / totalOrders).toLocaleString('id-ID') : 0}
          </span>
          <span className="text-[10px] text-stone-400 mt-1 block">
            Nilai transaksi rata-rata per pelanggan
          </span>
        </div>
      </div>

      {/* Visual Chart / Slot Traffic & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribusi Pesanan per Slot Jam */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <h4 className="font-extrabold text-stone-900 text-sm mb-1">
            Kepadatan Antrean per Slot Jam
          </h4>
          <p className="text-xs text-stone-500 mb-4">
            Distribusi beban kerja dapur potong sepanjang pagi.
          </p>

          <div className="space-y-3">
            {slotBreakdown.map((s) => {
              const pct = (s.orderCount / maxSlotOrders) * 100;
              return (
                <div key={s.slot} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-stone-800">{s.slot}</span>
                    <span className="text-stone-600">
                      {s.orderCount} pesanan · Rp {s.revenue.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="h-3 w-full bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-600 to-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(pct, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Produk Terlaris (Top Selling) */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <h4 className="font-extrabold text-stone-900 text-sm mb-1">
            Produk Terlaris & Omzet Produk
          </h4>
          <p className="text-xs text-stone-500 mb-4">
            Peringkat daging dan telur berdasarkan total pendapatan.
          </p>

          <div className="space-y-3">
            {topProducts.map((p, idx) => (
              <div
                key={p.name}
                className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-100 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-stone-200 text-stone-700 flex items-center justify-center font-bold text-[10px]">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="font-bold text-stone-900 block">{p.name}</span>
                    <span className="text-[10px] text-stone-500">
                      Terjual: {p.quantity} {p.unit}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="font-extrabold text-emerald-800 block">
                    Rp {p.totalRevenue.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
