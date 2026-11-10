import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share2, PlusSquare, X } from 'lucide-react';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running in standalone mode, suppress
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`flex items-center gap-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-medium shadow-sm transition-all ${
          compact ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-xs sm:text-sm'
        }`}
        title="Pasang aplikasi Toko Yumna di layar HP Anda"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 rounded-lg border border-emerald-700/30 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 active:scale-95 font-medium transition-all ${
            compact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-xs'
          }`}
          title="Pasang di iPhone / iPad"
        >
          <Download className="w-3.5 h-3.5 text-emerald-700" />
          <span>Install iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-stone-200">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                    Y
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-stone-900">Install di iPhone / Safari</h3>
                    <p className="text-xs text-stone-500">Akses cepat seperti aplikasi native</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs text-stone-600">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                  <div className="p-1.5 rounded-lg bg-white shadow-xs text-emerald-700">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-stone-900">1. Ketuk tombol Share</span>
                    <p className="text-stone-500 mt-0.5">Ikon kotak berpanah di bilah bawah browser Safari Anda.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-stone-50 border border-stone-100">
                  <div className="p-1.5 rounded-lg bg-white shadow-xs text-emerald-700">
                    <PlusSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold text-stone-900">2. Pilih 'Add to Home Screen'</span>
                    <p className="text-stone-500 mt-0.5">Gulir ke bawah dan ketuk "Tambah ke Layar Utama".</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-xl bg-emerald-700 hover:bg-emerald-800 py-2.5 text-xs font-semibold text-white shadow-sm transition"
              >
                Mengerti
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
