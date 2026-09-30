import React from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  Trash2, 
  Copy, 
  Plus, 
  Layers, 
  Type, 
  UploadCloud,
  FileCheck
} from 'lucide-react';
import { ImagePage } from '../types';

interface ThumbnailSidebarProps {
  pages: ImagePage[];
  activePageIndex: number;
  onSelectPage: (index: number) => void;
  onMovePage: (fromIndex: number, toIndex: number) => void;
  onDuplicatePage: (index: number) => void;
  onDeletePage: (index: number) => void;
  onAddNewPage: () => void;
  onCopyAnnotationsToAll: (sourceIndex: number) => void;
}

export const ThumbnailSidebar: React.FC<ThumbnailSidebarProps> = ({
  pages,
  activePageIndex,
  onSelectPage,
  onMovePage,
  onDuplicatePage,
  onDeletePage,
  onAddNewPage,
  onCopyAnnotationsToAll,
}) => {
  const activePage = pages[activePageIndex];
  const activeAnnotationCount = activePage?.annotations?.length || 0;

  return (
    <aside className="w-56 md:w-64 border-r border-slate-800 bg-slate-900/95 flex flex-col h-[calc(100vh-4rem)] select-none">
      {/* Sidebar Header */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-semibold text-slate-200">
            Daftar Halaman ({pages.length})
          </span>
        </div>
        <button
          onClick={onAddNewPage}
          className="p-1 rounded bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition text-xs flex items-center gap-1 px-2"
          title="Tambah Halaman / Gambar"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah</span>
        </button>
      </div>

      {/* Quick Action: Apply to all pages */}
      {pages.length > 1 && activeAnnotationCount > 0 && (
        <div className="p-2 border-b border-slate-800/80 bg-slate-800/40">
          <button
            onClick={() => onCopyAnnotationsToAll(activePageIndex)}
            className="w-full py-1.5 px-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 rounded-md text-[11px] font-medium flex items-center justify-center gap-1.5 transition"
            title="Salin semua teks dari halaman ini ke seluruh halaman lain pada posisi yang sama"
          >
            <FileCheck className="w-3 h-3 text-cyan-400" />
            <span>Terapkan Teks ke Semua Hal.</span>
          </button>
        </div>
      )}

      {/* Pages List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {pages.length === 0 ? (
          <div className="text-center py-12 px-3 text-slate-500 text-xs">
            <UploadCloud className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p className="font-medium text-slate-400">Belum ada gambar</p>
            <p className="text-[11px] mt-1">Upload PDF atau gambar untuk memulai</p>
          </div>
        ) : (
          pages.map((page, index) => {
            const isActive = index === activePageIndex;
            const annCount = page.annotations?.length || 0;

            return (
              <div
                key={page.id}
                onClick={() => onSelectPage(index)}
                className={`group relative rounded-xl border p-2 transition cursor-pointer ${
                  isActive
                    ? 'bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-950/50 ring-1 ring-indigo-500/50'
                    : 'bg-slate-800/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80'
                }`}
              >
                {/* Header item: page number & title */}
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                        isActive
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span
                      className={`text-[11px] truncate max-w-[120px] font-medium ${
                        isActive ? 'text-white' : 'text-slate-300'
                      }`}
                      title={page.title}
                    >
                      {page.title || `Halaman ${index + 1}`}
                    </span>
                  </div>

                  {annCount > 0 && (
                    <span className="flex items-center gap-1 text-[10px] bg-slate-700/80 text-cyan-300 px-1.5 py-0.5 rounded-full border border-slate-600/50">
                      <Type className="w-2.5 h-2.5" />
                      {annCount}
                    </span>
                  )}
                </div>

                {/* Thumbnail Preview with Annotations representation */}
                <div className="relative aspect-[3/4] bg-slate-950 rounded-lg overflow-hidden border border-slate-700/60 flex items-center justify-center">
                  <img
                    src={page.dataUrl}
                    alt={page.title}
                    className="w-full h-full object-contain pointer-events-none"
                    loading="lazy"
                  />

                  {/* Tiny annotation badges overlay preview */}
                  {page.annotations.map((ann) => (
                    <div
                      key={ann.id}
                      style={{
                        left: `${ann.x}%`,
                        top: `${ann.y}%`,
                        backgroundColor: ann.color || '#3b82f6',
                      }}
                      className="absolute w-2 h-2 rounded-full ring-1 ring-white/70 shadow-sm pointer-events-none"
                      title={ann.text}
                    />
                  ))}
                </div>

                {/* Page Action Controls (Move, Duplicate, Delete) */}
                <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-800/80 opacity-80 group-hover:opacity-100 transition">
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (index > 0) onMovePage(index, index - 1);
                      }}
                      disabled={index === 0}
                      className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white disabled:opacity-20 transition"
                      title="Pindahkan ke Atas"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (index < pages.length - 1) onMovePage(index, index + 1);
                      }}
                      disabled={index === pages.length - 1}
                      className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white disabled:opacity-20 transition"
                      title="Pindahkan ke Bawah"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicatePage(index);
                      }}
                      className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-cyan-300 transition"
                      title="Duplikat Halaman Ini"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePage(index);
                      }}
                      disabled={pages.length <= 1}
                      className="p-1 rounded hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 disabled:opacity-20 transition"
                      title={pages.length <= 1 ? 'Tidak dapat menghapus halaman terakhir' : 'Hapus Halaman Ini'}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};
