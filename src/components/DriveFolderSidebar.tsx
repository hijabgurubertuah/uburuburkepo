import React, { useRef } from 'react';
import { 
  X, 
  Image as ImageIcon, 
  Plus, 
  Check, 
  UploadCloud, 
  Sparkles,
  FileText,
  Copy,
  Trash2
} from 'lucide-react';
import { ImagePage } from '../types';
import { DriveFolderFile } from '../utils/folderService';

interface DriveFolderSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  templates: DriveFolderFile[];
  pages: ImagePage[];
  activePageIndex: number;
  onSelectPage: (index: number) => void;
  onSelectTemplate: (template: DriveFolderFile) => void;
  onAddNewPage: () => void;
  onUploadCustomImage: (file: File) => void;
  onDeletePage?: (index: number) => void;
  onDuplicatePage?: (index: number) => void;
}

export const DriveFolderSidebar: React.FC<DriveFolderSidebarProps> = ({
  isOpen,
  onClose,
  templates,
  pages,
  activePageIndex,
  onSelectPage,
  onSelectTemplate,
  onAddNewPage,
  onUploadCustomImage,
  onDeletePage,
  onDuplicatePage,
}) => {
  const customFileInputRef = useRef<HTMLInputElement>(null);

  const handleCustomFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadCustomImage(file);
      e.target.value = '';
    }
  };

  if (!isOpen) return null;

  const activePage = pages[activePageIndex] || pages[0];

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs"
      />

      {/* Sidebar 1: Galeri Gambar & Template Dokumen */}
      <aside className="fixed inset-y-0 left-0 z-50 w-80 sm:w-88 bg-slate-900 border-r border-slate-800 shadow-2xl flex flex-col select-none animate-in slide-in-from-left duration-200">
        <input
          ref={customFileInputRef}
          type="file"
          accept="image/*"
          onChange={handleCustomFileSelected}
          className="hidden"
        />

        {/* Header */}
        <div className="p-3.5 border-b border-slate-800 bg-slate-900/95 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-white tracking-tight">
                  Pilih Gambar Dokumen
                </h2>
                <p className="text-[10px] text-cyan-300 font-medium">
                  🎯 Target: Halaman #{activePageIndex + 1} dari {pages.length}
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

          {/* Page Switcher Tabs if there are multiple pages */}
          {pages.length > 1 && (
            <div className="pt-1.5 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                <span>Pilih Halaman:</span>
                <span>{pages.length} Lembar Total</span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {pages.map((p, idx) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onSelectPage(idx)}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-semibold shrink-0 transition cursor-pointer flex items-center gap-1 ${
                      idx === activePageIndex
                        ? 'bg-cyan-500 text-slate-950 shadow-sm'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <span>Hal {idx + 1}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Thumbnail Gallery (All Available Images) */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          <div className="text-[10px] text-slate-400 flex items-center justify-between">
            <span>Daftar Template Gambar:</span>
            <span className="text-cyan-400">Klik untuk menerapkan</span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {templates.map((tpl) => {
              const tplUrl = tpl.directUrl || tpl.proxyUrl;
              const isApplied = activePage && (activePage.dataUrl === tplUrl || activePage.title === tpl.name);

              return (
                <div
                  key={tpl.id}
                  onClick={() => {
                    onSelectTemplate(tpl);
                  }}
                  className={`group relative rounded-xl border p-2.5 transition cursor-pointer ${
                    isApplied
                      ? 'bg-cyan-950/30 border-cyan-500 ring-2 ring-cyan-500 shadow-lg shadow-cyan-950/50'
                      : 'bg-slate-800/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80'
                  }`}
                >
                  {/* Template Title & Status Badge */}
                  <div className="flex items-center justify-between text-xs mb-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="p-1 rounded bg-cyan-500/20 text-cyan-400">
                        <ImageIcon className="w-3 h-3" />
                      </div>
                      <span
                        className={`font-semibold text-xs truncate ${
                          isApplied ? 'text-cyan-300 font-bold' : 'text-slate-200'
                        }`}
                        title={tpl.name}
                      >
                        {tpl.name}
                      </span>
                    </div>

                    <div>
                      {isApplied ? (
                        <span className="flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-semibold">
                          <Check className="w-2.5 h-2.5 text-emerald-400" />
                          <span>Terpasang</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 group-hover:text-cyan-300 transition">
                          Pilih Ini →
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Landscape Image Preview Box */}
                  <div className="relative aspect-[16/11] bg-slate-950 rounded-lg overflow-hidden border border-slate-700/60 flex items-center justify-center">
                    <img
                      src={tplUrl}
                      alt={tpl.name}
                      className="w-full h-full object-cover pointer-events-none group-hover:scale-102 transition-transform duration-200"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.currentTarget;
                        const rawId = tpl.id;
                        if (rawId && !target.src.includes('googleusercontent')) {
                          target.src = `https://lh3.googleusercontent.com/d/${rawId}`;
                        } else if (rawId && target.src.includes('googleusercontent')) {
                          target.src = `/api/drive-image?id=${rawId}`;
                        }
                      }}
                    />

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-cyan-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-xs font-semibold gap-1.5 backdrop-blur-xs">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                      <span>Gunakan untuk Halaman #{activePageIndex + 1}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions: Upload Gambar & Tambah Halaman */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/95 space-y-2">
          <button
            type="button"
            onClick={() => customFileInputRef.current?.click()}
            className="w-full py-2 px-3 rounded-xl border border-slate-700 hover:border-cyan-500/50 bg-slate-800/80 hover:bg-slate-800 text-xs font-medium text-slate-200 hover:text-white flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
          >
            <UploadCloud className="w-4 h-4 text-cyan-400" />
            <span>Unggah Gambar dari Komputer</span>
          </button>

          <button
            type="button"
            onClick={onAddNewPage}
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-semibold text-white flex items-center justify-center gap-2 transition shadow-md shadow-blue-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Lembar Halaman Baru</span>
          </button>
        </div>
      </aside>
    </>
  );
};
