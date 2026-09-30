import React from 'react';
import { 
  Type, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Bold, 
  Italic, 
  Underline, 
  Sliders, 
  Palette, 
  Square, 
  RotateCw, 
  Layers, 
  Copy, 
  Trash2, 
  Lock, 
  Unlock, 
  Move, 
  Check, 
  Sparkles,
  Maximize2,
  Calendar,
  Hash
} from 'lucide-react';
import { TextAnnotation, PresetTemplate } from '../types';
import { DEFAULT_PRESETS } from '../utils/presets';

interface TextPropertiesPanelProps {
  selectedAnnotation: TextAnnotation | null;
  onUpdate: (updates: Partial<TextAnnotation>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onApplyToAllPages: () => void;
  onAddPreset: (preset: PresetTemplate) => void;
  totalPages: number;
}

const FONT_FAMILIES = [
  { label: 'Plus Jakarta Sans (Modern)', value: 'Plus Jakarta Sans' },
  { label: 'Arial (Standar)', value: 'Arial' },
  { label: 'Times New Roman (Formal / Resmi)', value: 'Times New Roman' },
  { label: 'JetBrains Mono (Kode / Nomor)', value: 'JetBrains Mono' },
  { label: 'Georgia (Serif Elegan)', value: 'Georgia' },
  { label: 'Impact (Tegas / Cap)', value: 'Impact' },
];

const PRESET_COLORS = [
  '#000000',
  '#1e293b',
  '#ffffff',
  '#2563eb',
  '#16a34a',
  '#dc2626',
  '#d97706',
  '#7c3aed',
];

const PRESET_BG_COLORS = [
  { label: 'Transparan', value: 'transparent' },
  { label: 'Kuning Catatan', value: '#fef08a' },
  { label: 'Hijau Lembut', value: '#dcfce7' },
  { label: 'Biru Muda', value: '#eff6ff' },
  { label: 'Putih Bersih', value: '#ffffff' },
  { label: 'Gelap / Hitam', value: '#0f172a' },
  { label: 'Merah Terang', value: '#fee2e2' },
];

export const TextPropertiesPanel: React.FC<TextPropertiesPanelProps> = ({
  selectedAnnotation,
  onUpdate,
  onDelete,
  onDuplicate,
  onApplyToAllPages,
  onAddPreset,
  totalPages,
}) => {
  if (!selectedAnnotation) {
    return (
      <aside className="w-80 border-l border-slate-800 bg-slate-900/95 flex flex-col h-[calc(100vh-4rem)] p-4 select-none overflow-y-auto">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-semibold text-slate-200">
            Pilihan Template Teks Cepat
          </h3>
        </div>

        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          Pilih salah satu template siap pakai di bawah ini atau klik langsung pada gambar di canvas untuk meletakkan teks baru.
        </p>

        <div className="space-y-2.5">
          {DEFAULT_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => onAddPreset(preset)}
              className="w-full text-left p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-750 hover:border-indigo-500/50 transition group flex flex-col gap-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white group-hover:text-cyan-300">
                  {preset.name}
                </span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider bg-slate-700/60 px-2 py-0.5 rounded">
                  {preset.category}
                </span>
              </div>
              <div
                style={{
                  fontFamily: preset.annotation.fontFamily,
                  fontSize: '12px',
                  color: preset.annotation.color,
                  backgroundColor:
                    preset.annotation.backgroundColor === 'transparent'
                      ? '#1e293b'
                      : preset.annotation.backgroundColor,
                  borderColor: preset.annotation.borderColor,
                  borderWidth: preset.annotation.borderWidth ? '1px' : '0px',
                  borderRadius: '4px',
                  padding: '4px 8px',
                }}
                className="truncate text-xs border"
              >
                {preset.annotation.text.split('\n')[0]}
              </div>
            </button>
          ))}
        </div>

        <div className="mt-auto pt-6 text-[11px] text-slate-500 text-center border-t border-slate-800/80">
          Tip: Anda dapat menarik (drag) teks langsung di atas gambar ke posisi mana pun.
        </div>
      </aside>
    );
  }

  const insertVariable = (textToInsert: string) => {
    onUpdate({
      text: selectedAnnotation.text + (selectedAnnotation.text ? ' ' : '') + textToInsert,
    });
  };

  const todayStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <aside className="w-80 border-l border-slate-800 bg-slate-900/95 flex flex-col h-[calc(100vh-4rem)] select-none">
      {/* Panel Header */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900">
        <div className="flex items-center gap-2">
          <Type className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-semibold text-slate-200">
            Pengaturan Teks & Keterangan
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onUpdate({ locked: !selectedAnnotation.locked })}
            className={`p-1 rounded text-xs transition ${
              selectedAnnotation.locked
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
            title={selectedAnnotation.locked ? 'Buka Kunci' : 'Kunci Posisi Teks'}
          >
            {selectedAnnotation.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={onDuplicate}
            className="p-1 rounded text-slate-400 hover:text-cyan-300 transition"
            title="Duplikat Teks Ini"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 rounded text-slate-400 hover:text-rose-400 transition"
            title="Hapus Teks Ini"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Scrollable controls */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {/* 1. Content of text */}
        <div>
          <label className="block text-slate-400 font-medium mb-1.5 flex items-center justify-between">
            <span>Isi Teks / Keterangan</span>
            <span className="text-[10px] text-slate-500">Mendukung multi-baris (Enter)</span>
          </label>
          <textarea
            value={selectedAnnotation.text}
            onChange={(e) => onUpdate({ text: e.target.value })}
            placeholder="Ketik keterangan atau tulisan..."
            rows={3}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-xs transition resize-none"
          />

          {/* Quick variable buttons */}
          <div className="flex flex-wrap gap-1 mt-1.5">
            <button
              onClick={() => insertVariable(todayStr)}
              className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 transition"
            >
              <Calendar className="w-2.5 h-2.5 text-cyan-400" />
              <span>Tanggal Hari Ini</span>
            </button>
            <button
              onClick={() => insertVariable('No: ')}
              className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 transition"
            >
              <Hash className="w-2.5 h-2.5 text-indigo-400" />
              <span>No:</span>
            </button>
          </div>
        </div>

        {/* 2. Position Precision Controls (X & Y) */}
        <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-300 text-[11px] flex items-center gap-1.5">
              <Move className="w-3.5 h-3.5 text-indigo-400" />
              <span>Posisi Ditentukan (%)</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Presisi Gambar</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Posisi Horizontal (X)</label>
              <div className="flex items-center bg-slate-800 rounded-lg border border-slate-700 px-2 py-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={selectedAnnotation.x}
                  onChange={(e) => onUpdate({ x: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-transparent text-white text-xs font-mono outline-none"
                />
                <span className="text-slate-500 text-[10px]">%</span>
              </div>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Posisi Vertikal (Y)</label>
              <div className="flex items-center bg-slate-800 rounded-lg border border-slate-700 px-2 py-1">
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={selectedAnnotation.y}
                  onChange={(e) => onUpdate({ y: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-transparent text-white text-xs font-mono outline-none"
                />
                <span className="text-slate-500 text-[10px]">%</span>
              </div>
            </div>
          </div>

          {/* Quick presets for placement */}
          <div className="grid grid-cols-4 gap-1 pt-1">
            <button
              onClick={() => onUpdate({ x: 5, y: 5 })}
              className="py-1 px-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] text-center"
            >
              Kiri Atas
            </button>
            <button
              onClick={() => onUpdate({ x: 50, y: 5, textAlign: 'center' })}
              className="py-1 px-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] text-center"
            >
              Tengah Atas
            </button>
            <button
              onClick={() => onUpdate({ x: 70, y: 5 })}
              className="py-1 px-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] text-center"
            >
              Kanan Atas
            </button>
            <button
              onClick={() => onUpdate({ x: 50, y: 50, textAlign: 'center' })}
              className="py-1 px-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] text-center"
            >
              Pusat
            </button>
            <button
              onClick={() => onUpdate({ x: 5, y: 85 })}
              className="py-1 px-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] text-center"
            >
              Kiri Bawah
            </button>
            <button
              onClick={() => onUpdate({ x: 50, y: 85, textAlign: 'center' })}
              className="py-1 px-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] text-center"
            >
              Tengah Bawah
            </button>
            <button
              onClick={() => onUpdate({ x: 65, y: 80 })}
              className="py-1 px-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] text-center"
            >
              Kanan Bawah
            </button>
            <button
              onClick={() => onUpdate({ x: 10, y: 92 })}
              className="py-1 px-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] text-center"
            >
              Footer
            </button>
          </div>
        </div>

        {/* 3. Ukuran Field & Font Size */}
        <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 space-y-3">
          <span className="font-semibold text-slate-300 text-[11px] block">
            Ukuran Teks & Lebar Kolom
          </span>

          {/* Font size */}
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span>Ukuran Font:</span>
              <span className="font-mono text-cyan-300 font-bold">{selectedAnnotation.fontSize} px</span>
            </div>
            <input
              type="range"
              min="10"
              max="96"
              value={selectedAnnotation.fontSize}
              onChange={(e) => onUpdate({ fontSize: parseInt(e.target.value, 10) })}
              className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
            />
          </div>

          {/* Field Width */}
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span>Lebar Field Teks:</span>
              <span className="font-mono text-cyan-300">
                {selectedAnnotation.width ? `${selectedAnnotation.width}%` : 'Otomatis'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="10"
                max="95"
                value={selectedAnnotation.width || 30}
                onChange={(e) => onUpdate({ width: parseInt(e.target.value, 10) })}
                className="flex-1 accent-indigo-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
              />
              <button
                onClick={() => onUpdate({ width: undefined })}
                className={`text-[10px] px-2 py-1 rounded border transition ${
                  !selectedAnnotation.width
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                }`}
              >
                Auto
              </button>
            </div>
          </div>

          {/* Padding */}
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span>Padding Jarak Dalam:</span>
              <span className="font-mono text-slate-300">{selectedAnnotation.padding} px</span>
            </div>
            <input
              type="range"
              min="2"
              max="32"
              value={selectedAnnotation.padding}
              onChange={(e) => onUpdate({ padding: parseInt(e.target.value, 10) })}
              className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
            />
          </div>
        </div>

        {/* 4. Font Family & Text Format */}
        <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 space-y-2.5">
          <label className="block text-slate-400 font-medium">Jenis Huruf (Font)</label>
          <select
            value={selectedAnnotation.fontFamily}
            onChange={(e) => onUpdate({ fontFamily: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500 text-xs"
          >
            {FONT_FAMILIES.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>

          {/* Formatting buttons */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1 border border-slate-700">
              <button
                onClick={() =>
                  onUpdate({
                    fontWeight: selectedAnnotation.fontWeight === 'bold' ? 'normal' : 'bold',
                  })
                }
                className={`p-1.5 rounded transition ${
                  selectedAnnotation.fontWeight === 'bold'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Tebal (Bold)"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() =>
                  onUpdate({
                    fontStyle: selectedAnnotation.fontStyle === 'italic' ? 'normal' : 'italic',
                  })
                }
                className={`p-1.5 rounded transition ${
                  selectedAnnotation.fontStyle === 'italic'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Miring (Italic)"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() =>
                  onUpdate({
                    textDecoration:
                      selectedAnnotation.textDecoration === 'underline' ? 'none' : 'underline',
                  })
                }
                className={`p-1.5 rounded transition ${
                  selectedAnnotation.textDecoration === 'underline'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Garis Bawah (Underline)"
              >
                <Underline className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1 border border-slate-700">
              <button
                onClick={() => onUpdate({ textAlign: 'left' })}
                className={`p-1.5 rounded transition ${
                  selectedAnnotation.textAlign === 'left'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Rata Kiri"
              >
                <AlignLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onUpdate({ textAlign: 'center' })}
                className={`p-1.5 rounded transition ${
                  selectedAnnotation.textAlign === 'center'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Rata Tengah"
              >
                <AlignCenter className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onUpdate({ textAlign: 'right' })}
                className={`p-1.5 rounded transition ${
                  selectedAnnotation.textAlign === 'right'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Rata Kanan"
              >
                <AlignRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* 5. Warna Teks */}
        <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 space-y-2">
          <label className="block text-slate-400 font-medium">Warna Huruf</label>
          <div className="flex items-center gap-1.5 flex-wrap">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => onUpdate({ color: c })}
                style={{ backgroundColor: c }}
                className={`w-6 h-6 rounded-md border flex items-center justify-center transition ${
                  selectedAnnotation.color === c
                    ? 'ring-2 ring-indigo-400 ring-offset-1 ring-offset-slate-900 border-white'
                    : 'border-slate-700'
                }`}
              >
                {selectedAnnotation.color === c && (
                  <Check
                    className={`w-3.5 h-3.5 ${
                      c === '#ffffff' || c === '#fef08a' ? 'text-black' : 'text-white'
                    }`}
                  />
                )}
              </button>
            ))}
            <input
              type="color"
              value={selectedAnnotation.color}
              onChange={(e) => onUpdate({ color: e.target.value })}
              className="w-6 h-6 rounded border border-slate-700 bg-transparent cursor-pointer"
              title="Pilih Warna Kustom"
            />
          </div>
        </div>

        {/* 6. Background Box / Kotak Keterangan */}
        <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 space-y-2.5">
          <label className="block text-slate-400 font-medium">Kotak Latar Belakang (Badge)</label>
          <div className="grid grid-cols-2 gap-1.5">
            {PRESET_BG_COLORS.map((bg) => (
              <button
                key={bg.value}
                onClick={() =>
                  onUpdate({
                    backgroundColor: bg.value,
                    backgroundOpacity: bg.value === 'transparent' ? 0 : 0.9,
                  })
                }
                className={`p-1.5 rounded-lg border text-[11px] text-left flex items-center gap-1.5 transition ${
                  selectedAnnotation.backgroundColor === bg.value
                    ? 'border-indigo-500 bg-indigo-950/40 text-white font-medium'
                    : 'border-slate-800 bg-slate-800 text-slate-300 hover:bg-slate-750'
                }`}
              >
                <div
                  style={{
                    backgroundColor: bg.value === 'transparent' ? 'transparent' : bg.value,
                    border: '1px solid #64748b',
                  }}
                  className="w-3.5 h-3.5 rounded-sm"
                />
                <span className="truncate">{bg.label}</span>
              </button>
            ))}
          </div>

          {selectedAnnotation.backgroundColor !== 'transparent' && (
            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span>Transparansi Latar:</span>
                <span className="font-mono text-cyan-300">
                  {Math.round((selectedAnnotation.backgroundOpacity ?? 0.9) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={selectedAnnotation.backgroundOpacity ?? 0.9}
                onChange={(e) => onUpdate({ backgroundOpacity: parseFloat(e.target.value) })}
                className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
              />

              {/* Border width */}
              <div className="flex items-center justify-between text-slate-400">
                <span>Ketebalan Border:</span>
                <span className="font-mono text-slate-300">{selectedAnnotation.borderWidth}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="6"
                value={selectedAnnotation.borderWidth}
                onChange={(e) =>
                  onUpdate({
                    borderWidth: parseInt(e.target.value, 10),
                    borderColor: selectedAnnotation.borderColor || '#94a3b8',
                  })
                }
                className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
              />

              {/* Border radius */}
              <div className="flex items-center justify-between text-slate-400">
                <span>Sudut Membulat:</span>
                <span className="font-mono text-slate-300">{selectedAnnotation.borderRadius}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="24"
                value={selectedAnnotation.borderRadius}
                onChange={(e) => onUpdate({ borderRadius: parseInt(e.target.value, 10) })}
                className="w-full accent-indigo-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
              />
            </div>
          )}
        </div>

        {/* 7. Rotasi Teks */}
        <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5">
              <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Rotasi Kemiringan:</span>
            </span>
            <span className="font-mono text-cyan-300">{selectedAnnotation.rotation || 0}°</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="-180"
              max="180"
              value={selectedAnnotation.rotation || 0}
              onChange={(e) => onUpdate({ rotation: parseInt(e.target.value, 10) })}
              className="flex-1 accent-indigo-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
            />
            <button
              onClick={() => onUpdate({ rotation: 0 })}
              className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 hover:text-white"
            >
              0°
            </button>
            <button
              onClick={() => onUpdate({ rotation: -15 })}
              className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 hover:text-white"
            >
              -15°
            </button>
          </div>
        </div>

        {/* 8. Batch Action: Terapkan ke semua halaman */}
        {totalPages > 1 && (
          <div className="pt-2">
            <button
              onClick={onApplyToAllPages}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-900/60 to-blue-900/60 hover:from-indigo-900 hover:to-blue-900 border border-indigo-500/40 text-cyan-300 font-semibold text-xs flex items-center justify-center gap-2 transition shadow"
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Terapkan Posisi Ini ke Semua Halaman ({totalPages})</span>
            </button>
            <p className="text-[10px] text-slate-500 text-center mt-1">
              Sangat praktis untuk menambahkan nomor surat, nama, atau cap pada semua lembar sekaligus.
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};
