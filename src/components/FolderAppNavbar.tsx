import React from 'react';
import { FileText, Download } from 'lucide-react';

interface FolderAppNavbarProps {
  totalPages: number;
  onExportPdf: () => void;
}

export const FolderAppNavbar: React.FC<FolderAppNavbarProps> = ({
  totalPages,
  onExportPdf,
}) => {
  return (
    <header className="h-14 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 flex items-center justify-between z-30 select-none">
      {/* Brand: Cukup Judul Ubur Ubur Kepo */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
          <FileText className="w-4 h-4 text-white" />
        </div>
        <h1 className="font-bold text-sm tracking-tight text-white">
          Ubur Ubur Kepo
        </h1>
      </div>

      {/* Actions: Cukup Tombol Simpan PDF */}
      <div className="flex items-center gap-2">
        <button
          onClick={onExportPdf}
          disabled={totalPages === 0}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-600/20 transition disabled:opacity-50 cursor-pointer"
          title="Simpan seluruh gambar beserta teksnya menjadi satu file PDF"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Simpan PDF</span>
        </button>
      </div>
    </header>
  );
};
