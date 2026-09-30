/**
 * Konfigurasi Posisi Template Terkunci
 * Pengaturan ini tersimpan permanen agar siapapun yang membuka aplikasi
 * akan mendapatkan posisi teks yang sudah ditetapkan.
 */

export interface LockedLayoutConfig {
  x: number; // Persentase X (0 - 100)
  y: number; // Persentase Y (0 - 100)
  width: number; // Lebar field (0 - 100)
  fontSize: number; // Ukuran font dalam px
  lineHeight: number; // Jarak antar baris (misal 1.6x)
  textAlign: 'left' | 'center' | 'right';
  isLocked: boolean; // Status terkunci
  lineOffsets?: number[]; // Opsional offset posisi khusus per baris jika ingin posisi kustom
}

export const DEFAULT_LOCKED_LAYOUT: LockedLayoutConfig = {
  x: 22,
  y: 36,
  width: 62,
  fontSize: 13,
  lineHeight: 1.6,
  textAlign: 'left',
  isLocked: true, // Default terkunci agar posisi tidak berubah saat dibuka orang lain
  lineOffsets: [],
};

const STORAGE_KEY = 'DOCUTEXT_LOCKED_LAYOUT_V1';

export function getSavedLockedLayout(): LockedLayoutConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_LOCKED_LAYOUT, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.warn('Gagal membaca layout tersimpan:', e);
  }
  return DEFAULT_LOCKED_LAYOUT;
}

export function saveLockedLayout(config: LockedLayoutConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.warn('Gagal menyimpan layout:', e);
  }
}
