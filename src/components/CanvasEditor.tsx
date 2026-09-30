import React, { useRef, useState, useEffect } from 'react';
import { 
  Trash2, 
  Copy, 
  Sparkles,
  Upload,
  Lock,
  Plus,
  CheckCircle,
  FileSpreadsheet
} from 'lucide-react';
import { ImagePage, TextAnnotation } from '../types';

interface CanvasEditorProps {
  pages: ImagePage[];
  activePageIndex: number;
  onSelectPage: (index: number) => void;
  onAddNewPage: () => void;
  selectedAnnotationId: string | null;
  onSelectAnnotation: (id: string | null) => void;
  onUpdateAnnotation: (id: string, updates: Partial<TextAnnotation>) => void;
  onDeleteAnnotation: (id: string) => void;
  onDuplicateAnnotation: (id: string) => void;
  onUploadClick: () => void;
  onDriveImportClick: () => void;
  onLoadSample: () => void;
}

function hexToRgba(hex: string, opacity: number): string {
  if (!hex || hex === 'transparent') return 'transparent';
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map((c) => c + c).join('');
  }
  const num = parseInt(cleanHex, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export const CanvasEditor: React.FC<CanvasEditorProps> = ({
  pages,
  activePageIndex,
  onSelectPage,
  onAddNewPage,
  selectedAnnotationId,
  onSelectAnnotation,
  onUpdateAnnotation,
  onDeleteAnnotation,
  onDuplicateAnnotation,
  onUploadClick,
  onDriveImportClick,
  onLoadSample,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeImageRef = useRef<HTMLImageElement>(null);

  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  // Dragging state for annotations
  const [dragState, setDragState] = useState<{
    annId: string;
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
    containerRect: DOMRect;
  } | null>(null);

  // Resizing state for annotation box width
  const [resizeState, setResizeState] = useState<{
    annId: string;
    startX: number;
    initialWidth: number;
    containerRect: DOMRect;
  } | null>(null);

  // Handle pointer down on an annotation for dragging
  const handleAnnotationPointerDown = (
    e: React.PointerEvent,
    ann: TextAnnotation,
    pageIndex: number,
    imgElement: HTMLImageElement | null
  ) => {
    e.stopPropagation();
    onSelectPage(pageIndex);
    onSelectAnnotation(ann.id);

    if (ann.locked || !imgElement) return;

    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    const rect = imgElement.getBoundingClientRect();
    setDragState({
      annId: ann.id,
      startX: e.clientX,
      startY: e.clientY,
      initialX: ann.x,
      initialY: ann.y,
      containerRect: rect,
    });
  };

  // Handle pointer move for dragging
  const handleAnnotationPointerMove = (e: React.PointerEvent) => {
    if (dragState) {
      const { containerRect, initialX, initialY, startX, startY, annId } = dragState;
      const deltaXPx = e.clientX - startX;
      const deltaYPx = e.clientY - startY;

      const deltaXPercent = (deltaXPx / containerRect.width) * 100;
      const deltaYPercent = (deltaYPx / containerRect.height) * 100;

      let newX = initialX + deltaXPercent;
      let newY = initialY + deltaYPercent;

      newX = Math.max(0, Math.min(96, newX));
      newY = Math.max(0, Math.min(96, newY));

      onUpdateAnnotation(annId, {
        x: Math.round(newX * 10) / 10,
        y: Math.round(newY * 10) / 10,
      });
    } else if (resizeState) {
      const { containerRect, initialWidth, startX, annId } = resizeState;
      const deltaXPx = e.clientX - startX;
      const deltaXPercent = (deltaXPx / containerRect.width) * 100;

      let newWidth = initialWidth + deltaXPercent;
      newWidth = Math.max(10, Math.min(95, newWidth));

      onUpdateAnnotation(annId, {
        width: Math.round(newWidth * 10) / 10,
      });
    }
  };

  const handleAnnotationPointerUp = (e: React.PointerEvent) => {
    if (dragState) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // Ignore
      }
      setDragState(null);
    }
    if (resizeState) {
      setResizeState(null);
    }
  };

  // Keyboard shortcut delete
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (!selectedAnnotationId) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        onDeleteAnnotation(selectedAnnotationId);
      } else if (e.key === 'Escape') {
        onSelectAnnotation(null);
        setEditingTextId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedAnnotationId, onDeleteAnnotation, onSelectAnnotation]);

  if (pages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-950 text-center select-none">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <div className="w-16 h-16 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            Mulai Tambahkan Halaman
          </h2>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            Klik tombol di bawah untuk membuat halaman A4 pertama.
          </p>

          <button
            onClick={onLoadSample}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Buka Gambar Folder Drive</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex-1 flex flex-col bg-slate-950 relative overflow-hidden select-none w-full h-full"
      onPointerMove={handleAnnotationPointerMove}
      onPointerUp={handleAnnotationPointerUp}
    >
      {/* Scrollable Document Feed (Top to Bottom): Jarak Antar Halaman Buku yang Nyata */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto px-3 py-8 sm:px-8 md:px-12 space-y-16 sm:space-y-20 bg-[radial-gradient(#1e293b_1.2px,transparent_1.2px)] [background-size:20px_20px]"
      >
        {/* Quick Top Button: Tambah Halaman Baru di Atas */}
        <div className="flex items-center justify-center pb-2">
          <button
            onClick={onAddNewPage}
            className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold flex items-center gap-2 shadow-xl shadow-cyan-600/25 transition cursor-pointer hover:scale-102"
            title="Tambah lembar kertas A4 baru di bagian paling atas"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Halaman A4 di Atas</span>
          </button>
        </div>

        {/* Render Each Page As An Authentic A4 Landscape Sheet (297mm x 210mm) */}
        {pages.map((page, index) => {
          const isSelectedPage = index === activePageIndex;
          const hasText = (page.annotations?.[0]?.text || '').trim().length > 0;

          return (
            <React.Fragment key={page.id}>
              <div 
                onClick={() => {
                  onSelectPage(index);
                  if (page.annotations[0]) {
                    onSelectAnnotation(page.annotations[0].id);
                  }
                }}
                className={`max-w-4xl mx-auto flex flex-col items-center transition-all ${
                  isSelectedPage ? 'scale-100' : 'opacity-90 hover:opacity-100'
                }`}
              >
                {/* Page Meta Bar (Header Lembar A4) */}
                <div className="w-full flex items-center justify-between text-xs px-2 mb-2 text-slate-400">
                  <div className="flex items-center gap-2">
                    <span 
                      className={`font-bold px-2.5 py-0.5 rounded text-[11px] flex items-center gap-1.5 shadow-sm ${
                        isSelectedPage
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      <span>Halaman {index + 1}</span>
                    </span>

                    <span className="text-[10px] text-slate-400 font-mono bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                      Kertas A4 (297 × 210 mm)
                    </span>

                    <span className="text-slate-300 font-medium truncate max-w-[180px] hidden sm:inline-block">
                      {page.title}
                    </span>

                    {isSelectedPage && (
                      <span className="text-[10px] text-cyan-400 font-semibold bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                        Sedang Diedit
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {hasText ? (
                      <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                        <CheckCircle className="w-3 h-3" />
                        <span>Selesai Terisi</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 italic bg-slate-900/60 px-2 py-0.5 rounded">
                        Belum diisi
                      </span>
                    )}
                  </div>
                </div>

                {/* Selembar Kertas A4 Landscape Asli (Proporsi 297:210, Tebal, & Berbayang Nyata) */}
                <div 
                  className={`relative w-full max-w-[880px] aspect-[297/210] bg-white rounded-[2px] overflow-hidden transition-all ${
                    isSelectedPage
                      ? 'ring-2 ring-cyan-500 shadow-[0_20px_50px_rgba(0,0,0,0.7)] ring-offset-4 ring-offset-slate-950'
                      : 'shadow-[0_12px_36px_rgba(0,0,0,0.55)] border border-slate-300 hover:ring-1 hover:ring-slate-600'
                  }`}
                >
                  {/* Document Image Perfectly Fitted to A4 Sheet */}
                  <img
                    ref={isSelectedPage ? activeImageRef : undefined}
                    src={page.dataUrl}
                    alt={page.title}
                    className="w-full h-full object-fill select-none pointer-events-none"
                    draggable={false}
                  />

                  {/* Annotations Layer for this specific A4 sheet */}
                  {page.annotations.map((ann) => {
                    const isSelected = ann.id === selectedAnnotationId;
                    const isEditing = ann.id === editingTextId;

                    return (
                      <div
                        key={ann.id}
                        style={{
                          left: `${ann.x}%`,
                          top: `${ann.y}%`,
                          width: ann.width ? `${ann.width}%` : 'auto',
                          minWidth: '40px',
                          transform: ann.rotation ? `rotate(${ann.rotation}deg)` : undefined,
                          transformOrigin: 'center center',
                          opacity: ann.opacity ?? 1,
                          zIndex: isSelected ? 30 : 10,
                        }}
                        onPointerDown={(e) => 
                          handleAnnotationPointerDown(e, ann, index, isSelectedPage ? activeImageRef.current : null)
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectPage(index);
                          onSelectAnnotation(ann.id);
                        }}
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          setEditingTextId(ann.id);
                        }}
                        className={`annotation-item absolute group select-none transition-shadow ${
                          isSelected
                            ? 'ring-1.5 ring-cyan-500 ring-offset-1 ring-offset-black/40 shadow-xl'
                            : 'hover:ring-1 hover:ring-cyan-400/50'
                        } ${ann.locked ? 'cursor-default' : 'cursor-move'}`}
                      >
                        <div
                          style={{
                            fontFamily: ann.fontFamily || '"Plus Jakarta Sans", sans-serif',
                            fontSize: `${ann.fontSize}px`,
                            fontWeight: ann.fontWeight,
                            fontStyle: ann.fontStyle,
                            textDecoration: ann.textDecoration,
                            color: ann.color || '#000000',
                            backgroundColor:
                              ann.backgroundColor === 'transparent'
                                ? 'transparent'
                                : hexToRgba(ann.backgroundColor, ann.backgroundOpacity),
                            borderColor: ann.borderColor,
                            borderWidth: `${ann.borderWidth}px`,
                            borderStyle: ann.borderWidth > 0 ? 'solid' : 'none',
                            borderRadius: `${ann.borderRadius}px`,
                            textAlign: ann.textAlign,
                            padding: `${ann.padding}px`,
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            lineHeight: ann.lineHeight ? `${ann.lineHeight}` : '1.4',
                          }}
                          className="relative text-black"
                        >
                          {isEditing ? (
                            <textarea
                              value={ann.text}
                              autoFocus
                              onBlur={() => setEditingTextId(null)}
                              onChange={(e) =>
                                onUpdateAnnotation(ann.id, { text: e.target.value })
                              }
                              style={{
                                fontSize: `${ann.fontSize}px`,
                                color: ann.color || '#000000',
                                fontFamily: ann.fontFamily,
                                lineHeight: ann.lineHeight ? `${ann.lineHeight}` : '1.4',
                              }}
                              className="bg-transparent border border-dashed border-cyan-500 outline-none w-full resize-none p-1 rounded font-sans"
                              rows={ann.text.split('\n').length || 1}
                            />
                          ) : (
                            <span>{ann.text || <span className="text-slate-400 italic text-xs">[Klik sidebar 🆃 untuk menempel 7 baris teks]</span>}</span>
                          )}

                          {/* Quick Lock / Duplicate Controls when Selected & Unlocked */}
                          {isSelected && !ann.locked && (
                            <div 
                              onPointerDown={(e) => e.stopPropagation()}
                              className="absolute -top-8 left-0 bg-slate-900/95 border border-cyan-500/50 shadow-lg rounded py-0.5 px-1.5 flex items-center gap-1.5 z-40 text-[10px] text-white backdrop-blur-sm pointer-events-auto"
                            >
                              <span className="font-mono text-[10px] text-cyan-300">
                                X:{ann.x}% Y:{ann.y}%
                              </span>
                              <div className="h-2.5 w-px bg-slate-700" />
                              
                              <button
                                onClick={() => onUpdateAnnotation(ann.id, { locked: true })}
                                className="p-0.5 rounded text-amber-400 hover:text-white"
                                title="Kunci Posisi"
                              >
                                <Lock className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => onDuplicateAnnotation(ann.id)}
                                className="p-0.5 rounded text-slate-400 hover:text-cyan-300"
                                title="Duplikat Teks"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => onDeleteAnnotation(ann.id)}
                                className="p-0.5 rounded text-slate-400 hover:text-rose-400"
                                title="Hapus Teks"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Resizing Handle on Right Edge when Unlocked */}
                        {isSelected && !ann.locked && (
                          <div
                            onPointerDown={(e) => {
                              e.stopPropagation();
                              if (activeImageRef.current) {
                                setResizeState({
                                  annId: ann.id,
                                  startX: e.clientX,
                                  initialWidth: ann.width || 25,
                                  containerRect: activeImageRef.current.getBoundingClientRect(),
                                });
                              }
                            }}
                            className="absolute right-0 top-1/2 -translate-y-1/2 w-2.5 h-6 bg-cyan-500 rounded-sm cursor-ew-resize opacity-80 hover:opacity-100 shadow"
                            title="Tarik untuk mengubah lebar kolom teks"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Jarak Antar Halaman Buku & Garis Pembatas Lembar A4 */}
              {index < pages.length - 1 && (
                <div className="w-full max-w-4xl flex items-center justify-center py-6 text-slate-600 select-none">
                  <div className="h-px bg-slate-800/80 flex-1 border-t border-dashed border-slate-700/60" />
                  <span className="px-4 text-[10px] font-mono tracking-widest text-slate-500 flex items-center gap-2">
                    <span>Batas Lembar A4</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/50" />
                    <span>Halaman {index + 2}</span>
                  </span>
                  <div className="h-px bg-slate-800/80 flex-1 border-t border-dashed border-slate-700/60" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
