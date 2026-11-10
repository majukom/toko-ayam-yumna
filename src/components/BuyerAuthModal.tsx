import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, UserCheck, Phone, User, MapPin, Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export const BuyerAuthModal: React.FC = () => {
  const { isBuyerAuthOpen, setIsBuyerAuthOpen, loginBuyer, signUpBuyer } = useApp();
  const [tab, setTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isBuyerAuthOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (tab === 'REGISTER') {
        if (!name.trim() || !phone.trim()) {
          setErrorMessage('Nama lengkap dan nomor WhatsApp wajib diisi.');
          setIsLoading(false);
          return;
        }
        const res = await signUpBuyer(name, phone, email, password, address);
        if (!res.success) {
          setErrorMessage(res.error || 'Pendaftaran gagal');
        }
      } else {
        const input = email.trim() || phone.trim();
        if (!input) {
          setErrorMessage('Masukkan email atau nomor WhatsApp Anda.');
          setIsLoading(false);
          return;
        }
        const res = await loginBuyer(input, password, name, address);
        if (!res.success) {
          setErrorMessage(res.error || 'Login gagal');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = () => {
    setName('Ibu Siti Aminah');
    setPhone('081298765432');
    setEmail('siti.aminah@gmail.com');
    setPassword('yumna123');
    setAddress('Perum Gading Asri Blok C2 No. 8');
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-700 p-6 text-white relative">
          <button
            onClick={() => setIsBuyerAuthOpen(false)}
            className="absolute top-5 right-5 p-1 rounded-full bg-white/10 hover:bg-white/20 transition text-white"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Portal Pelanggan Toko Yumna</h3>
              <p className="text-xs text-emerald-100">Terhubung ke Firebase Auth & Firestore Real-Time</p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="mt-5 grid grid-cols-2 p-1 bg-emerald-950/40 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setTab('LOGIN');
                setErrorMessage(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition ${
                tab === 'LOGIN' ? 'bg-white text-emerald-900 shadow-sm' : 'text-emerald-200 hover:text-white'
              }`}
            >
              Masuk Akun
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('REGISTER');
                setErrorMessage(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition ${
                tab === 'REGISTER' ? 'bg-white text-emerald-900 shadow-sm' : 'text-emerald-200 hover:text-white'
              }`}
            >
              Daftar Pembeli Baru
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {tab === 'REGISTER' && (
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Ibu Ratna Susanti"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              {tab === 'REGISTER' ? 'Nomor WhatsApp Aktif *' : 'Email atau Nomor WhatsApp *'}
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={tab === 'REGISTER' ? phone : (email || phone)}
                onChange={(e) => {
                  if (tab === 'REGISTER') {
                    setPhone(e.target.value);
                  } else {
                    setEmail(e.target.value);
                    setPhone(e.target.value);
                  }
                }}
                placeholder={tab === 'REGISTER' ? '0812-XXXX-XXXX' : 'email@gmail.com atau 0812-XXXX'}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
              />
            </div>
          </div>

          {tab === 'REGISTER' && (
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Email (Opsional)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@gmail.com"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Kata Sandi <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
              />
            </div>
          </div>

          {tab === 'REGISTER' && (
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Alamat Pengiriman (Opsional)
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Nama jalan, nomor rumah, RT/RW"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                />
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-emerald-900/10 active:scale-98 transition flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memproses ke Firebase...</span>
                </>
              ) : (
                <>
                  <span>{tab === 'LOGIN' ? 'Masuk sebagai Pembeli' : 'Daftar & Terhubung ke Firebase'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Quick autofill helper */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={handleQuickDemo}
              className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold underline underline-offset-2"
            >
              Isi Data Cepat Pelanggan Demo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
