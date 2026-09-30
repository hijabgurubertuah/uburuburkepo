import React from 'react';
import { 
  X, 
  HelpCircle, 
  Upload, 
  Move, 
  Sliders, 
  Download, 
  Layers, 
  FolderOpen,
  CheckCircle2
} from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">
                Panduan Penggunaan Aplikasi
              </h3>
              <p className="text-[11px] text-slate-400">
                Cara menambah teks di posisi kustom, mengimpor dari Drive/PDF, dan ekspor ke PDF
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

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {/* Step 1 */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/60 border border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0 font-bold">
              1
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-white flex items-center gap-2">
                <span>Daftar Gambar &amp; Tombol Hamburger</span>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-normal">
                  Sisi Kiri Layar
                </span>
              </h4>
              <p className="text-slate-300 leading-relaxed">
                • Klik tombol ikon <strong>hamburger</strong> di tepi sisi kiri layar untuk membuka daftar thumbnail gambar (<code>UK1.jpg</code> s/d <code>UKK.jpg</code>).
                <br />
                • Di HP, thumbnail otomatis tersembunyi agar area kerja luas, dan bisa dimunculkan kapan saja.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/60 border border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0 font-bold">
              2
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-white flex items-center gap-2">
                <span>Meletakkan Teks di Tempat yang Sudah Anda Tentukan</span>
              </h4>
              <p className="text-slate-300 leading-relaxed">
                • Klik tombol <strong>&quot;Tambah Teks&quot;</strong>, lalu klik di titik mana saja pada gambar landscape Anda.
                <br />
                • Tarik (drag &amp; drop) kotak teks untuk memindahkan posisinya secara bebas.
                <br />
                • Gunakan input presisi koordinat <strong>X % dan Y %</strong> pada toolbar bawah untuk penempatan yang sangat akurat.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/60 border border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0 font-bold">
              3
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-white">
                Menyesuaikan Ukuran Field Teks &amp; Font
              </h4>
              <p className="text-slate-300 leading-relaxed">
                • Tarik handle di sebelah kanan teks untuk mengubah <strong>Lebar Kolom (Width %)</strong> agar pas dengan format dokumen Anda.
                <br />
                • Sesuaikan ukuran font, warna teks, kotak latar badge, serta format bold/italic melalui toolbar minimalis di bagian bawah.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/60 border border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0 font-bold">
              4
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-white flex items-center gap-2">
                <span>Terapkan Posisi Teks ke Semua Gambar di Folder</span>
              </h4>
              <p className="text-slate-300 leading-relaxed">
                Karena gambar Anda berformat sama, cukup posisikan teks sekali pada salah satu gambar, lalu klik tombol <strong>&quot;Terapkan ke Semua Gambar&quot;</strong>. Posisi dan ukuran teks akan otomatis diterapkan sama persis pada semua gambar di folder!
              </p>
            </div>
          </div>

          {/* Step 5 */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/60 border border-slate-800">
            <div className="w-8 h-8 rounded-lg bg-rose-600/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0 font-bold">
              5
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-white">
                Simpan &amp; Ekspor ke Format PDF Landscape
              </h4>
              <p className="text-slate-300 leading-relaxed">
                Klik <strong>&quot;Simpan PDF&quot;</strong> untuk mengunduh dokumen PDF berorientasi Landscape berkualitas tinggi yang rapi dan siap dicetak.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Mengerti & Tutup Panduan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
