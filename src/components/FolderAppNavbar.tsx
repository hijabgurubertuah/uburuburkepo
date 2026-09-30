import React from 'react';
import { Download } from 'lucide-react';
import { UburUburLogo } from './UburUburLogo';

interface FolderAppNavbarProps {
  totalPages: number;
  onExportPdf: () => void;
}

export const FolderAppNavbar: React.FC<FolderAppNavbarProps> = ({
  totalPages,
  onExportPdf,
}) => {
  return (
    <header className="h-14 border-b border-teal-800/80 bg-teal-950/90 backdrop-blur-md px-4 flex items-center justify-between z-30 select-none">
      {/* Brand: Cukup Judul Ubur Ubur Kepo dengan Logo Mascot */}
      <div className="flex items-center gap-2.5">
        <UburUburLogo className="w-8 h-8" size={32} />
        <h1 className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
          <span>Ubur Ubur</span>
          <span className="text-cyan-400">Kepo</span>
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
