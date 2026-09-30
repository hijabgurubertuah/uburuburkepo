export interface TextAnnotation {
  id: string;
  text: string;
  x: number; // percentage 0 - 100 relative to image width
  y: number; // percentage 0 - 100 relative to image height
  width?: number; // percentage 0 - 100 (optional, default auto or fixed)
  fontSize: number; // base pixel size (e.g. 18)
  fontFamily: string;
  fontWeight: 'normal' | 'bold' | '600' | '800';
  fontStyle: 'normal' | 'italic';
  textDecoration: 'none' | 'underline';
  color: string;
  backgroundColor: string; // e.g. '#ffffff' or 'transparent'
  backgroundOpacity: number; // 0 to 1
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  padding: number;
  lineHeight?: number; // e.g. 1.4 to 3.5 for aligning with form blanks
  lineOffsets?: number[]; // optional custom Y offsets per line index for exact positioning
  rotation: number; // 0 to 360
  opacity: number; // 0.1 to 1
  locked?: boolean;
}

export interface ImagePage {
  id: string;
  title: string;
  originalFileName: string;
  dataUrl: string;
  naturalWidth: number;
  naturalHeight: number;
  annotations: TextAnnotation[];
}

export interface PresetTemplate {
  name: string;
  category: 'label' | 'stamp' | 'note' | 'signature' | 'watermark';
  icon: string;
  annotation: Omit<TextAnnotation, 'id' | 'x' | 'y'>;
  defaultX: number;
  defaultY: number;
}

export interface PDFExportOptions {
  filename: string;
  pageSize: 'original' | 'a4_portrait' | 'a4_landscape' | 'letter';
  quality: number; // 1 to 2 (render scale)
  format: 'pdf' | 'png_zip' | 'jpg_zip';
}
