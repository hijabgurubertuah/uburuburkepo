import React, { useState } from 'react';
import { 
  X, 
  Type, 
  Clipboard, 
  Lock, 
  Check, 
  ChevronDown,
  Settings
} from 'lucide-react';
import { TextAnnotation } from '../types';
import { LockedLayoutConfig, saveLockedLayout } from '../config/lockedLayout';
import { AdminPositionModal } from './AdminPositionModal';

interface TextInputSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  annotation: TextAnnotation | null;
  activeImageName: string;
  activePageIndex: number;
  totalPages: number;
  onUpdate: (updates: Partial<TextAnnotation>) => void;
  lockedLayout: LockedLayoutConfig;
  onUpdateLockedLayout: (newLayout: LockedLayoutConfig) => void;
}

const AVAILABLE_FONTS = [
  { name: 'Comic Sans MS', value: '"Comic Sans MS", "Comic Sans", cursive' },
  { name: 'Plus Jakarta Sans', value: '"Plus Jakarta Sans", sans-serif' },
  { name: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { name: 'Times New Roman', value: '"Times New Roman", Times, serif' },
  { name: 'Courier New', value: '"Courier New", Courier, monospace' },
  { name: 'Trebuchet MS', value: '"Trebuchet MS", sans-serif' },
  { name: 'Georgia', value: 'Georgia, serif' },
];

export const TextInputSidebar: React.FC<TextInputSidebarProps> = ({
  isOpen,
  onClose,
  annotation,
  activeImageName,
  activePageIndex,
  totalPages,
  onUpdate,
  lockedLayout,
  onUpdateLockedLayout,
}) => {
  const [pasteSuccess, setPasteSuccess] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  if (!isOpen || !annotation) return null;

  const currentLines = annotation.text ? annotation.text.split('\n') : [];
  const lineCount = annotation.text.trim() === '' ? 0 : currentLines.length;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({
      text: e.target.value,
      color: '#000000',
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      borderWidth: 0,
    });
  };

  const handlePasteFromClipboard = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        onUpdate({
          text: clipText,
          color: '#000000',
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          borderWidth: 0,
        });
        setPasteSuccess(true);
        setTimeout(() => setPasteSuccess(false), 2000);
      }
    } catch {
      alert('Silakan tekan Ctrl+V pada kolom teks untuk menempel 7 baris.');
    }
  };

  // Stepper handlers for line spacing (jarak baris tambah & kurang)
  const currentLineHeight = annotation.lineHeight || 1.6;
  const handleIncreaseLineHeight = () => {
    const next = Math.min(3.5, Math.round((currentLineHeight + 0.1) * 10) / 10);
    onUpdate({ lineHeight: next });
  };
  const handleDecreaseLineHeight = () => {
    const next = Math.max(1.0, Math.round((currentLineHeight - 0.1) * 10) / 10);
    onUpdate({ lineHeight: next });
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs"
      />

      {/* Sidebar 2: Input Teks 7 Baris */}
      <aside className="fixed inset-y-0 left-0 z-50 w-80 sm:w-96 bg-slate-900 border-r border-slate-800 shadow-2xl flex flex-col select-none animate-in slide-in-from-left duration-200">
        {/* Header */}
        <div className="p-3.5 border-b border-slate-800 bg-slate-900/95 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-cyan-400 border border-cyan-500/20">
              <Type className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white tracking-tight">
                Input Teks 7 Baris
              </h2>
              <p className="text-[10px] text-slate-400 truncate max-w-[200px]">
                {activeImageName} ({activePageIndex + 1}/{totalPages})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Tutup Sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* Paste Column Section */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-200 text-xs flex items-center gap-1.5">
                <span>Kolom Tempel Teks:</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${
                    lineCount === 7
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {lineCount === 7 && <Check className="w-2.5 h-2.5 text-emerald-400" />}
                  <span>{lineCount} Kolom Teks ({annotation.text ? (annotation.text.match(/\n/g) || []).length : 0} Enter)</span>
                </span>
              </label>

              <button
                type="button"
                onClick={handlePasteFromClipboard}
                className="text-[10px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 flex items-center gap-1 transition cursor-pointer"
                title="Tempel teks langsung dari clipboard"
              >
                <Clipboard className="w-3 h-3" />
                <span>{pasteSuccess ? 'Tersalin!' : 'Tombol Tempel'}</span>
              </button>
            </div>

            {/* The single textarea */}
            <textarea
              value={annotation.text}
              onChange={handleTextChange}
              rows={8}
              placeholder="Tinggal tempel (paste) 7 baris teks di sini...&#10;Baris 1&#10;Baris 2&#10;Baris 3&#10;Baris 4&#10;Baris 5&#10;Baris 6&#10;Baris 7"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono resize-none leading-relaxed"
            />
            <p className="text-[10px] text-cyan-400/90 leading-normal">
              💡 Setiap tombol Enter memisahkan teks menjadi kolom baris terpisah pada pratinjau yang tidak akan saling tumpang tindih.
            </p>
          </div>

          {/* Pilihan Font (termasuk Comic Sans MS) */}
          <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <label className="text-slate-300 font-semibold flex items-center justify-between">
              <span>Pilihan Font:</span>
              <span className="text-[10px] text-cyan-400 font-mono">
                {AVAILABLE_FONTS.find(f => f.value === annotation.fontFamily)?.name || 'Custom'}
              </span>
            </label>

            <div className="relative">
              <select
                value={annotation.fontFamily || '"Plus Jakarta Sans", sans-serif'}
                onChange={(e) => onUpdate({ fontFamily: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white appearance-none outline-none focus:border-cyan-500 cursor-pointer"
              >
                {AVAILABLE_FONTS.map((font) => (
                  <option key={font.name} value={font.value} style={{ fontFamily: font.value }}>
                    {font.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Stepper Controls: Ukuran Font & Jarak Baris */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Ukuran Font Stepper (Bisa sampai 1 px untuk tampilan HP) */}
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px] font-medium">Ukuran Font:</span>
                <span className="text-[10px] text-cyan-400 font-mono font-bold">{annotation.fontSize} px</span>
              </div>
              <div className="flex items-center justify-between bg-slate-900 rounded-lg p-1 border border-slate-800">
                <button
                  type="button"
                  onClick={() => onUpdate({ fontSize: Math.max(1, (annotation.fontSize || 13) - 1) })}
                  className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 active:bg-cyan-600 text-slate-200 text-sm font-bold flex items-center justify-center transition cursor-pointer"
                  title="Kurang Ukuran Font (Bisa sampai 1 px)"
                >
                  -
                </button>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={annotation.fontSize || 13}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) {
                      onUpdate({ fontSize: Math.max(1, Math.min(60, val)) });
                    }
                  }}
                  className="w-12 text-center bg-transparent font-mono text-cyan-300 font-bold text-xs outline-none"
                />
                <button
                  type="button"
                  onClick={() => onUpdate({ fontSize: Math.min(60, (annotation.fontSize || 13) + 1) })}
                  className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 active:bg-cyan-600 text-slate-200 text-sm font-bold flex items-center justify-center transition cursor-pointer"
                  title="Tambah Ukuran Font"
                >
                  +
                </button>
              </div>
              {/* Quick slider from 1 to 30 */}
              <input
                type="range"
                min={1}
                max={30}
                value={annotation.fontSize || 13}
                onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value, 10) })}
                className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer mt-0.5"
                title={`Geser ukuran font: ${annotation.fontSize}px`}
              />
            </div>

            {/* Jarak Baris Stepper */}
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px] font-medium">Jarak Baris:</span>
                <span className="text-[10px] text-cyan-400 font-mono font-bold">{currentLineHeight.toFixed(1)}x</span>
              </div>
              <div className="flex items-center justify-between bg-slate-900 rounded-lg p-1 border border-slate-800">
                <button
                  type="button"
                  onClick={handleDecreaseLineHeight}
                  className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 active:bg-cyan-600 text-slate-200 text-sm font-bold flex items-center justify-center transition cursor-pointer"
                  title="Rapatkan Jarak Baris (-)"
                >
                  -
                </button>
                <span className="font-mono text-cyan-300 font-bold text-xs">
                  {currentLineHeight.toFixed(1)}x
                </span>
                <button
                  type="button"
                  onClick={handleIncreaseLineHeight}
                  className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 active:bg-cyan-600 text-slate-200 text-sm font-bold flex items-center justify-center transition cursor-pointer"
                  title="Renggangkan Jarak Baris (+)"
                >
                  +
                </button>
              </div>
              {/* Quick slider for line height from 0.8 to 3.5 */}
              <input
                type="range"
                min={8}
                max={35}
                value={Math.round(currentLineHeight * 10)}
                onChange={(e) => onUpdate({ lineHeight: parseInt(e.target.value, 10) / 10 })}
                className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer mt-0.5"
                title={`Geser jarak baris: ${currentLineHeight.toFixed(1)}x`}
              />
            </div>
          </div>

          {/* Status Posisi Terkunci (Hanya Admin yang Bisa Mengatur Posisi Default) */}
          <div className="pt-1">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-300 text-[11px]">
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-medium">Posisi Default Terkunci</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                X:{lockedLayout.x}% Y:{lockedLayout.y}%
              </span>
            </div>
          </div>
        </div>

        {/* Footer: Tombol Gerigi Saja di Bawah Sidebar Input Teks */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-[10px] text-slate-500">
            Pengaturan admin
          </span>

          {/* Tombol Gerigi Saja (Icon-only) */}
          <button
            type="button"
            onClick={() => setIsAdminModalOpen(true)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-cyan-300 border border-slate-700 transition cursor-pointer shadow-sm"
            title="Pengaturan Posisi Teks (Admin: password admin 123)"
            aria-label="Pengaturan Posisi Teks"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Admin Setting Modal (Password: admin 123) */}
      <AdminPositionModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        lockedLayout={lockedLayout}
        onSaveLockedLayout={(newLayout) => {
          onUpdateLockedLayout(newLayout);
        }}
      />
    </>
  );
};
