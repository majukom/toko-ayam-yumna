import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Clock, Plus, Sliders, CheckCircle2, XCircle, AlertCircle, Save } from 'lucide-react';

export const QuotaManagementTab: React.FC = () => {
  const { timeSlots, updateSlotQuota, toggleSlotStatus, getSlotUsage } = useApp();

  const [editingSlot, setEditingSlot] = useState<string | null>(null);
  const [tempQuota, setTempQuota] = useState<number>(10);

  const handleStartEdit = (slot: string, currentQuota: number) => {
    setEditingSlot(slot);
    setTempQuota(currentQuota);
  };

  const handleSaveQuota = (slot: string) => {
    updateSlotQuota(slot, tempQuota);
    setEditingSlot(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h3 className="font-extrabold text-stone-900 text-base sm:text-lg">
            Kelola Kuota & Kapasitas Slot Jam Antrean
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Batas maksimal pesanan per slot jam untuk menjaga kecepatan dan higienitas pengerjaan dapur.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-stone-600 bg-stone-100 px-3 py-1.5 rounded-xl">
          <Clock className="w-4 h-4 text-emerald-700" />
          <span>Jam Buka Dapur: 07:00 - 12:00 WIB</span>
        </div>
      </div>

      {/* Quota Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {timeSlots.map((ts) => {
          const usage = getSlotUsage(ts.slot);
          const remaining = Math.max(0, ts.maxQuota - usage);
          const isFull = usage >= ts.maxQuota;
          const isEditing = editingSlot === ts.slot;
          const usagePercent = Math.min(100, Math.round((usage / ts.maxQuota) * 100));

          return (
            <div
              key={ts.slot}
              className={`bg-white rounded-2xl border p-5 shadow-xs transition-all flex flex-col justify-between ${
                ts.isClosed
                  ? 'border-stone-200 bg-stone-50/70 opacity-70'
                  : isFull
                  ? 'border-red-300 ring-2 ring-red-50'
                  : 'border-stone-200 hover:border-emerald-300'
              }`}
            >
              <div>
                {/* Slot Title + Status Toggle */}
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-stone-900 text-sm sm:text-base">
                        {ts.slot}
                      </h4>
                      <span className="text-[10px] text-stone-400">Pagi</span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleSlotStatus(ts.slot)}
                    className={`px-2.5 py-1 rounded-full text-xs font-bold transition flex items-center gap-1 ${
                      ts.isClosed
                        ? 'bg-red-100 text-red-800 hover:bg-red-200'
                        : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    }`}
                    title="Klik untuk membuka atau menutup slot ini"
                  >
                    {ts.isClosed ? (
                      <>
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Ditutup</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Aktif</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Live Capacity Indicators */}
                <div className="py-4 space-y-3">
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-stone-500 font-medium">Terisi Sekarang:</span>
                    <span className="text-sm font-black text-stone-900">
                      {usage} <span className="text-stone-400 font-normal">/ {ts.maxQuota} antrean</span>
                    </span>
                  </div>

                  {/* Progress Meter */}
                  <div className="h-2.5 w-full bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        usagePercent >= 100
                          ? 'bg-red-600'
                          : usagePercent >= 70
                          ? 'bg-amber-500'
                          : 'bg-emerald-600'
                      }`}
                      style={{ width: `${usagePercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-stone-400">Sisa Kuota:</span>
                    <span
                      className={`font-bold ${
                        remaining === 0
                          ? 'text-red-600'
                          : remaining <= 2
                          ? 'text-amber-600'
                          : 'text-emerald-700'
                      }`}
                    >
                      {ts.isClosed ? 'Slot Ditutup' : `${remaining} pesanan tersisa`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Edit Quota Bottom Section */}
              <div className="pt-3 border-t border-stone-100">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={tempQuota}
                      onChange={(e) => setTempQuota(Number(e.target.value))}
                      className="w-20 px-2 py-1 text-xs font-bold rounded-lg border border-emerald-500 focus:outline-none"
                    />
                    <button
                      onClick={() => handleSaveQuota(ts.slot)}
                      className="flex-1 py-1 px-3 rounded-lg bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 flex items-center justify-center gap-1"
                    >
                      <Save className="w-3 h-3" />
                      <span>Simpan</span>
                    </button>
                    <button
                      onClick={() => setEditingSlot(null)}
                      className="py-1 px-2.5 rounded-lg bg-stone-200 text-stone-700 text-xs font-semibold"
                    >
                      Batal
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleStartEdit(ts.slot, ts.maxQuota)}
                    className="w-full py-2 px-3 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <Sliders className="w-3.5 h-3.5 text-stone-500" />
                    <span>Ubah Batas Kuota ({ts.maxQuota})</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
