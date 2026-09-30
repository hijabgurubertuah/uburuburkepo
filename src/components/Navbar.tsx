import React from 'react';
import { 
  FileText, 
  Upload, 
  Download, 
  HelpCircle, 
  Sparkles, 
  FolderOpen, 
  Layers, 
  Plus
} from 'lucide-react';
import { UburUburLogo } from './UburUburLogo';

interface NavbarProps {
  totalPages: number;
  activePageIndex: number;
  onUploadClick: () => void;
  onDriveImportClick: () => void;
  onExportClick: () => void;
  onOpenGuide: () => void;
  onLoadSample: () => void;
  onAddBlankPage: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  totalPages,
  activePageIndex,
  onUploadClick,
  onDriveImportClick,
  onExportClick,
  onOpenGuide,
  onLoadSample,
  onAddBlankPage,
}) => {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 flex items-center justify-between z-30 select-none">
      {/* Brand & Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-950 via-slate-900 to-indigo-950 border border-cyan-500/30 flex items-center justify-center shadow-lg shadow-cyan-500/10">
          <UburUburLogo className="w-8 h-8" size={32} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-base md:text-lg text-white tracking-tight">
              Ubur Ubur <span className="text-cyan-400">Kepo</span>
            </h1>
            <span className="text-[10px] font-semibold tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full hidden sm:inline-block">
              Editor Teks Kolom
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden md:block">
            Atur teks 7 kolom pada dokumen dan ekspor ke PDF
          </p>
        </div>
      </div>

      {/* Center status indicator */}
      {totalPages > 0 && (
        <div className="hidden lg:flex items-center gap-2 bg-slate-800/80 border border-slate-700/70 rounded-full px-3 py-1 text-xs text-slate-300">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>
            Halaman <span className="text-white font-semibold">{activePageIndex + 1}</span> dari <span className="text-white font-semibold">{totalPages}</span>
          </span>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        {/* Load Sample / Blank */}
        <button
          onClick={onLoadSample}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
          title="Buka contoh berkas/surat untuk mencoba"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Contoh Demo</span>
        </button>

        {/* Drive Import Link */}
        <button
          onClick={onDriveImportClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 transition"
          title="Ambil gambar dari Link Google Drive atau URL"
        >
          <FolderOpen className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden sm:inline">Link Drive / URL</span>
        </button>

        {/* Upload Button */}
        <button
          onClick={onUploadClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 border border-indigo-500/40 hover:border-indigo-400 transition"
          title="Upload file PDF atau Foto dari perangkat"
        >
          <Upload className="w-3.5 h-3.5 text-indigo-400" />
          <span>Upload PDF/Gambar</span>
        </button>

        {/* Export to PDF Button */}
        <button
          onClick={onExportClick}
          disabled={totalPages === 0}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white shadow-md transition ${
            totalPages > 0
              ? 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 shadow-indigo-600/30'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800'
          }`}
          title="Simpan semua gambar/halaman dengan teks ke PDF"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Simpan PDF</span>
        </button>

        {/* Guide / Help */}
        <button
          onClick={onOpenGuide}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title="Panduan Penggunaan"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
