import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Lock, Mail, AlertTriangle, KeyRound, ShieldAlert } from 'lucide-react';
import { VERIFIED_ADMIN_EMAILS } from '../data/initialData';

export const SellerAuthModal: React.FC = () => {
  const { isSellerAuthOpen, setIsSellerAuthOpen, loginSeller } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  if (!isSellerAuthOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await loginSeller(email, password);
      if (!res.success) {
        setErrorMessage(res.error || 'Akses Ditolak: Halaman ini khusus Admin Dapur Toko Ayam Yumna.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseAdminCredentials = () => {
    setEmail(VERIFIED_ADMIN_EMAILS[0]); // admin@tokoyumna.com
    setPassword('yumna123');
    setErrorMessage(null);
  };

  const handleTestRejectedEmail = () => {
    setEmail('pembeli.umum@gmail.com');
    setPassword('123456');
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-300 overflow-hidden">
        {/* Security Header: Strict Admin Portal */}
        <div className="bg-stone-900 p-6 text-white relative border-b border-stone-800">
          <button
            onClick={() => {
              setIsSellerAuthOpen(false);
              setErrorMessage(null);
            }}
            className="absolute top-5 right-5 p-1 rounded-full bg-white/10 hover:bg-white/20 transition text-stone-300"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <Lock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Akses Penjual / Admin Dapur</h3>
              </div>
              <p className="text-xs text-amber-400/90 font-medium">
                Khusus Single User Admin Terverifikasi
              </p>
            </div>
          </div>
        </div>

        {/* Warning Badge: No Public Registration */}
        <div className="px-6 py-2.5 bg-amber-50 border-b border-amber-100 flex items-center gap-2 text-xs text-amber-900 font-medium">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>Area tertutup: Pendaftaran publik tidak tersedia pada pintu admin ini.</span>
        </div>

        {/* Form Body - HANYA LOGIN (NO SIGN UP) */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div
              id="admin-auth-error-banner"
              className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-start gap-2.5 animate-in shake"
            >
              <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-900">Peringatan Keamanan</p>
                <p className="mt-0.5 leading-relaxed">{errorMessage}</p>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Email Admin Terverifikasi <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="admin@tokoyumna.com"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Kata Sandi Admin <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent font-medium"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-amber-400 font-bold text-sm shadow-md active:scale-98 transition flex items-center justify-center gap-2 border border-amber-500/30"
            >
              <Lock className="w-4 h-4 text-amber-400" />
              <span>{isLoading ? 'Memverifikasi Admin...' : 'Masuk ke Seller Center Dapur'}</span>
            </button>
          </div>

          {/* Test Action Helpers */}
          <div className="pt-3 border-t border-stone-100 flex flex-col gap-2 text-center text-xs">
            <p className="text-stone-400 text-[11px] font-semibold">Bantuan Pengujian Cepat:</p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleUseAdminCredentials}
                className="text-emerald-700 hover:text-emerald-800 font-semibold underline underline-offset-2"
              >
                Gunakan Email Admin (Login Sukses)
              </button>
              <span className="text-stone-300">|</span>
              <button
                type="button"
                onClick={handleTestRejectedEmail}
                className="text-red-600 hover:text-red-700 font-semibold underline underline-offset-2"
              >
                Coba Email Lain (Tes Akses Ditolak)
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
