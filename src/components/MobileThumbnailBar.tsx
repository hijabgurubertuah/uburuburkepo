import React from 'react';
import { Plus, Check, ImageIcon } from 'lucide-react';
import { ImagePage } from '../types';

interface MobileThumbnailBarProps {
  pages: ImagePage[];
  activePageIndex: number;
  onSelectPage: (index: number) => void;
  onAddNewPage: () => void;
}

export const MobileThumbnailBar: React.FC<MobileThumbnailBarProps> = ({
  pages,
  activePageIndex,
  onSelectPage,
  onAddNewPage,
}) => {
  return (
    <div className="block md:hidden bg-slate-900/95 backdrop-blur-md border-b border-slate-800 py-2 px-3 z-30 select-none shadow-lg">
      <div className="flex items-center justify-between mb-1.5 px-0.5">
        <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
          <span>Pilih Gambar / Halaman ({pages.length})</span>
        </span>
        <button
          onClick={onAddNewPage}
          className="text-[10px] font-semibold text-cyan-300 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 transition cursor-pointer"
        >
          <Plus className="w-3 h-3" />
          <span>+ Tambah Halaman</span>
        </button>
      </div>

      {/* Horizontal Scrollable Thumbnails Strip for HP */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-thin scrollbar-thumb-slate-700">
        {pages.map((page, index) => {
          const isSelected = index === activePageIndex;
          const hasText = (page.annotations?.[0]?.text || '').trim().length > 0;

          return (
            <button
              key={page.id}
              onClick={() => onSelectPage(index)}
              className={`relative flex-shrink-0 w-20 rounded-lg overflow-hidden border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'border-cyan-400 ring-2 ring-cyan-500 bg-slate-800 shadow-md shadow-cyan-950/50 scale-102'
                  : 'border-slate-800 bg-slate-950/80 opacity-75 hover:opacity-100 hover:border-slate-700'
              }`}
            >
              {/* Thumbnail Image */}
              <div className="relative aspect-[16/11] bg-slate-900 flex items-center justify-center overflow-hidden">
                <img
                  src={page.dataUrl}
                  alt={page.title}
                  className="w-full h-full object-cover"
                  loading="eager"
                  onError={(e) => {
                    const target = e.currentTarget;
                    // Fallback to direct lh3 link if proxy had an issue
                    const rawId = page.id.replace('page_', '');
                    if (rawId && !target.src.includes('googleusercontent')) {
                      target.src = `https://lh3.googleusercontent.com/d/${rawId}`;
                    }
                  }}
                />

                {/* Status Dot (Filled) */}
                {hasText && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-1 ring-slate-950 flex items-center justify-center">
                    <Check className="w-1.5 h-1.5 text-slate-950 stroke-[3]" />
                  </span>
                )}
              </div>

              {/* Page Number Label */}
              <div
                className={`py-0.5 px-1.5 text-[9px] font-bold truncate flex items-center justify-between ${
                  isSelected ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900 text-slate-300'
                }`}
              >
                <span>Hlm {index + 1}</span>
                {isSelected && <span className="text-[8px] uppercase tracking-wider font-extrabold">Aktif</span>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
