import React, { useState } from 'react';
import { 
  X, 
  Download, 
  FileText, 
  CheckCircle, 
  Loader2, 
  Image as ImageIcon, 
  Layers, 
  Settings2,
  Sparkles
} from 'lucide-react';
import { ImagePage, PDFExportOptions } from '../types';
import { exportPagesToPdf, downloadPageAsImage } from '../utils/pdfExporter';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  pages: ImagePage[];
  activePageIndex: number;
  onPdfExportSuccess?: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  pages,
  activePageIndex,
  onPdfExportSuccess,
}) => {
  const [filename, setFilename] = useState('Dokumen_Berteks_Hasil');
  const [scope, setScope] = useState<'all' | 'current'>('all');
  const [pageSize, setPageSize] = useState<'original' | 'a4_portrait' | 'a4_landscape' | 'letter'>('original');
  const [exportType, setExportType] = useState<'pdf' | 'png'>('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);

  if (!isOpen) return null;

  const handleStartExport = async () => {
    setIsExporting(true);
    setProgress({ current: 0, total: scope === 'all' ? pages.length : 1 });

    let isPdfSuccess = false;

    try {
      if (exportType === 'pdf') {
        const pagesToExport = scope === 'all' ? pages : [pages[activePageIndex]];
        const options: PDFExportOptions = {
          filename,
          pageSize,
          quality: 1.5,
          format: 'pdf',
        };

        await exportPagesToPdf(pagesToExport, options, (current, total) => {
          setProgress({ current, total });
        });
        isPdfSuccess = true;
      } else {
        // PNG export
        const pageToExport = pages[activePageIndex];
        await downloadPageAsImage(pageToExport, 'png');
      }

      setTimeout(() => {
        setIsExporting(false);
        setProgress(null);
        onClose();
        if (isPdfSuccess && onPdfExportSuccess) {
          onPdfExportSuccess();
        }
      }, 500);
    } catch (err) {
      console.error('Export error:', err);
      setIsExporting(false);
      setProgress(null);
      alert('Terjadi kesalahan saat memproses ekspor. Silakan coba kembali.');
    }
  };

  const totalAnnotations = pages.reduce((acc, p) => acc + (p.annotations?.length || 0), 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">
                Simpan & Ekspor ke Format PDF
              </h3>
              <p className="text-[11px] text-slate-400">
                Semua teks dan gambar akan dirender dengan kualitas tajam
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Format selection */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Format Berkas</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setExportType('pdf')}
                className={`p-3 rounded-xl border flex items-center gap-2.5 transition text-left ${
                  exportType === 'pdf'
                    ? 'border-indigo-500 bg-indigo-950/40 text-white font-medium ring-1 ring-indigo-500'
                    : 'border-slate-800 bg-slate-800/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <span className="block font-semibold">Dokumen PDF</span>
                  <span className="text-[10px] text-slate-400">Multi-halaman siap cetak</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setExportType('png')}
                className={`p-3 rounded-xl border flex items-center gap-2.5 transition text-left ${
                  exportType === 'png'
                    ? 'border-indigo-500 bg-indigo-950/40 text-white font-medium ring-1 ring-indigo-500'
                    : 'border-slate-800 bg-slate-800/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="p-2 rounded-lg bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <span className="block font-semibold">Gambar PNG</span>
                  <span className="text-[10px] text-slate-400">Kualitas tinggi transparan/tajam</span>
                </div>
              </button>
            </div>
          </div>

          {/* Filename */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">Nama File Hasil Unduhan</label>
            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl px-3 py-2">
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="nama-dokumen"
                className="w-full bg-transparent text-white text-xs outline-none"
              />
              <span className="text-slate-400 font-mono text-xs">
                .{exportType === 'pdf' ? 'pdf' : 'png'}
              </span>
            </div>
          </div>

          {/* Scope selection (All vs Current) */}
          {pages.length > 1 && exportType === 'pdf' && (
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Halaman yang Disimpan</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setScope('all')}
                  className={`p-2.5 rounded-xl border text-left text-xs transition ${
                    scope === 'all'
                      ? 'border-indigo-500 bg-indigo-950/40 text-white font-medium'
                      : 'border-slate-800 bg-slate-800 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-semibold">Semua Halaman</span>
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded">
                      {pages.length} Lembar
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">Gabungkan jadi 1 PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setScope('current')}
                  className={`p-2.5 rounded-xl border text-left text-xs transition ${
                    scope === 'current'
                      ? 'border-indigo-500 bg-indigo-950/40 text-white font-medium'
                      : 'border-slate-800 bg-slate-800 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-semibold">Halaman Aktif Saja</span>
                    <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.2 rounded">
                      Hal #{activePageIndex + 1}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block">Hanya lembar ini</span>
                </button>
              </div>
            </div>
          )}

          {/* Page size configuration */}
          {exportType === 'pdf' && (
            <div>
              <label className="block text-slate-300 font-medium mb-1.5">Ukuran Kertas PDF</label>
              <select
                value={pageSize}
                onChange={(e: any) => setPageSize(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500 text-xs"
              >
                <option value="original">
                  ★ Sesuai Ukuran Gambar Landscape Asli (Rekomendasi - Presisi 100% Full)
                </option>
                <option value="a4_landscape">Standar A4 - Landscape / Mendatar (297 × 210 mm)</option>
                <option value="a4_portrait">Standar A4 - Portrait / Tegak (210 × 297 mm)</option>
                <option value="letter">US Letter (Landscape)</option>
              </select>
            </div>
          )}

          {/* Summary Box */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between text-[11px] text-slate-300">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>
                Total <strong className="text-white">{pages.length}</strong> halaman dengan{' '}
                <strong className="text-cyan-300">{totalAnnotations}</strong> keterangan teks
              </span>
            </div>
            <span className="text-emerald-400 font-medium">Siap Ekspor</span>
          </div>

          {/* Progress bar during rendering */}
          {isExporting && progress && (
            <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-xs text-indigo-300 font-medium">
                <span>Merender halaman & teks...</span>
                <span>
                  {progress.current} / {progress.total}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  style={{
                    width: `${Math.round((progress.current / progress.total) * 100)}%`,
                  }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-200"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            disabled={isExporting}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-medium transition"
          >
            Batal
          </button>
          <button
            onClick={handleStartExport}
            disabled={isExporting}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Memproses PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Sekarang</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
