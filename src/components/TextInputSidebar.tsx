import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  X, 
  Type, 
  Clipboard, 
  Lock, 
  ChevronDown,
  Settings
} from 'lucide-react';
import { TextAnnotation } from '../types';
import { LockedLayoutConfig } from '../config/lockedLayout';
import { AdminPositionModal } from './AdminPositionModal';
import { UburUburLogo } from './UburUburLogo';

interface TextInputSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  annotations: TextAnnotation[];
  selectedAnnotation: TextAnnotation | null;
  activeImageName: string;
  activePageIndex: number;
  totalPages: number;
  onUpdateCombinedText: (newFullText: string) => void;
  onUpdateProps: (updates: Partial<TextAnnotation>) => void;
  lockedLayout: LockedLayoutConfig;
  onUpdateLockedLayout: (newLayout: LockedLayoutConfig) => void;
}

const AVAILABLE_FONTS = [
  { name: 'Plus Jakarta Sans', value: '"Plus Jakarta Sans", sans-serif' },
  { name: 'Comic Sans MS', value: '"Comic Sans MS", "Comic Sans", cursive' },
  { name: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { name: 'Times New Roman', value: '"Times New Roman", Times, serif' },
  { name: 'Courier New', value: '"Courier New", Courier, monospace' },
  { name: 'Trebuchet MS', value: '"Trebuchet MS", sans-serif' },
  { name: 'Georgia', value: 'Georgia, serif' },
];

export const TextInputSidebar: React.FC<TextInputSidebarProps> = ({
  isOpen,
  onClose,
  annotations,
  selectedAnnotation,
  activeImageName,
  activePageIndex,
  totalPages,
  onUpdateCombinedText,
  onUpdateProps,
  lockedLayout,
  onUpdateLockedLayout,
}) => {
  const [pasteSuccess, setPasteSuccess] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Representative annotation for font/size/lineHeight/width controls
  const representativeAnn = selectedAnnotation || annotations[0] || null;

  // Derive initial 7 chunks from annotations
  const initialChunks = useMemo(() => {
    if (!annotations || annotations.length === 0) return [''];
    const nonEmpties = annotations.filter((a) => a.text && a.text.trim() !== '');
    if (nonEmpties.length === 1 && nonEmpties[0].text === 'Isi teks disini') {
      return ['Isi teks disini'];
    }
    let lastIdx = -1;
    for (let i = annotations.length - 1; i >= 0; i--) {
      if (annotations[i].text && annotations[i].text.trim() !== '') {
        lastIdx = i;
        break;
      }
    }
    if (lastIdx === -1) {
      return annotations[0]?.text === 'Isi teks disini' ? ['Isi teks disini'] : [''];
    }
    const result = annotations.slice(0, lastIdx + 1).map((a) => a.text || '');
    return result.length > 0 ? result : [''];
  }, [annotations]);

  const [chunks, setChunks] = useState<string[]>(initialChunks);
  const [activeChunkIndex, setActiveChunkIndex] = useState<number>(0);
  const textareaRefs = React.useRef<(HTMLTextAreaElement | null)[]>([]);
  const isTypingRef = React.useRef(false);

  // Synchronize when changing pages or opening sidebar
  useEffect(() => {
    if (!isTypingRef.current) {
      setChunks(initialChunks.map((c) => (c === 'Isi teks disini' ? '' : c)));
    }
  }, [initialChunks, activePageIndex, isOpen]);

  if (!isOpen) return null;

  const emitChunks = (newChunks: string[]) => {
    isTypingRef.current = true;
    setChunks(newChunks);
    onUpdateCombinedText(newChunks.join('\n\n'));
    setTimeout(() => {
      isTypingRef.current = false;
    }, 150);
  };

  const handleChunkChange = (index: number, value: string) => {
    setActiveChunkIndex(index);
    // If pasted or typed with double enters within this chunk, split automatically
    if (value.includes('\n\n')) {
      const parts = value.split(/\n\n+/);
      const newChunks = [...chunks.slice(0, index), ...parts, ...chunks.slice(index + 1)].slice(0, 7);
      emitChunks(newChunks);
      return;
    }

    const nextChunks = [...chunks];
    nextChunks[index] = value;
    emitChunks(nextChunks);
  };

  const handleChunkKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    setActiveChunkIndex(index);
    const textarea = e.currentTarget;
    const { selectionStart, selectionEnd, value } = textarea;

    // 1. Enter 2x handling: If user presses Enter at a blank line or after a newline, jump/create next column with dotted line
    if (e.key === 'Enter') {
      const isSecondEnter = selectionStart > 0 && value[selectionStart - 1] === '\n';
      
      if (isSecondEnter && chunks.length < 7) {
        e.preventDefault();
        const before = value.substring(0, selectionStart - 1);
        const after = value.substring(selectionEnd);
        
        const nextChunks = [
          ...chunks.slice(0, index),
          before,
          after,
          ...chunks.slice(index + 1),
        ].slice(0, 7);

        emitChunks(nextChunks);
        setActiveChunkIndex(index + 1);

        // Focus next chunk
        setTimeout(() => {
          const nextRef = textareaRefs.current[index + 1];
          if (nextRef) {
            nextRef.focus();
            nextRef.setSelectionRange(0, 0);
          }
        }, 10);
        return;
      }
    }

    // 2. Backspace handling: If cursor is at start of chunk (position 0), remove dotted line and merge into previous chunk
    if (e.key === 'Backspace' && selectionStart === 0 && selectionEnd === 0 && index > 0) {
      e.preventDefault();
      const prevChunk = chunks[index - 1] || '';
      const currChunk = chunks[index] || '';
      const mergePosition = prevChunk.length;

      const mergedChunk = prevChunk + currChunk;
      const nextChunks = [
        ...chunks.slice(0, index - 1),
        mergedChunk,
        ...chunks.slice(index + 1),
      ];

      emitChunks(nextChunks);
      setActiveChunkIndex(index - 1);

      // Focus previous chunk at the exact merge point
      setTimeout(() => {
        const prevRef = textareaRefs.current[index - 1];
        if (prevRef) {
          prevRef.focus();
          prevRef.setSelectionRange(mergePosition, mergePosition);
        }
      }, 10);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        const parts = clipText.split(/\r?\n\r?\n/).slice(0, 7);
        emitChunks(parts);
        setPasteSuccess(true);
        setTimeout(() => setPasteSuccess(false), 2000);
      }
    } catch {
      alert('Silakan tekan Ctrl+V pada kolom teks untuk menempel.');
    }
  };

  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 640 : false;
  const currentFontSize = representativeAnn?.fontSize || (isMobile ? 5 : 13);
  const currentLineHeight = representativeAnn?.lineHeight || 1.2;
  const currentWidth = representativeAnn?.width || 49;
  const currentFontFamily = representativeAnn?.fontFamily || '"Plus Jakarta Sans", sans-serif';

  const handleIncreaseLineHeight = () => {
    const next = Math.min(3.5, Math.round((currentLineHeight + 0.1) * 10) / 10);
    onUpdateProps({ lineHeight: next });
  };
  const handleDecreaseLineHeight = () => {
    const next = Math.max(1.0, Math.round((currentLineHeight - 0.1) * 10) / 10);
    onUpdateProps({ lineHeight: next });
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs"
      />

      {/* Sidebar: Input Teks 7 Kolom */}
      <aside className="fixed inset-y-0 left-0 z-50 w-80 sm:w-96 bg-slate-900 border-r border-slate-800 shadow-2xl flex flex-col select-none animate-in slide-in-from-left duration-200">
        {/* Header */}
        <div className="p-3.5 border-b border-slate-800 bg-slate-900/95 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <UburUburLogo className="w-8 h-8" size={32} />
            <div>
              <h2 className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5">
                <span>Masukan Teks</span>
              </h2>
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
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              {/* 7 Column Indicator Badges with Active Green Highlight on Caret Position */}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5, 6, 7].map((num) => {
                  const ann = annotations[num - 1];
                  const hasText = ann && ann.text && ann.text.trim() !== '' && ann.text !== 'Isi teks disini';
                  const isActiveCaret = activeChunkIndex === num - 1;

                  return (
                    <button
                      key={`col_badge_${num}`}
                      type="button"
                      onClick={() => {
                        setActiveChunkIndex(num - 1);
                        const targetEl = textareaRefs.current[num - 1];
                        if (targetEl) {
                          targetEl.focus();
                        }
                      }}
                      className={`w-5.5 h-5.5 rounded-md flex items-center justify-center text-[10px] font-bold border transition-all cursor-pointer ${
                        isActiveCaret
                          ? 'bg-emerald-500 text-slate-950 font-black border-emerald-300 ring-2 ring-emerald-400/60 shadow-md shadow-emerald-500/30 scale-110'
                          : hasText
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 hover:bg-cyan-500/30'
                          : 'bg-slate-950 text-slate-500 border-slate-800 hover:border-slate-700'
                      }`}
                      title={`Kolom ${num}: ${isActiveCaret ? 'Posisi Kursor Saat Ini' : hasText ? 'Terisi' : 'Kosong'}`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>

              {/* Paste Button */}
              <button
                type="button"
                onClick={handlePasteFromClipboard}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white border border-slate-700 transition cursor-pointer flex items-center justify-center shadow-sm"
                title={pasteSuccess ? 'Tersalin dari Clipboard!' : 'Tempel teks dari Clipboard'}
                aria-label="Tempel Teks"
              >
                <Clipboard className="w-4 h-4" />
              </button>
            </div>

            {/* Single Unified Column Container with Clean Dotted Line Dividers */}
            <div className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 min-h-[160px] flex flex-col focus-within:border-cyan-500 transition-colors">
              {chunks.map((chunkVal, chunkIdx) => {
                const isFirst = chunkIdx === 0;

                return (
                  <React.Fragment key={`chunk_field_${chunkIdx}`}>
                    {/* Dotted Line Divider (Garis Titik-Titik Saja Tanpa Tulisan) */}
                    {!isFirst && (
                      <div className="w-full border-t-2 border-dotted border-cyan-400/50 my-2 select-none" />
                    )}

                    {/* Column Input Field Auto-Resize */}
                    <textarea
                      ref={(el) => {
                        textareaRefs.current[chunkIdx] = el;
                        if (el) {
                          el.style.height = 'auto';
                          el.style.height = `${el.scrollHeight}px`;
                        }
                      }}
                      value={chunkVal}
                      onFocus={() => setActiveChunkIndex(chunkIdx)}
                      onClick={() => setActiveChunkIndex(chunkIdx)}
                      onKeyUp={() => setActiveChunkIndex(chunkIdx)}
                      onChange={(e) => {
                        setActiveChunkIndex(chunkIdx);
                        e.target.style.height = 'auto';
                        e.target.style.height = `${e.target.scrollHeight}px`;
                        handleChunkChange(chunkIdx, e.target.value);
                      }}
                      onKeyDown={(e) => handleChunkKeyDown(chunkIdx, e)}
                      rows={Math.max(1, chunkVal.split('\n').length)}
                      placeholder={
                        isFirst
                          ? 'Ketik atau tempel teks disini... (Tekan Enter 2x untuk kolom berikutnya)'
                          : ''
                      }
                      className="w-full bg-transparent border-0 outline-none text-xs text-white placeholder-slate-500 font-mono resize-none leading-relaxed p-0 overflow-hidden block"
                    />
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Pilihan Font */}
          <div className="space-y-1.5 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <label className="text-slate-300 font-semibold flex items-center justify-between">
              <span>Pilihan Font:</span>
              <span className="text-[10px] text-cyan-400 font-mono">
                {AVAILABLE_FONTS.find(f => f.value === currentFontFamily)?.name || 'Plus Jakarta Sans'}
              </span>
            </label>

            <div className="relative">
              <select
                value={currentFontFamily}
                onChange={(e) => onUpdateProps({ fontFamily: e.target.value })}
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
            {/* Ukuran Font Stepper */}
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px] font-medium">Ukuran Font:</span>
                <span className="text-[10px] text-cyan-400 font-mono font-bold">{currentFontSize} px</span>
              </div>
              <div className="flex items-center justify-between bg-slate-900 rounded-lg p-1 border border-slate-800">
                <button
                  type="button"
                  onClick={() => onUpdateProps({ fontSize: Math.max(1, currentFontSize - 1) })}
                  className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 active:bg-cyan-600 text-slate-200 text-sm font-bold flex items-center justify-center transition cursor-pointer"
                  title="Kurang Ukuran Font"
                >
                  -
                </button>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={currentFontSize}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) {
                      onUpdateProps({ fontSize: Math.max(1, Math.min(60, val)) });
                    }
                  }}
                  className="w-12 text-center bg-transparent font-mono text-cyan-300 font-bold text-xs outline-none"
                />
                <button
                  type="button"
                  onClick={() => onUpdateProps({ fontSize: Math.min(60, currentFontSize + 1) })}
                  className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 active:bg-cyan-600 text-slate-200 text-sm font-bold flex items-center justify-center transition cursor-pointer"
                  title="Tambah Ukuran Font"
                >
                  +
                </button>
              </div>
              <input
                type="range"
                min={1}
                max={30}
                value={currentFontSize}
                onChange={(e) => onUpdateProps({ fontSize: parseInt(e.target.value, 10) })}
                className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer mt-0.5"
                title={`Geser ukuran font: ${currentFontSize}px`}
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
              <input
                type="range"
                min={8}
                max={35}
                value={Math.round(currentLineHeight * 10)}
                onChange={(e) => onUpdateProps({ lineHeight: parseInt(e.target.value, 10) / 10 })}
                className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer mt-0.5"
                title={`Geser jarak baris: ${currentLineHeight.toFixed(1)}x`}
              />
            </div>
          </div>

          {/* Ukuran Kolom (Lebar Kolom Teks, Default 49%) */}
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 text-[11px] font-medium">Ukuran Lebar Kolom:</span>
              <span className="text-[10px] text-amber-300 font-mono font-bold">{currentWidth}%</span>
            </div>
            <div className="flex items-center justify-between bg-slate-900 rounded-lg p-1 border border-slate-800">
              <button
                type="button"
                onClick={() => onUpdateProps({ width: Math.max(10, currentWidth - 1) })}
                className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 active:bg-cyan-600 text-slate-200 text-sm font-bold flex items-center justify-center transition cursor-pointer"
                title="Perkecil Ukuran Kolom (-1%)"
              >
                -
              </button>
              <input
                type="number"
                min={10}
                max={100}
                value={currentWidth}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val)) {
                    onUpdateProps({ width: Math.max(10, Math.min(100, val)) });
                  }
                }}
                className="w-16 text-center bg-transparent font-mono text-amber-300 font-bold text-xs outline-none"
              />
              <button
                type="button"
                onClick={() => onUpdateProps({ width: Math.min(100, currentWidth + 1) })}
                className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 active:bg-cyan-600 text-slate-200 text-sm font-bold flex items-center justify-center transition cursor-pointer"
                title="Perbesar Ukuran Kolom (+1%)"
              >
                +
              </button>
            </div>
            <input
              type="range"
              min={15}
              max={100}
              value={currentWidth}
              onChange={(e) => onUpdateProps({ width: parseInt(e.target.value, 10) })}
              className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer mt-0.5"
              title={`Geser ukuran lebar kolom: ${currentWidth}%`}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-[10px] text-slate-500">
            Pengaturan admin
          </span>

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
