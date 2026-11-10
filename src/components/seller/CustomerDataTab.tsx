import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Download, MessageCircle, Search, Users, Phone, MapPin, ShoppingBag } from 'lucide-react';

interface AggregatedCustomer {
  phone: string;
  name: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
}

export const CustomerDataTab: React.FC = () => {
  const { orders } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  // Aggregate customer records by phone number
  const customerMap = new Map<string, AggregatedCustomer>();

  orders.forEach((order) => {
    const phone = order.customerPhone.trim();
    if (!phone) return;

    const existing = customerMap.get(phone);
    if (existing) {
      existing.totalOrders += 1;
      existing.totalSpent += order.totalAmount;
      if (order.deliveryAddress && !existing.address) {
        existing.address = order.deliveryAddress;
      }
      if (new Date(order.createdAt) > new Date(existing.lastOrderDate)) {
        existing.lastOrderDate = order.createdAt;
        existing.name = order.customerName;
      }
    } else {
      customerMap.set(phone, {
        phone,
        name: order.customerName,
        address: order.deliveryAddress || '-',
        totalOrders: 1,
        totalSpent: order.totalAmount,
        lastOrderDate: order.createdAt,
      });
    }
  });

  const customersList = Array.from(customerMap.values());

  const filteredCustomers = customersList.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.address.toLowerCase().includes(q)
    );
  });

  const handleExportCSV = () => {
    // Generate clean CSV with UTF-8 BOM and sep=; for clean Excel Indonesian locale compatibility
    const headers = ['Nama Pelanggan', 'Nomor WhatsApp', 'Alamat Pengiriman', 'Total Pesanan', 'Total Belanja (Rp)', 'Pesanan Terakhir'];
    const rows = filteredCustomers.map((c) => [
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.phone}"`,
      `"${c.address.replace(/"/g, '""')}"`,
      c.totalOrders,
      c.totalSpent,
      `"${new Date(c.lastOrderDate).toLocaleDateString('id-ID')}"`,
    ]);

    const csvContent =
      '\uFEFF' +
      'sep=;\r\n' +
      [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `data_pelanggan_yumna_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleChatWA = (customer: AggregatedCustomer) => {
    const text = encodeURIComponent(
      `Halo Kak *${customer.name}*, salam dari Toko Ayam Potong Yumna. Terima kasih telah menjadi pelanggan setia kami. Ada yang bisa kami bantu untuk pesanan ayam segar & telur hari ini?`
    );
    window.open(`https://wa.me/${customer.phone.replace(/[^0-9]/g, '')}?text=${text}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Export */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h3 className="font-extrabold text-stone-900 text-base sm:text-lg">
            Buku Kontak & Data Pelanggan Yumna
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Daftar pelanggan terdaftar dari transaksi pesanan. Klik untuk langsung chat WhatsApp.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={filteredCustomers.length === 0}
          className="flex items-center gap-2 py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-400 font-bold text-xs sm:text-sm shadow-sm active:scale-95 transition disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>Ekspor Data (CSV)</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari pelanggan berdasarkan nama, nomor WhatsApp, atau alamat..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-stone-50/50"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="p-12 text-center text-stone-400">
            <Users className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h4 className="font-bold text-stone-700 text-base">Tidak Ada Data Pelanggan</h4>
            <p className="text-xs text-stone-400 mt-1">
              Data pelanggan akan otomatis terkumpul saat ada pesanan masuk.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 uppercase font-bold text-[11px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Nama Pelanggan</th>
                  <th className="py-3.5 px-4">Kontak WhatsApp</th>
                  <th className="py-3.5 px-4">Alamat Rumah</th>
                  <th className="py-3.5 px-4 text-center">Total Order</th>
                  <th className="py-3.5 px-4">Total Belanja</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredCustomers.map((c) => (
                  <tr key={c.phone} className="hover:bg-stone-50/70 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-stone-900 block">{c.name}</span>
                          <span className="text-[10px] text-stone-400">
                            Terakhir order: {new Date(c.lastOrderDate).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono font-semibold text-stone-700 whitespace-nowrap">
                      {c.phone}
                    </td>

                    <td className="py-3 px-4 text-stone-600 max-w-xs truncate">
                      {c.address}
                    </td>

                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-stone-100 font-bold text-stone-800 text-xs">
                        {c.totalOrders}x
                      </span>
                    </td>

                    <td className="py-3 px-4 font-extrabold text-emerald-800 whitespace-nowrap">
                      Rp {c.totalSpent.toLocaleString('id-ID')}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleChatWA(c)}
                        className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs active:scale-95 transition"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Chat WA</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
