import React, { useRef, useState, useEffect } from 'react';
import { 
  Trash2, 
  Copy, 
  Sparkles, 
  Upload, 
  Lock, 
  Unlock, 
  Plus, 
  X, 
  GripHorizontal 
} from 'lucide-react';
import { ImagePage, TextAnnotation } from '../types';

interface CanvasEditorProps {
  pages: ImagePage[];
  activePageIndex: number;
  onSelectPage: (index: number) => void;
  onAddNewPage: () => void;
  onDeletePage?: (index: number) => void;
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
  onDeletePage,
  selectedAnnotationId,
  onSelectAnnotation,
  onUpdateAnnotation,
  onDeleteAnnotation,
  onDuplicateAnnotation,
  onLoadSample,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [pageToDeleteIndex, setPageToDeleteIndex] = useState<number | null>(null);

  // Global smooth dragging handler via window events to prevent getting stuck
  const startDragAnnotation = (
    e: React.PointerEvent,
    ann: TextAnnotation,
    pageIndex: number
  ) => {
    e.stopPropagation();
    onSelectPage(pageIndex);
    onSelectAnnotation(ann.id);

    if (ann.locked) return;

    // Find the paper sheet container element
    const sheetEl = document.getElementById(`doc-sheet-${pageIndex}`);
    if (!sheetEl) return;

    const sheetRect = sheetEl.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const initialX = ann.x;
    const initialY = ann.y;

    const onPointerMove = (moveEv: PointerEvent) => {
      moveEv.preventDefault();
      const deltaXPx = moveEv.clientX - startX;
      const deltaYPx = moveEv.clientY - startY;

      const deltaXPercent = (deltaXPx / sheetRect.width) * 100;
      const deltaYPercent = (deltaYPx / sheetRect.height) * 100;

      let newX = initialX + deltaXPercent;
      let newY = initialY + deltaYPercent;

      // Allow full unrestricted dragging anywhere across and far outside the paper
      newX = Math.max(-100, Math.min(200, newX));
      newY = Math.max(-100, Math.min(200, newY));

      onUpdateAnnotation(ann.id, {
        x: Math.round(newX * 10) / 10,
        y: Math.round(newY * 10) / 10,
      });
    };

    const onPointerUp = () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  };

  // Global smooth resize handler for text horizontal width
  const startResizeWidth = (
    e: React.PointerEvent,
    ann: TextAnnotation,
    pageIndex: number
  ) => {
    e.stopPropagation();
    e.preventDefault();

    const sheetEl = document.getElementById(`doc-sheet-${pageIndex}`);
    if (!sheetEl) return;

    const sheetRect = sheetEl.getBoundingClientRect();
    const startX = e.clientX;
    const initialWidth = ann.width || 62;

    const onResizeMove = (moveEv: PointerEvent) => {
      moveEv.preventDefault();
      const deltaXPx = moveEv.clientX - startX;
      const deltaXPercent = (deltaXPx / sheetRect.width) * 100;

      let newWidth = initialWidth + deltaXPercent;
      newWidth = Math.max(10, Math.min(98, newWidth));

      onUpdateAnnotation(ann.id, {
        width: Math.round(newWidth * 10) / 10,
      });
    };

    const onResizeUp = () => {
      window.removeEventListener('pointermove', onResizeMove);
      window.removeEventListener('pointerup', onResizeUp);
      window.removeEventListener('pointercancel', onResizeUp);
    };

    window.addEventListener('pointermove', onResizeMove, { passive: false });
    window.addEventListener('pointerup', onResizeUp);
    window.addEventListener('pointercancel', onResizeUp);
  };

  // Global smooth resize handler for text vertical height & line spacing
  const startResizeHeight = (
    e: React.PointerEvent,
    ann: TextAnnotation,
    pageIndex: number
  ) => {
    e.stopPropagation();
    e.preventDefault();

    const startY = e.clientY;
    const initialLineHeight = ann.lineHeight || 1.6;
    const linesCount = (ann.text ? ann.text.split('\n').length : 7) || 7;
    const fontSize = ann.fontSize || 13;

    const onResizeHeightMove = (moveEv: PointerEvent) => {
      moveEv.preventDefault();
      const deltaYPx = moveEv.clientY - startY;
      const deltaLineHeight = deltaYPx / (linesCount * Math.max(10, fontSize));

      let newLineHeight = initialLineHeight + deltaLineHeight;
      newLineHeight = Math.max(0.8, Math.min(4.5, newLineHeight));

      onUpdateAnnotation(ann.id, {
        lineHeight: Math.round(newLineHeight * 100) / 100,
      });
    };

    const onResizeHeightUp = () => {
      window.removeEventListener('pointermove', onResizeHeightMove);
      window.removeEventListener('pointerup', onResizeHeightUp);
      window.removeEventListener('pointercancel', onResizeHeightUp);
    };

    window.addEventListener('pointermove', onResizeHeightMove, { passive: false });
    window.addEventListener('pointerup', onResizeHeightUp);
    window.addEventListener('pointercancel', onResizeHeightUp);
  };

  // Keyboard shortcut delete & escape
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
    >
      {/* Scrollable Document Feed (Top to Bottom): Ruang atas & bawah luas agar tombol kontrol di atas kertas tidak terpotong */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto px-3 pt-8 pb-12 sm:px-8 space-y-8 sm:space-y-10 bg-[radial-gradient(#1e293b_1.2px,transparent_1.2px)] [background-size:20px_20px]"
      >
        {/* Quick Top Button: Tambah Halaman Baru di Atas */}
        <div className="flex items-center justify-center pb-1">
          <button
            onClick={onAddNewPage}
            className="py-2 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-cyan-600/20 transition cursor-pointer hover:scale-102"
            title="Tambah lembar baru di bagian paling atas"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Halaman Baru di Atas</span>
          </button>
        </div>

        {/* Render Each Page */}
        {pages.map((page, index) => {
          const isSelectedPage = index === activePageIndex;

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
                {/* Lembar Dokumen - overflow-visible agar tombol kontrol selalu terlihat di atas kertas */}
                <div 
                  id={`doc-sheet-${index}`}
                  className={`document-page-sheet relative w-full max-w-[880px] aspect-[297/210] bg-white rounded-[2px] transition-all overflow-visible ${
                    isSelectedPage
                      ? 'ring-2 ring-cyan-500 shadow-[0_16px_36px_rgba(0,0,0,0.65)] ring-offset-2 ring-offset-slate-950'
                      : 'shadow-[0_8px_24px_rgba(0,0,0,0.5)] border border-slate-300 hover:ring-1 hover:ring-slate-600'
                  }`}
                >
                  {/* Tombol X Hapus Halaman di Sudut Atas Kertas */}
                  {onDeletePage && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPageToDeleteIndex(index);
                      }}
                      className="absolute top-2.5 right-2.5 z-30 w-7 h-7 rounded-full bg-slate-900/80 hover:bg-rose-600 text-slate-300 hover:text-white backdrop-blur-xs border border-slate-700/80 hover:border-rose-500 shadow-md flex items-center justify-center transition cursor-pointer"
                      title="Hapus Halaman Ini"
                      aria-label="Hapus Halaman"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Document Image Fitted to Sheet */}
                  <div className="absolute inset-0 overflow-hidden rounded-[2px] pointer-events-none">
                    <img
                      src={page.dataUrl}
                      alt={page.title}
                      className="w-full h-full object-fill select-none pointer-events-none"
                      draggable={false}
                      loading="eager"
                      onError={(e) => {
                        const target = e.currentTarget;
                        const rawId = page.id.replace('page_', '');
                        if (rawId && !target.src.includes('googleusercontent')) {
                          target.src = `https://lh3.googleusercontent.com/d/${rawId}`;
                        } else if (rawId && target.src.includes('googleusercontent')) {
                          target.src = `/api/drive-image?id=${rawId}`;
                        }
                      }}
                    />
                  </div>

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
                          minWidth: '60px',
                          transform: ann.rotation ? `rotate(${ann.rotation}deg)` : undefined,
                          transformOrigin: 'center center',
                          opacity: ann.opacity ?? 1,
                          zIndex: isSelected ? 40 : 10,
                          touchAction: 'none',
                        }}
                        onPointerDown={(e) => startDragAnnotation(e, ann, index)}
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
                            ? 'ring-2 ring-cyan-500 ring-offset-1 ring-offset-black/40 shadow-xl'
                            : 'hover:ring-1 hover:ring-cyan-400/50'
                        } ${ann.locked ? 'cursor-default' : 'cursor-move'}`}
                      >
                        {/* Floating Toolbar: Selalu berada DI ATAS kolom teks (-top-9) & langsung bisa ditarik/didrag untuk memindahkan posisi */}
                        {isSelected && (
                          <div 
                            onPointerDown={(e) => {
                              if (!ann.locked) {
                                startDragAnnotation(e, ann, index);
                              }
                            }}
                            className={`absolute left-0 -top-9 bg-slate-900/95 border border-cyan-500/70 shadow-2xl rounded-lg py-1 px-2.5 flex items-center gap-2 z-50 text-[11px] text-white backdrop-blur-md select-none whitespace-nowrap ${
                              ann.locked ? 'cursor-default' : 'cursor-move hover:bg-slate-850'
                            }`}
                            title={ann.locked ? 'Posisi Terkunci' : 'Klik & tahan area menu ini untuk menyeret / menggeser teks'}
                          >
                            {/* Koordinat / Status */}
                            {ann.locked ? (
                              <span className="font-mono text-[10px] text-amber-300 flex items-center gap-1 font-semibold">
                                <Lock className="w-3 h-3 text-amber-400" /> Terkunci
                              </span>
                            ) : (
                              <span className="font-mono text-[10px] text-cyan-300 font-bold">
                                X:{ann.x}% Y:{ann.y}%
                              </span>
                            )}

                            <div className="h-3 w-px bg-slate-700" />
                            
                            {/* Tombol Kunci / Buka Kunci */}
                            <button
                              type="button"
                              onPointerDown={(e) => e.stopPropagation()}
                              onClick={() => onUpdateAnnotation(ann.id, { locked: !ann.locked })}
                              className={`p-1 rounded flex items-center gap-1 text-[10px] transition cursor-pointer ${
                                ann.locked 
                                  ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30' 
                                  : 'text-slate-300 hover:text-amber-400 hover:bg-slate-800'
                              }`}
                              title={ann.locked ? 'Buka Kunci Posisi' : 'Kunci Posisi Teks'}
                            >
                              {ann.locked ? <Unlock className="w-3 h-3 text-amber-400" /> : <Lock className="w-3 h-3" />}
                              <span>{ann.locked ? 'Buka' : 'Kunci'}</span>
                            </button>

                            {/* Tombol Duplikat / Kopi */}
                            <button
                              type="button"
                              onPointerDown={(e) => e.stopPropagation()}
                              onClick={() => onDuplicateAnnotation(ann.id)}
                              className="p-1 rounded text-slate-300 hover:text-cyan-300 hover:bg-slate-800 flex items-center gap-1 text-[10px] transition cursor-pointer"
                              title="Duplikat / Salin Teks"
                            >
                              <Copy className="w-3 h-3 text-cyan-400" />
                              <span>Kopi</span>
                            </button>

                            {/* Tombol Hapus */}
                            <button
                              type="button"
                              onPointerDown={(e) => e.stopPropagation()}
                              onClick={() => onDeleteAnnotation(ann.id)}
                              className="p-1 rounded text-slate-300 hover:text-rose-400 hover:bg-rose-950/40 flex items-center gap-1 text-[10px] transition cursor-pointer"
                              title="Hapus Kolom Teks"
                            >
                              <Trash2 className="w-3 h-3 text-rose-400" />
                              <span>Hapus</span>
                            </button>
                          </div>
                        )}

                        {/* Text Container Body */}
                        <div
                          style={{
                            fontFamily: ann.fontFamily || '"Comic Sans MS", "Comic Sans", cursive',
                            fontSize: `${ann.fontSize || 13}px`,
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
                            lineHeight: ann.lineHeight ? `${ann.lineHeight}` : '1.6',
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
                                fontSize: `${ann.fontSize || 13}px`,
                                color: ann.color || '#000000',
                                fontFamily: ann.fontFamily || '"Comic Sans MS", "Comic Sans", cursive',
                                lineHeight: ann.lineHeight ? `${ann.lineHeight}` : '1.6',
                              }}
                              className="bg-transparent border border-dashed border-cyan-500 outline-none w-full resize-none p-1 rounded font-sans"
                              rows={ann.text.split('\n').length || 1}
                            />
                          ) : (
                            <div className="flex flex-col w-full text-line-blocks">
                              {ann.text ? (
                                ann.text.split('\n').map((lineText, lineIdx) => {
                                  const calcLineHeight = ann.lineHeight ? `${ann.lineHeight}` : '1.6';
                                  const customOffset = ann.lineOffsets && ann.lineOffsets[lineIdx] !== undefined ? ann.lineOffsets[lineIdx] : 0;

                                  return (
                                    <div
                                      key={`line_block_${lineIdx}`}
                                      style={{
                                        lineHeight: calcLineHeight,
                                        minHeight: `${Math.round((ann.fontSize || 13) * parseFloat(calcLineHeight))}px`,
                                        marginTop: customOffset ? `${customOffset}px` : undefined,
                                        wordBreak: 'break-word',
                                      }}
                                      className="text-line-item relative transition-colors duration-150 hover:bg-cyan-500/5 rounded-xs"
                                      data-line-index={lineIdx}
                                    >
                                      {lineText !== '' ? lineText : '\u00A0'}
                                    </div>
                                  );
                                })
                              ) : (
                                <span className="text-slate-400 italic text-xs">[Klik sidebar 🆃 untuk menempel 7 baris teks]</span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* 1. Resizing Handle on Right Edge (Ubah Lebar / Width) */}
                        {isSelected && !ann.locked && (
                          <div
                            onPointerDown={(e) => startResizeWidth(e, ann, index)}
                            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3.5 h-10 bg-cyan-500 rounded-sm cursor-ew-resize opacity-90 hover:opacity-100 shadow-md flex items-center justify-center transition z-30"
                            title="Tarik ke kanan / kiri untuk mengubah lebar kolom teks"
                          >
                            <GripHorizontal className="w-3.5 h-3.5 text-white rotate-90" />
                          </div>
                        )}

                        {/* 2. Resizing Handle on Bottom Edge (Ubah Tinggi / Jarak Baris / Height) */}
                        {isSelected && !ann.locked && (
                          <div
                            onPointerDown={(e) => startResizeHeight(e, ann, index)}
                            className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 h-3.5 w-10 bg-cyan-500 rounded-sm cursor-ns-resize opacity-90 hover:opacity-100 shadow-md flex items-center justify-center transition z-30"
                            title="Tarik ke bawah / atas untuk mengatur jarak baris dan tinggi teks"
                          >
                            <GripHorizontal className="w-3.5 h-3.5 text-white" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Garis pemisah halus tanpa tulisan */}
              {index < pages.length - 1 && (
                <div className="w-full max-w-4xl flex items-center justify-center py-2 text-slate-700/50 select-none">
                  <div className="h-px bg-slate-800/60 w-3/4" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Confirmation Modal for Deleting a Page */}
      {pageToDeleteIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-5 shadow-2xl animate-in zoom-in-95 duration-150 text-slate-100">
            <h3 className="text-base font-bold text-white mb-2">Hapus Halaman #{pageToDeleteIndex + 1}?</h3>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              Halaman ini beserta seluruh teks yang ada di dalamnya akan dihapus dari dokumen kerja.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPageToDeleteIndex(null)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeletePage) onDeletePage(pageToDeleteIndex);
                  setPageToDeleteIndex(null);
                }}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white transition shadow-md shadow-rose-600/30"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
