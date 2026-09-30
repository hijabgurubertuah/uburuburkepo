import React, { useState } from 'react';
import { X, Lock, KeyRound, Check, ShieldCheck, Sliders } from 'lucide-react';
import { LockedLayoutConfig } from '../config/lockedLayout';

interface AdminPositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  lockedLayout: LockedLayoutConfig;
  onSaveLockedLayout: (newLayout: LockedLayoutConfig) => void;
}

export const AdminPositionModal: React.FC<AdminPositionModalProps> = ({
  isOpen,
  onClose,
  lockedLayout,
  onSaveLockedLayout,
}) => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Draft layout values for editing
  const [draftX, setDraftX] = useState<number>(lockedLayout.x);
  const [draftY, setDraftY] = useState<number>(lockedLayout.y);
  const [draftWidth, setDraftWidth] = useState<number>(lockedLayout.width);
  const [draftFontSize, setDraftFontSize] = useState<number>(lockedLayout.fontSize);
  const [draftLineHeight, setDraftLineHeight] = useState<number>(lockedLayout.lineHeight);
  const [allowManualDrag, setAllowManualDrag] = useState<boolean>(!lockedLayout.isLocked);

  // Sync draft when opened
  React.useEffect(() => {
    if (isOpen) {
      setDraftX(lockedLayout.x);
      setDraftY(lockedLayout.y);
      setDraftWidth(lockedLayout.width);
      setDraftFontSize(lockedLayout.fontSize);
      setDraftLineHeight(lockedLayout.lineHeight);
      setAllowManualDrag(!lockedLayout.isLocked);
      setErrorMsg('');
    }
  }, [isOpen, lockedLayout]);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin 123') {
      setIsAuthenticated(true);
      setErrorMsg('');
    } else {
      setErrorMsg('Password salah! Hanya admin yang diizinkan mengatur posisi.');
    }
  };

  const handleSave = () => {
    const updated: LockedLayoutConfig = {
      ...lockedLayout,
      x: Math.round(draftX * 10) / 10,
      y: Math.round(draftY * 10) / 10,
      width: Math.round(draftWidth * 10) / 10,
      fontSize: draftFontSize,
      lineHeight: Math.round(draftLineHeight * 10) / 10,
      isLocked: !allowManualDrag, // If manual drag unchecked, lock immediately
    };

    onSaveLockedLayout(updated);
    alert('Posisi default area teks berhasil disimpan oleh Admin!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-5 shadow-2xl animate-in zoom-in-95 duration-150 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">
                Pengaturan Posisi Teks (Admin)
              </h3>
              <p className="text-[10px] text-slate-400">
                Atur posisi default area 7 baris
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!isAuthenticated ? (
          /* Password Form */
          <form onSubmit={handleLogin} className="space-y-3">
            <p className="text-xs text-slate-300">
              Halaman ini dilindungi. Masukkan password admin untuk mengatur posisi default:
            </p>

            <div className="relative">
              <input
                type="password"
                placeholder="Masukkan password admin..."
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMsg('');
                }}
                autoFocus
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500"
              />
              <KeyRound className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
            </div>

            {errorMsg && (
              <p className="text-[11px] text-rose-400 bg-rose-950/30 p-2 rounded-lg border border-rose-900/50">
                {errorMsg}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-500 transition shadow"
              >
                Masuk Admin
              </button>
            </div>
          </form>
        ) : (
          /* Admin Setting Controls */
          <div className="space-y-3.5 text-xs">
            <div className="grid grid-cols-2 gap-2">
              {/* Posisi X */}
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold block mb-1">
                  Posisi Horisontal (X %):
                </span>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setDraftX((prev) => Math.max(0, Math.round((prev - 0.5) * 10) / 10))}
                    className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold"
                  >
                    -
                  </button>
                  <span className="font-mono text-cyan-300 font-bold">{draftX}%</span>
                  <button
                    type="button"
                    onClick={() => setDraftX((prev) => Math.min(90, Math.round((prev + 0.5) * 10) / 10))}
                    className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Posisi Y */}
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold block mb-1">
                  Posisi Vertikal (Y %):
                </span>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setDraftY((prev) => Math.max(0, Math.round((prev - 0.5) * 10) / 10))}
                    className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold"
                  >
                    -
                  </button>
                  <span className="font-mono text-cyan-300 font-bold">{draftY}%</span>
                  <button
                    type="button"
                    onClick={() => setDraftY((prev) => Math.min(90, Math.round((prev + 0.5) * 10) / 10))}
                    className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Lebar Width */}
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold block mb-1">
                  Lebar Kolom (Width %):
                </span>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setDraftWidth((prev) => Math.max(10, Math.round((prev - 1) * 10) / 10))}
                    className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold"
                  >
                    -
                  </button>
                  <span className="font-mono text-cyan-300 font-bold">{draftWidth}%</span>
                  <button
                    type="button"
                    onClick={() => setDraftWidth((prev) => Math.min(95, Math.round((prev + 1) * 10) / 10))}
                    className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Ukuran Font */}
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold block mb-1">
                  Font Default (px):
                </span>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setDraftFontSize((prev) => Math.max(1, prev - 1))}
                    className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold"
                  >
                    -
                  </button>
                  <span className="font-mono text-cyan-300 font-bold">{draftFontSize}px</span>
                  <button
                    type="button"
                    onClick={() => setDraftFontSize((prev) => Math.min(60, prev + 1))}
                    className="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Toggle Geser Manual di Kanvas */}
            <label className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/80 border border-slate-800 cursor-pointer text-slate-300 text-[11px]">
              <input
                type="checkbox"
                checked={allowManualDrag}
                onChange={(e) => setAllowManualDrag(e.target.checked)}
                className="w-3.5 h-3.5 accent-cyan-500 rounded"
              />
              <span>Buka kunci agar bisa digeser langsung di kanvas</span>
            </label>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-1.5 rounded-lg font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 transition shadow flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Simpan Posisi Default</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
