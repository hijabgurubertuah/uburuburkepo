import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  X, 
  Type, 
  Copy, 
  Lock, 
  ChevronDown,
  Bold,
  Italic,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  CheckCheck,
  Palette,
  Check,
  AlertCircle
} from 'lucide-react';
import { TextAnnotation } from '../types';
import { LockedLayoutConfig } from '../config/lockedLayout';
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
  onApplyPropsToAllPages?: (updates: Partial<TextAnnotation>) => void;
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

const DARK_FONT_COLORS = [
  { name: 'Hitam Pekat', hex: '#000000' },
  { name: 'Merah Gelap', hex: '#881337' },
  { name: 'Marun Crimson', hex: '#7f1d1d' },
  { name: 'Biru Gelap', hex: '#1e3a8a' },
  { name: 'Navy Deep', hex: '#0f172a' },
  { name: 'Hijau Gelap', hex: '#14532d' },
  { name: 'Emerald Gelap', hex: '#064e3b' },
  { name: 'Ungu Gelap', hex: '#581c87' },
  { name: 'Cokelat Gelap', hex: '#451a03' },
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
  onApplyPropsToAllPages,
  lockedLayout,
  onUpdateLockedLayout,
}) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const [applyAllSuccess, setApplyAllSuccess] = useState(false);
  const [showConfirmApplyAll, setShowConfirmApplyAll] = useState(false);

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

  const handleCopyToClipboard = async () => {
    try {
      // Salin seluruh isi teks dalam kolom termasuk enternya
      let lastNonEmptyIndex = -1;
      for (let i = chunks.length - 1; i >= 0; i--) {
        if (chunks[i] && chunks[i].trim() !== '') {
          lastNonEmptyIndex = i;
          break;
        }
      }
      const populatedChunks = lastNonEmptyIndex >= 0 ? chunks.slice(0, lastNonEmptyIndex + 1) : chunks;
      const textToCopy = populatedChunks.join('\n\n');

      await navigator.clipboard.writeText(textToCopy);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Gagal menyalin teks ke clipboard:', err);
    }
  };

  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 640 : false;
  const currentFontSize = representativeAnn?.fontSize || (isMobile ? 5 : 13);
  const currentLineHeight = representativeAnn?.lineHeight || 1.2;
  const currentWidth = representativeAnn?.width || 49;
  const currentFontFamily = representativeAnn?.fontFamily || '"Plus Jakarta Sans", sans-serif';
  const currentFontWeight = representativeAnn?.fontWeight || 'normal';
  const currentFontStyle = representativeAnn?.fontStyle || 'normal';
  const currentTextAlign = representativeAnn?.textAlign || 'left';
  const currentColor = representativeAnn?.color || '#000000';

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
      <aside className="fixed inset-y-0 left-0 z-50 w-80 sm:w-96 bg-teal-950 border-r border-teal-800 shadow-2xl flex flex-col select-none animate-in slide-in-from-left duration-200">
        {/* Header */}
        <div className="p-3.5 border-b border-teal-800 bg-teal-900/95 flex items-center justify-between">
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

              {/* Copy Button */}
              <button
                type="button"
                onClick={handleCopyToClipboard}
                className={`p-1.5 rounded-lg border transition cursor-pointer flex items-center justify-center shadow-sm ${
                  copySuccess
                    ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50'
                    : 'bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white border-slate-700'
                }`}
                title={copySuccess ? 'Berhasil Disalin ke Clipboard!' : 'Salin Seluruh Teks dalam Kolom (Termasuk Enter)'}
                aria-label="Salin Seluruh Teks"
              >
                {copySuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
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

          {/* Format Teks & Penjajaran (Alignment) */}
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-semibold text-[11px]">Format & Penjajaran Teks:</span>
              <span className="text-[10px] text-cyan-400 font-mono">
                {currentFontWeight === 'bold' ? 'Bold ' : ''}{currentFontStyle === 'italic' ? 'Italic ' : ''}({currentTextAlign})
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800">
              {/* Bold */}
              <button
                type="button"
                onClick={() => onUpdateProps({ fontWeight: currentFontWeight === 'bold' ? 'normal' : 'bold' })}
                className={`flex-1 py-1.5 rounded flex items-center justify-center transition cursor-pointer text-xs font-bold ${
                  currentFontWeight === 'bold'
                    ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="Tebal (Bold)"
                aria-label="Tebal"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>

              {/* Italic */}
              <button
                type="button"
                onClick={() => onUpdateProps({ fontStyle: currentFontStyle === 'italic' ? 'normal' : 'italic' })}
                className={`flex-1 py-1.5 rounded flex items-center justify-center transition cursor-pointer text-xs italic ${
                  currentFontStyle === 'italic'
                    ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="Miring (Italic)"
                aria-label="Miring"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>

              <div className="h-4 w-px bg-slate-800 my-auto" />

              {/* Align Left (Rata Kiri) */}
              <button
                type="button"
                onClick={() => onUpdateProps({ textAlign: 'left' })}
                className={`flex-1 py-1.5 rounded flex items-center justify-center transition cursor-pointer ${
                  currentTextAlign === 'left'
                    ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="Rata Kiri"
                aria-label="Rata Kiri"
              >
                <AlignLeft className="w-3.5 h-3.5" />
              </button>

              {/* Align Center (Rata Tengah) */}
              <button
                type="button"
                onClick={() => onUpdateProps({ textAlign: 'center' })}
                className={`flex-1 py-1.5 rounded flex items-center justify-center transition cursor-pointer ${
                  currentTextAlign === 'center'
                    ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="Rata Tengah"
                aria-label="Rata Tengah"
              >
                <AlignCenter className="w-3.5 h-3.5" />
              </button>

              {/* Align Right (Rata Kanan) */}
              <button
                type="button"
                onClick={() => onUpdateProps({ textAlign: 'right' })}
                className={`flex-1 py-1.5 rounded flex items-center justify-center transition cursor-pointer ${
                  currentTextAlign === 'right'
                    ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="Rata Kanan"
                aria-label="Rata Kanan"
              >
                <AlignRight className="w-3.5 h-3.5" />
              </button>

              {/* Align Justify (Rata Kanan Kiri) */}
              <button
                type="button"
                onClick={() => onUpdateProps({ textAlign: 'justify' })}
                className={`flex-1 py-1.5 rounded flex items-center justify-center transition cursor-pointer ${
                  currentTextAlign === 'justify'
                    ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50 shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title="Rata Kanan Kiri (Justify)"
                aria-label="Rata Kanan Kiri"
              >
                <AlignJustify className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Stepper Controls 2x2 Grid: Ukuran Font, Jarak Baris, Lebar Kolom & Warna Font Gelap */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Box 1: Ukuran Font Stepper */}
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

            {/* Box 2: Jarak Baris Stepper */}
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

            {/* Box 3: Ukuran Lebar Kolom Stepper (Kini berukuran sama dengan font & jarak baris) */}
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px] font-medium">Lebar Kolom:</span>
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
                  className="w-12 text-center bg-transparent font-mono text-amber-300 font-bold text-xs outline-none"
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

            {/* Box 4: 9 Pilihan Warna Font Gelap */}
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 flex flex-col justify-between gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px] font-medium flex items-center gap-1">
                  <Palette className="w-3 h-3 text-cyan-400" />
                  <span>Warna Font:</span>
                </span>
                <span 
                  className="w-3 h-3 rounded-full border border-slate-600 shrink-0 shadow-xs" 
                  style={{ backgroundColor: currentColor }} 
                  title={`Warna aktif: ${DARK_FONT_COLORS.find(c => c.hex.toLowerCase() === currentColor.toLowerCase())?.name || currentColor}`}
                />
              </div>

              {/* Grid 9 Swatches */}
              <div className="grid grid-cols-5 gap-1.5 items-center justify-items-center bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
                {DARK_FONT_COLORS.map((colorItem) => {
                  const isSelected = currentColor.toLowerCase() === colorItem.hex.toLowerCase();
                  return (
                    <button
                      key={colorItem.hex}
                      type="button"
                      onClick={() => onUpdateProps({ color: colorItem.hex })}
                      className={`w-5 h-5 rounded-full transition-all cursor-pointer flex items-center justify-center relative ${
                        isSelected 
                          ? 'ring-2 ring-cyan-400 scale-110 shadow-md shadow-cyan-500/20 z-10' 
                          : 'hover:scale-110 opacity-85 hover:opacity-100 border border-white/10'
                      }`}
                      style={{ backgroundColor: colorItem.hex }}
                      title={`Pilih Warna: ${colorItem.name}`}
                      aria-label={`Warna ${colorItem.name}`}
                    >
                      {isSelected && (
                        <Check className="w-3 h-3 text-white drop-shadow-md" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tombol Terapkan Gaya Teks ke Semua Kanvas di Bagian Paling Bawah */}
          <div className="pt-2 mt-auto">
            <button
              type="button"
              onClick={() => setShowConfirmApplyAll(true)}
              className="w-full py-2.5 px-3 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 active:bg-cyan-600/40 text-cyan-300 border border-cyan-500/30 font-semibold text-xs transition cursor-pointer flex items-center justify-center shadow-md text-center"
              title="Terapkan font, ukuran, jarak baris, tebal, miring, warna & ratarata teks ke SELURUH kanvas"
            >
              <span>{applyAllSuccess ? 'Telah Diterapkan ke Semua Kanvas!' : 'Terapkan Gaya Teks ke Semua Kanvas'}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Notifikasi Konfirmasi Terapkan ke Semua Halaman */}
      {showConfirmApplyAll && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
                <AlertCircle className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Terapkan Pengaturan ke Semua Halaman?
                </h3>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  Apakah Anda yakin ingin menerapkan pengaturan gaya teks ini (font, ukuran, jarak baris, tebal, miring, warna, dan penjajaran) ke seluruh kanvas?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => setShowConfirmApplyAll(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onApplyPropsToAllPages) {
                    onApplyPropsToAllPages({
                      fontFamily: currentFontFamily,
                      fontSize: currentFontSize,
                      lineHeight: currentLineHeight,
                      width: currentWidth,
                      fontWeight: currentFontWeight,
                      fontStyle: currentFontStyle,
                      textAlign: currentTextAlign,
                      color: currentColor,
                    });
                    setApplyAllSuccess(true);
                    setTimeout(() => setApplyAllSuccess(false), 2200);
                  }
                  setShowConfirmApplyAll(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-md shadow-cyan-600/20 transition cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Ya, Terapkan</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
