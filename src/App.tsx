import React, { useState, useEffect } from 'react';
import { FolderAppNavbar } from './components/FolderAppNavbar';
import { DriveFolderSidebar } from './components/DriveFolderSidebar';
import { TextInputSidebar } from './components/TextInputSidebar';
import { CanvasEditor } from './components/CanvasEditor';
import { ExportModal } from './components/ExportModal';
import { GuideModal } from './components/GuideModal';
import { ImagePage, TextAnnotation } from './types';
import { 
  INITIAL_FOLDER_URL, 
  fetchDriveFolderFiles, 
  DriveFolderFile 
} from './utils/folderService';
import { 
  LockedLayoutConfig, 
  getSavedLockedLayout, 
  saveLockedLayout 
} from './config/lockedLayout';
import { Loader2, Menu, Type } from 'lucide-react';

const DEFAULT_7_LINES = [
  'Baris 1: Keterangan Dokumen',
  'Baris 2: Nama Lengkap',
  'Baris 3: Nomor Registrasi / Induk',
  'Baris 4: Tanggal Pelaksanaan',
  'Baris 5: Uraian Kegiatan / Evaluasi',
  'Baris 6: Keterangan Hasil / Catatan',
  'Baris 7: Pengesahan & Tanda Tangan',
].join('\n');

function createAnnotationFromLayout(
  layout: LockedLayoutConfig,
  initialText = DEFAULT_7_LINES
): TextAnnotation {
  return {
    id: `ann_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    text: initialText,
    x: layout.x,
    y: layout.y,
    width: layout.width,
    fontSize: layout.fontSize,
    fontFamily: '"Plus Jakarta Sans", sans-serif',
    fontWeight: 'normal',
    fontStyle: 'normal',
    textDecoration: 'none',
    color: '#000000', // Hitam murni
    backgroundColor: 'transparent', // Latar transparan murni
    backgroundOpacity: 0,
    borderColor: 'transparent',
    borderWidth: 0,
    borderRadius: 0,
    textAlign: layout.textAlign,
    padding: 4,
    lineHeight: layout.lineHeight,
    rotation: 0,
    opacity: 1,
    locked: layout.isLocked,
  };
}

export default function App() {
  const [pages, setPages] = useState<ImagePage[]>([]);
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(null);
  const [isLoadingFolder, setIsLoadingFolder] = useState<boolean>(false);

  // 2 Separate Hidden Sidebars State
  const [isThumbnailSidebarOpen, setIsThumbnailSidebarOpen] = useState<boolean>(false);
  const [isTextSidebarOpen, setIsTextSidebarOpen] = useState<boolean>(false);

  // Persistent locked layout state (holds coordinates & dimensions)
  const [lockedLayout, setLockedLayout] = useState<LockedLayoutConfig>(getSavedLockedLayout());

  // Modals
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState<boolean>(false);

  // Load folder files on mount
  useEffect(() => {
    loadFolderImages();
  }, []);

  const loadFolderImages = async () => {
    setIsLoadingFolder(true);
    try {
      const files: DriveFolderFile[] = await fetchDriveFolderFiles(INITIAL_FOLDER_URL);
      const currentLayout = getSavedLockedLayout();
      
      const newPages: ImagePage[] = files.map((f, idx) => ({
        id: `page_${f.id}`,
        title: f.name,
        originalFileName: f.name,
        dataUrl: f.proxyUrl || f.directUrl,
        naturalWidth: 1600,
        naturalHeight: 1131,
        // Each image has its independent 7-line transparent black text annotation
        annotations: [
          createAnnotationFromLayout(
            currentLayout,
            `Baris 1: Keterangan Dokumen #${idx + 1}\nBaris 2: Nama Lengkap\nBaris 3: Nomor Registrasi\nBaris 4: Tanggal Pelaksanaan\nBaris 5: Uraian Kegiatan\nBaris 6: Keterangan Hasil\nBaris 7: Pengesahan & Tanda Tangan`
          ),
        ],
      }));

      setPages(newPages);
      setActivePageIndex(0);
      if (newPages[0]?.annotations?.length > 0) {
        setSelectedAnnotationId(newPages[0].annotations[0].id);
      }
    } catch (err) {
      console.error('Failed to load folder images:', err);
    } finally {
      setIsLoadingFolder(false);
    }
  };

  const activePage = pages[activePageIndex] || null;
  const activeAnnotation = activePage?.annotations.find((a) => a.id === selectedAnnotationId) || activePage?.annotations[0] || null;

  // Make sure selectedAnnotationId stays in sync
  useEffect(() => {
    if (activePage && activePage.annotations.length > 0) {
      if (!selectedAnnotationId || !activePage.annotations.some((a) => a.id === selectedAnnotationId)) {
        setSelectedAnnotationId(activePage.annotations[0].id);
      }
    }
  }, [activePageIndex, activePage]);

  // Update layout and synchronize position template across all images
  const handleUpdateLockedLayout = (newLayout: LockedLayoutConfig) => {
    setLockedLayout(newLayout);
    saveLockedLayout(newLayout);

    setPages((prev) =>
      prev.map((page) => ({
        ...page,
        annotations: page.annotations.map((ann) => ({
          ...ann,
          x: newLayout.x,
          y: newLayout.y,
          width: newLayout.width,
          fontSize: newLayout.fontSize,
          lineHeight: newLayout.lineHeight,
          textAlign: newLayout.textAlign,
          locked: newLayout.isLocked,
          color: '#000000',
          backgroundColor: 'transparent',
        })),
      }))
    );
  };

  // Annotation handlers (each page is completely independent in text)
  const handleUpdateAnnotation = (id: string, updates: Partial<TextAnnotation>) => {
    if (!activePage) return;

    if (
      updates.x !== undefined || 
      updates.y !== undefined || 
      updates.width !== undefined || 
      updates.fontSize !== undefined || 
      updates.lineHeight !== undefined
    ) {
      const updatedLayout: LockedLayoutConfig = {
        ...lockedLayout,
        x: updates.x !== undefined ? updates.x : lockedLayout.x,
        y: updates.y !== undefined ? updates.y : lockedLayout.y,
        width: updates.width !== undefined ? updates.width : lockedLayout.width,
        fontSize: updates.fontSize !== undefined ? updates.fontSize : lockedLayout.fontSize,
        lineHeight: updates.lineHeight !== undefined ? updates.lineHeight : lockedLayout.lineHeight,
      };
      setLockedLayout(updatedLayout);
      saveLockedLayout(updatedLayout);
    }

    setPages((prev) =>
      prev.map((page, idx) => {
        if (idx !== activePageIndex) return page;
        return {
          ...page,
          annotations: page.annotations.map((ann) =>
            ann.id === id
              ? {
                  ...ann,
                  ...updates,
                  backgroundColor: 'transparent',
                  backgroundOpacity: 0,
                  borderColor: 'transparent',
                  borderWidth: 0,
                  color: '#000000',
                }
              : ann
          ),
        };
      })
    );
  };

  const handleDeleteAnnotation = (id: string) => {
    if (!activePage) return;
    setPages((prev) =>
      prev.map((page, idx) => {
        if (idx !== activePageIndex) return page;
        return {
          ...page,
          annotations: page.annotations.filter((a) => a.id !== id),
        };
      })
    );
    if (selectedAnnotationId === id) {
      setSelectedAnnotationId(null);
    }
  };

  const handleDuplicateAnnotation = (id: string) => {
    if (!activePage) return;
    const original = activePage.annotations.find((a) => a.id === id);
    if (!original) return;

    const newId = `ann_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const copy: TextAnnotation = {
      ...original,
      id: newId,
      x: Math.min(90, original.x + 3),
      y: Math.min(90, original.y + 3),
    };

    setPages((prev) =>
      prev.map((page, idx) => {
        if (idx !== activePageIndex) return page;
        return {
          ...page,
          annotations: [...page.annotations, copy],
        };
      })
    );
    setSelectedAnnotationId(newId);
  };

  // Directly add new page on top (di atasnya), so completed ones stay below (di bawahnya) - NO file picker dialog!
  const handleAddNewPage = () => {
    const templateImage = activePage?.dataUrl || pages[0]?.dataUrl || '';
    const newPageNum = pages.length + 1;

    const newPage: ImagePage = {
      id: `page_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: `Halaman Baru (${newPageNum})`,
      originalFileName: `Halaman_${newPageNum}.jpg`,
      dataUrl: templateImage,
      naturalWidth: activePage?.naturalWidth || 1600,
      naturalHeight: activePage?.naturalHeight || 1131,
      annotations: [
        createAnnotationFromLayout(
          lockedLayout,
          '' // Empty, ready for immediate 7-line paste!
        ),
      ],
    };

    // Prepend to top: "tambahkan saja di halaman editor di atasnya, jadi yang sudah selesai berada di bawahnya."
    setPages((prev) => [newPage, ...prev]);
    setActivePageIndex(0);
    if (newPage.annotations[0]) {
      setSelectedAnnotationId(newPage.annotations[0].id);
    }

    // Automatically open text input sidebar so user can immediately paste!
    setIsTextSidebarOpen(true);
    setIsThumbnailSidebarOpen(false);
  };

  const handleReplacePageImage = (index: number, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        setPages((prev) =>
          prev.map((page, idx) => {
            if (idx !== index) return page;
            return {
              ...page,
              title: file.name,
              originalFileName: file.name,
              dataUrl,
              naturalWidth: img.naturalWidth || page.naturalWidth,
              naturalHeight: img.naturalHeight || page.naturalHeight,
            };
          })
        );
        alert(`Gambar halaman #${index + 1} berhasil diganti dengan "${file.name}".`);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleDeletePage = (index: number) => {
    if (pages.length <= 1) return;
    setPages((prev) => prev.filter((_, i) => i !== index));
    setActivePageIndex((prev) => Math.max(0, Math.min(prev, pages.length - 2)));
    setSelectedAnnotationId(null);
  };

  const handleDuplicatePage = (index: number) => {
    const source = pages[index];
    if (!source) return;

    const duplicated: ImagePage = {
      ...source,
      id: `page_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: `${source.title} (Salinan)`,
      annotations: source.annotations.map((ann) => ({
        ...ann,
        id: `ann_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      })),
    };

    setPages((prev) => {
      const copy = [...prev];
      copy.splice(index + 1, 0, duplicated);
      return copy;
    });
    setActivePageIndex(index + 1);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-white relative">
      {/* 2 Dedicated Floating Trigger Buttons on Left Edge (Height: 30px, Icon Only, No Text) */}
      <div className="fixed left-0 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2 pointer-events-auto">
        {/* Tombol 1: Pemuncul Sidebar Thumbnail (Ikon Hamburger Saja) */}
        <button
          type="button"
          onClick={() => {
            setIsThumbnailSidebarOpen(!isThumbnailSidebarOpen);
            setIsTextSidebarOpen(false); // Close other sidebar
          }}
          style={{ height: '30px', minWidth: '16px', width: '22px' }}
          className={`bg-slate-800/95 hover:bg-slate-700 active:bg-cyan-600 border-r border-t border-b rounded-r-md shadow-xl flex items-center justify-center transition-all cursor-pointer ${
            isThumbnailSidebarOpen ? 'border-cyan-400 text-cyan-300 ring-1 ring-cyan-500' : 'border-slate-700/80 text-slate-300'
          }`}
          title="Buka Daftar Gambar (Thumbnail)"
          aria-label="Menu Thumbnail"
        >
          <Menu className="w-3.5 h-3.5 shrink-0" />
        </button>

        {/* Tombol 2: Pemuncul Sidebar Input Teks (Ikon Type Saja) */}
        <button
          type="button"
          onClick={() => {
            setIsTextSidebarOpen(!isTextSidebarOpen);
            setIsThumbnailSidebarOpen(false); // Close other sidebar
          }}
          style={{ height: '30px', minWidth: '16px', width: '22px' }}
          className={`bg-slate-800/95 hover:bg-slate-700 active:bg-cyan-600 border-r border-t border-b rounded-r-md shadow-xl flex items-center justify-center transition-all cursor-pointer ${
            isTextSidebarOpen ? 'border-cyan-400 text-cyan-300 ring-1 ring-cyan-500' : 'border-slate-700/80 text-slate-300'
          }`}
          title="Buka Input Teks 7 Baris"
          aria-label="Menu Input Teks"
        >
          <Type className="w-3.5 h-3.5 shrink-0" />
        </button>
      </div>

      {/* 1. Top Navbar */}
      <FolderAppNavbar
        activePage={activePage}
        activePageIndex={activePageIndex}
        totalPages={pages.length}
        onExportPdf={() => setIsExportModalOpen(true)}
        onOpenGuide={() => setIsGuideModalOpen(true)}
      />

      {/* 2. Main Canvas Workspace: Full Screen Without Clutter */}
      <div className="flex-1 flex overflow-hidden relative w-full h-full">
        {/* Sidebar 1 (Tersembunyi): Daftar Gambar / Thumbnail */}
        <DriveFolderSidebar
          isOpen={isThumbnailSidebarOpen}
          onClose={() => setIsThumbnailSidebarOpen(false)}
          pages={pages}
          activePageIndex={activePageIndex}
          onSelectPage={(index) => {
            setActivePageIndex(index);
          }}
          onAddNewPage={handleAddNewPage}
          onReplacePageImage={handleReplacePageImage}
          onDeletePage={handleDeletePage}
          onDuplicatePage={handleDuplicatePage}
        />

        {/* Sidebar 2 (Tersembunyi): Kolom Input Teks 7 Baris & Pengaturan */}
        <TextInputSidebar
          isOpen={isTextSidebarOpen}
          onClose={() => setIsTextSidebarOpen(false)}
          annotation={activeAnnotation}
          activeImageName={activePage?.originalFileName || activePage?.title || ''}
          activePageIndex={activePageIndex}
          totalPages={pages.length}
          onUpdate={(updates) => {
            if (activeAnnotation) {
              handleUpdateAnnotation(activeAnnotation.id, updates);
            }
          }}
          lockedLayout={lockedLayout}
          onUpdateLockedLayout={handleUpdateLockedLayout}
        />

        {/* Fullscreen Canvas Editor: Continuous Top-to-Bottom Document View */}
        <main className="flex-1 flex flex-col overflow-hidden relative w-full h-full">
          <CanvasEditor
            pages={pages}
            activePageIndex={activePageIndex}
            onSelectPage={setActivePageIndex}
            onAddNewPage={handleAddNewPage}
            selectedAnnotationId={selectedAnnotationId}
            onSelectAnnotation={(id) => {
              setSelectedAnnotationId(id);
            }}
            onUpdateAnnotation={handleUpdateAnnotation}
            onDeleteAnnotation={handleDeleteAnnotation}
            onDuplicateAnnotation={handleDuplicateAnnotation}
            onUploadClick={() => setIsGuideModalOpen(true)}
            onDriveImportClick={() => setIsGuideModalOpen(true)}
            onLoadSample={() => loadFolderImages()}
          />
        </main>
      </div>

      {/* Loading Overlay */}
      {isLoadingFolder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col items-center max-w-sm text-center">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
            <p className="text-sm font-bold text-white">Memuat Gambar Landscape...</p>
          </div>
        </div>
      )}

      {/* PDF Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        pages={pages}
        activePageIndex={activePageIndex}
      />

      {/* Guide Modal */}
      <GuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
      />
    </div>
  );
}
