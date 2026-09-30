import React, { useRef, useState } from 'react';
import { 
  X, 
  Image as ImageIcon, 
  Type, 
  Plus, 
  RefreshCcw, 
  Trash2, 
  Copy,
  ChevronRight
} from 'lucide-react';
import { ImagePage } from '../types';

interface DriveFolderSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  pages: ImagePage[];
  activePageIndex: number;
  onSelectPage: (index: number) => void;
  onAddNewPage: () => void;
  onReplacePageImage: (index: number, file: File) => void;
  onDeletePage: (index: number) => void;
  onDuplicatePage: (index: number) => void;
}

export const DriveFolderSidebar: React.FC<DriveFolderSidebarProps> = ({
  isOpen,
  onClose,
  pages,
  activePageIndex,
  onSelectPage,
  onAddNewPage,
  onReplacePageImage,
  onDeletePage,
  onDuplicatePage,
}) => {
  const replacePageFileInputRef = useRef<HTMLInputElement>(null);
  const [targetReplaceIndex, setTargetReplaceIndex] = useState<number | null>(null);

  const handleReplacePageSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && targetReplaceIndex !== null) {
      onReplacePageImage(targetReplaceIndex, file);
      setTargetReplaceIndex(null);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs"
      />

      {/* Sidebar 1: Daftar Gambar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-72 sm:w-80 bg-slate-900 border-r border-slate-800 shadow-2xl flex flex-col select-none animate-in slide-in-from-left duration-200">
        <input
          ref={replacePageFileInputRef}
          type="file"
          accept="image/*"
          onChange={handleReplacePageSelected}
          className="hidden"
        />

        {/* Header */}
        <div className="p-3 border-b border-slate-800 bg-slate-900/95 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-white tracking-tight">
                  Daftar Gambar ({pages.length})
                </h2>
                <p className="text-[10px] text-slate-400">
                  Halaman terbaru di atas, selesai di bawah
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Tutup"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Thumbnails List (Top to Bottom) */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5">
          {pages.map((page, index) => {
            const isSelected = index === activePageIndex;
            const hasText = (page.annotations?.[0]?.text || '').trim().length > 0;

            return (
              <div
                key={page.id}
                onClick={() => {
                  onSelectPage(index);
                  if (window.innerWidth < 768) {
                    onClose();
                  }
                }}
                className={`group relative rounded-xl border p-2 transition cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800/90 border-cyan-500 ring-1 ring-cyan-500 shadow-lg shadow-cyan-950/40'
                    : 'bg-slate-800/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/70'
                }`}
              >
                {/* Header item */}
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-4 h-4 rounded text-[10px] font-bold flex items-center justify-center ${
                        isSelected
                          ? 'bg-cyan-500 text-slate-950'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span
                      className={`font-semibold text-xs truncate max-w-[140px] ${
                        isSelected ? 'text-white' : 'text-slate-200'
                      }`}
                      title={page.title}
                    >
                      {page.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {hasText ? (
                      <span className="flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded-full border border-emerald-500/30">
                        <Type className="w-2.5 h-2.5 text-emerald-400" />
                        <span>Terisi</span>
                      </span>
                    ) : (
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded">
                        Kosong
                      </span>
                    )}
                    {isSelected && (
                      <span className="text-[10px] text-cyan-400 font-semibold ml-1">Aktif</span>
                    )}
                  </div>
                </div>

                {/* Landscape Preview */}
                <div className="relative aspect-[16/11] bg-slate-950 rounded-lg overflow-hidden border border-slate-700/60 flex items-center justify-center">
                  <img
                    src={page.dataUrl}
                    alt={page.title}
                    className="w-full h-full object-cover pointer-events-none group-hover:scale-102 transition-transform duration-200"
                    loading="eager"
                    onError={(e) => {
                      const target = e.currentTarget;
                      const rawId = page.id.replace('page_', '');
                      if (rawId && !target.src.includes('googleusercontent')) {
                        target.src = `https://lh3.googleusercontent.com/d/${rawId}`;
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[11px] font-medium gap-1">
                    <span>Pilih Gambar</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Bottom actions */}
                <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-800/80 text-[10px] text-slate-400">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTargetReplaceIndex(index);
                      replacePageFileInputRef.current?.click();
                    }}
                    className="hover:text-cyan-300 flex items-center gap-1 py-0.5 px-1 rounded hover:bg-slate-700/60 transition cursor-pointer"
                    title="Ganti gambar pada halaman ini"
                  >
                    <RefreshCcw className="w-3 h-3 text-cyan-400" />
                    <span>Ganti Gambar</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicatePage(index);
                      }}
                      className="hover:text-cyan-300 p-1 rounded hover:bg-slate-700/60 transition cursor-pointer"
                      title="Duplikat"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (pages.length > 1) onDeletePage(index);
                      }}
                      disabled={pages.length <= 1}
                      className="hover:text-rose-400 p-1 rounded hover:bg-rose-950/40 disabled:opacity-20 transition cursor-pointer"
                      title="Hapus"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
};
