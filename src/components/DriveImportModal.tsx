import React, { useState } from 'react';
import { 
  X, 
  FolderOpen, 
  ExternalLink, 
  Check, 
  AlertCircle, 
  Loader2, 
  HelpCircle,
  FileImage,
  Upload
} from 'lucide-react';
import { convertDriveUrlToDirectImageUrl, fetchImageAsDataUrl } from '../utils/driveHelper';

interface DriveImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageImported: (dataUrl: string, title: string) => void;
  onDirectUploadClick: () => void;
}

export const DriveImportModal: React.FC<DriveImportModalProps> = ({
  isOpen,
  onClose,
  onImageImported,
  onDirectUploadClick,
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);

  if (!isOpen) return null;

  const handleUrlChange = (val: string) => {
    setUrlInput(val);
    setError(null);
    if (!val.trim()) {
      setPreviewUrl(null);
      return;
    }
    const { directUrl } = convertDriveUrlToDirectImageUrl(val);
    setPreviewUrl(directUrl);
  };

  const handleConfirmImport = async () => {
    if (!urlInput.trim()) return;

    setLoading(true);
    setError(null);

    const { directUrl, fileId } = convertDriveUrlToDirectImageUrl(urlInput);

    try {
      const result = await fetchImageAsDataUrl(directUrl);
      const title = fileId ? `Drive_${fileId.substring(0, 8)}` : 'Gambar_Impor';
      onImageImported(result.dataUrl, title);
      setUrlInput('');
      setPreviewUrl(null);
      onClose();
    } catch (err: any) {
      if (err.message === 'CORS_RESTRICTION') {
        // If CORS blocked canvas extraction, we can still attempt standard Image load or provide instructions
        setError('Gambar dibatasi kebijakan privasi / CORS oleh server penyedia. Pastikan link Google Drive sudah diatur "Siapa saja yang memiliki link" (Anyone with the link), atau unduh filenya lalu klik "Upload File Langsung".');
      } else {
        setError('Gagal memuat gambar dari URL tersebut. Pastikan link valid dan file bersifat publik.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">
                Impor dari Google Drive atau Link URL
              </h3>
              <p className="text-[11px] text-slate-400">
                Tempel link file gambar dari Google Drive Anda
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
          {/* Input Link */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5 flex items-center justify-between">
              <span>Link Gambar Google Drive / URL Gambar:</span>
              <button
                type="button"
                onClick={() => setShowGuide(!showGuide)}
                className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
              >
                <HelpCircle className="w-3 h-3" />
                <span>Cara dapatkan link</span>
              </button>
            </label>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="Contoh: https://drive.google.com/file/d/1a2b3c4d5e/view?usp=sharing"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs transition"
            />
          </div>

          {/* Guide dropdown */}
          {showGuide && (
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/70 text-slate-300 space-y-2">
              <span className="font-semibold text-cyan-400 block">
                Langkah Mengambil Link dari Google Drive:
              </span>
              <ol className="list-decimal pl-4 space-y-1 text-[11px] text-slate-300">
                <li>Buka Google Drive dan klik kanan pada file gambar/dokumen Anda.</li>
                <li>Pilih <strong>Bagikan (Share)</strong>.</li>
                <li>Ubah akses umum menjadi <strong>&quot;Siapa saja yang memiliki link&quot; (Anyone with the link)</strong>.</li>
                <li>Klik <strong>Salin Link</strong> dan tempelkan pada kolom di atas!</li>
              </ol>
            </div>
          )}

          {/* Live Preview Box */}
          {previewUrl && (
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex flex-col items-center">
              <span className="text-[11px] font-medium text-slate-400 mb-2 flex items-center gap-1.5 self-start">
                <FileImage className="w-3.5 h-3.5 text-cyan-400" />
                <span>Pratinjau Gambar Terdeteksi:</span>
              </span>
              <div className="max-h-48 max-w-full rounded-lg overflow-hidden border border-slate-800 bg-slate-900 flex items-center justify-center p-1">
                <img
                  src={previewUrl}
                  alt="Pratinjau Google Drive"
                  className="max-h-44 object-contain rounded"
                  onError={() => setError('Tidak dapat memuat pratinjau. Pastikan link sudah publik.')}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2 text-rose-300 text-[11px]">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Alternative direct upload tip */}
          <div className="p-3 bg-indigo-950/30 border border-indigo-500/20 rounded-xl flex items-center justify-between text-[11px]">
            <span className="text-slate-300">
              Punya file PDF atau foto di laptop/HP Anda?
            </span>
            <button
              onClick={() => {
                onClose();
                onDirectUploadClick();
              }}
              className="py-1.5 px-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium flex items-center gap-1 transition"
            >
              <Upload className="w-3 h-3" />
              <span>Upload Langsung</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-medium transition"
          >
            Batal
          </button>
          <button
            onClick={handleConfirmImport}
            disabled={!urlInput.trim() || loading}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Memuat Gambar...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Masukkan ke Aplikasi</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
