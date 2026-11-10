import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, MapPin, Clock, Phone, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setIsSellerAuthOpen, setRole, role } = useApp();

  return (
    <footer className="bg-stone-900 text-stone-300 mt-16 border-t border-stone-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Col */}
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center p-1">
                <img src="/icon.svg" alt="Toko Yumna" className="w-full h-full object-contain" />
              </div>
              <span className="font-extrabold text-white text-base tracking-tight">
                Toko Ayam Potong <span className="text-amber-400">Yumna</span>
              </span>
            </div>
            <p className="mt-3 text-xs text-stone-400 leading-relaxed">
              Pusat daging ayam potong higienis dan telur ayam segar berkualitas langsung dari peternakan. Potong langsung di tempat sesuai permintaan Anda.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Halal, Bersih, Higienis & Segar Subuh</span>
            </div>
          </div>

          {/* Lokasi & Jam Buka */}
          <div className="space-y-3 text-xs text-stone-400">
            <h4 className="font-bold text-stone-200 text-sm tracking-wide">Lokasi & Jam Buka</h4>
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <span>Pasar Tradisional / Kios Yumna No. 12, Jl. Pasar Anyar, Banten</span>
            </div>
            <div className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              <span>Buka Setiap Hari: 06:00 - 13:00 WIB (Slot Antrean 07:00 - 12:00)</span>
            </div>
            <div className="flex items-start gap-2.5">
              <Phone className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <span>Layanan Pelanggan WhatsApp: +62 812-3456-7890</span>
            </div>
          </div>

          {/* Jaminan Layanan */}
          <div className="space-y-3 text-xs text-stone-400">
            <h4 className="font-bold text-stone-200 text-sm tracking-wide">Jaminan Yumna</h4>
            <ul className="space-y-1.5 list-disc list-inside text-stone-400">
              <li>Pilihan potong fleksibel (Utuh, 4, 8, 12, Fillet)</li>
              <li>Ayam dipotong segar setelah pesanan masuk</li>
              <li>Sistem antrean slot jam tanpa menunggu lama</li>
              <li>Tersedia pengiriman ke rumah & ambil sendiri</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar with Seller Access link at bottom right */}
        <div className="mt-10 pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="text-stone-400 flex items-center gap-1 text-[11px] sm:text-xs">
            <span>© {new Date().getFullYear()} Toko Ayam Potong Yumna. Dibuat dengan</span>
            <Heart className="w-3 h-3 text-red-500 fill-red-500 inline" />
            <span>untuk kepuasan pelanggan.</span>
          </div>

          {/* POJOK KANAN BAWAH: Tautan Kecil Akses Penjual / Admin Dapur */}
          <div className="flex items-center gap-3">
            {role === 'PENJUAL' ? (
              <button
                onClick={() => setRole('PEMBELI')}
                className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold underline underline-offset-4"
              >
                Kembali ke Tampilan Toko Pembeli
              </button>
            ) : (
              <button
                onClick={() => setIsSellerAuthOpen(true)}
                id="link-akses-penjual"
                className="text-[11px] text-stone-400 hover:text-amber-400 font-medium tracking-wide flex items-center gap-1.5 transition-colors p-1 rounded hover:bg-stone-800"
                title="Halaman khusus staf dapur dan pemilik toko"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
                <span>Akses Penjual / Admin Dapur</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};
