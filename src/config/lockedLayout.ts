/**
 * Konfigurasi Posisi Template Terkunci
 * Pengaturan ini tersimpan permanen agar siapapun yang membuka aplikasi
 * akan mendapatkan posisi teks yang sudah ditetapkan.
 */

import { TextAnnotation } from '../types';

export interface ColumnPosition {
  x: number;
  y: number;
  width: number;
}

export const DEFAULT_7_COLUMN_POSITIONS: ColumnPosition[] = [
  { x: 4, y: 7, width: 49 },   // Kolom 1
  { x: 4, y: 19, width: 49 },  // Kolom 2
  { x: 4, y: 31, width: 49 },  // Kolom 3
  { x: 4, y: 44, width: 49 },  // Kolom 4
  { x: 4, y: 57, width: 49 },  // Kolom 5
  { x: 4, y: 70, width: 49 },  // Kolom 6
  { x: 4, y: 83, width: 49 },  // Kolom 7
];

export interface LockedLayoutConfig {
  x: number; // Persentase X (0 - 100)
  y: number; // Persentase Y (0 - 100)
  width: number; // Lebar field (0 - 100)
  fontSize: number; // Ukuran font dalam px (5 di HP, 13 di Desktop)
  lineHeight: number; // Jarak antar baris (default 1.2x)
  textAlign: 'left' | 'center' | 'right';
  isLocked: boolean; // Status terkunci
  lineOffsets?: number[];
}

export const DEFAULT_LOCKED_LAYOUT: LockedLayoutConfig = {
  x: 4,
  y: 7,
  width: 49,
  fontSize: 13,
  lineHeight: 1.2,
  textAlign: 'left',
  isLocked: true,
  lineOffsets: [],
};

const STORAGE_KEY = 'DOCUTEXT_LOCKED_LAYOUT_V5';

export function getSavedLockedLayout(): LockedLayoutConfig {
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 640 : false;
  const targetDefaultSize = isMobile ? 5 : 13;

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (isMobile) {
        parsed.fontSize = 5;
      } else if (parsed.fontSize === 18 || !parsed.fontSize) {
        parsed.fontSize = 13;
      }
      return { ...DEFAULT_LOCKED_LAYOUT, ...parsed, lineHeight: parsed.lineHeight || 1.2 };
    }
  } catch (e) {
    console.warn('Gagal membaca layout tersimpan:', e);
  }
  return { ...DEFAULT_LOCKED_LAYOUT, fontSize: targetDefaultSize, lineHeight: 1.2 };
}

export function saveLockedLayout(config: LockedLayoutConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.warn('Gagal menyimpan layout:', e);
  }
}

export function create7DefaultAnnotations(isMobile: boolean): TextAnnotation[] {
  return apply7ColumnPositions([], isMobile);
}

export function apply7ColumnPositions(
  existingAnns: TextAnnotation[] = [],
  isMobile = false
): TextAnnotation[] {
  const initialFontSize = isMobile ? 5 : 13;
  return DEFAULT_7_COLUMN_POSITIONS.map((pos, idx) => {
    const existing = existingAnns[idx];
    return {
      id: existing?.id || `ann_col_${idx + 1}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      text: existing?.text !== undefined ? existing.text : idx === 0 ? 'Isi teks disini' : '',
      x: pos.x, // Selalu terkunci pada posisi 4%
      y: pos.y, // 7%, 19%, 31%, 44%, 57%, 70%, 83%
      width: pos.width, // Selalu default 49%
      fontSize: existing?.fontSize || initialFontSize,
      fontFamily: existing?.fontFamily || '"Plus Jakarta Sans", sans-serif',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textDecoration: 'none',
      color: '#000000',
      backgroundColor: 'transparent',
      backgroundOpacity: 0,
      borderColor: 'transparent',
      borderWidth: 0,
      borderRadius: 0,
      textAlign: 'left',
      padding: 4,
      lineHeight: existing?.lineHeight || 1.2,
      rotation: 0,
      opacity: 1,
      locked: true,
    };
  });
}
