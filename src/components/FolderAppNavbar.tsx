import React from 'react';
import { 
  FileText, 
  Download, 
  HelpCircle, 
  FolderOpen
} from 'lucide-react';
import { ImagePage } from '../types';

interface FolderAppNavbarProps {
  activePage: ImagePage | null;
  activePageIndex: number;
  totalPages: number;
  onExportPdf: () => void;
  onOpenGuide: () => void;
}

export const FolderAppNavbar: React.FC<FolderAppNavbarProps> = ({
  activePage,
  activePageIndex,
  totalPages,
  onExportPdf,
  onOpenGuide,
}) => {
  return (
    <header className="h-14 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 flex items-center justify-between z-30 select-none">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
          <FileText className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
            <span>DocuText</span>
            <span className="text-[10px] font-semibold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-1.5 py-0.2 rounded-full">
              Landscape
            </span>
          </h1>
        </div>
      </div>

      {/* Active File Name Indicator */}
      {activePage && (
        <div className="flex items-center gap-2 bg-slate-950/70 border border-slate-800 rounded-full px-3.5 py-1 text-xs text-slate-300">
          <FolderOpen className="w-3.5 h-3.5 text-blue-400" />
          <span className="truncate max-w-[140px] sm:max-w-[240px]">
            <strong className="text-white">{activePage.originalFileName}</strong> ({activePageIndex + 1}/{totalPages})
          </span>
          <span className="hidden sm:inline-block text-[10px] bg-slate-800 text-cyan-300 px-1.5 py-0.2 rounded">
            Landscape
          </span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Export to PDF */}
        <button
          onClick={onExportPdf}
          disabled={totalPages === 0}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-600/20 transition disabled:opacity-50 cursor-pointer"
          title="Simpan seluruh gambar beserta teksnya menjadi satu file PDF"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Simpan PDF</span>
        </button>

        {/* Guide */}
        <button
          onClick={onOpenGuide}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          title="Panduan Pemakaian"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
