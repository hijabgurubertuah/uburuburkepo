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
  DriveFolderFile,
  PRELOADED_FOLDER_FILES
} from './utils/folderService';
import { 
  LockedLayoutConfig, 
  getSavedLockedLayout, 
  saveLockedLayout 
} from './config/lockedLayout';
import { 
  testFirestoreConnection, 
  fetchRemoteTextLayout, 
  saveRemoteTextLayout 
} from './firebase';
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

export const BLANK_PAPER_URL =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1131" viewBox="0 0 1600 1131"><rect width="1600" height="1131" fill="%23ffffff"/><rect x="25" y="25" width="1550" height="1081" fill="none" stroke="%23f1f5f9" stroke-width="2" stroke-dasharray="8 8"/></svg>';

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
    fontSize: layout.fontSize || 13,
    fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
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
    lineHeight: layout.lineHeight || 1.6,
    rotation: 0,
    opacity: 1,
    locked: layout.isLocked,
  };
}

// Default 1 blank paper page on startup
const defaultLayout = getSavedLockedLayout();
const DEFAULT_INITIAL_PAGES: ImagePage[] = [
  {
    id: `page_${Date.now()}`,
    title: 'Halaman 1 (Kertas Kosong)',
    originalFileName: 'Kertas Kosong',
    dataUrl: BLANK_PAPER_URL,
    naturalWidth: 1600,
    naturalHeight: 1131,
    annotations: [
      createAnnotationFromLayout(
        defaultLayout,
        DEFAULT_7_LINES
      ),
    ],
  },
];

export default function App() {
  const [pages, setPages] = useState<ImagePage[]>(DEFAULT_INITIAL_PAGES);
  const [templates, setTemplates] = useState<DriveFolderFile[]>(PRELOADED_FOLDER_FILES);
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [selectedAnnotationId, setSelectedAnnotationId] = useState<string | null>(
    DEFAULT_INITIAL_PAGES[0]?.annotations[0]?.id || null
  );
  const [isLoadingFolder, setIsLoadingFolder] = useState<boolean>(false);

  // 2 Separate Hidden Sidebars State
  const [isThumbnailSidebarOpen, setIsThumbnailSidebarOpen] = useState<boolean>(false);
  const [isTextSidebarOpen, setIsTextSidebarOpen] = useState<boolean>(false);

  // Persistent locked layout state (holds coordinates & dimensions)
  const [lockedLayout, setLockedLayout] = useState<LockedLayoutConfig>(getSavedLockedLayout());

  // Modals
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState<boolean>(false);

  // Load folder files and sync remote Firebase layout on mount
  useEffect(() => {
    // 1. Non-blocking Firebase sync
    testFirestoreConnection();
    fetchRemoteTextLayout().then((remoteLayout) => {
      if (remoteLayout) {
        setLockedLayout(remoteLayout);
        saveLockedLayout(remoteLayout);
        // Sync to loaded pages
        setPages((prev) =>
          prev.map((page) => ({
            ...page,
            annotations: page.annotations.map((ann) => ({
              ...ann,
              x: remoteLayout.x,
              y: remoteLayout.y,
              width: remoteLayout.width,
              fontSize: remoteLayout.fontSize,
              lineHeight: remoteLayout.lineHeight,
              textAlign: remoteLayout.textAlign,
              locked: remoteLayout.isLocked,
            })),
          }))
        );
      }
    });

    // 2. Fetch available folder images for template gallery
    loadFolderImages();
  }, []);

  const loadFolderImages = async () => {
    try {
      const files: DriveFolderFile[] = await fetchDriveFolderFiles(INITIAL_FOLDER_URL);
      if (files.length > 0) {
        setTemplates(files);
      }
    } catch (err) {
      console.warn('Folder files load notice:', err);
    }
  };

  const activePage = pages[activePageIndex] || pages[0] || null;
  const activeAnnotation = activePage?.annotations.find((a) => a.id === selectedAnnotationId) || activePage?.annotations[0] || null;

  // Make sure selectedAnnotationId stays in sync
  useEffect(() => {
    if (activePage && activePage.annotations.length > 0) {
      if (!selectedAnnotationId || !activePage.annotations.some((a) => a.id === selectedAnnotationId)) {
        setSelectedAnnotationId(activePage.annotations[0].id);
      }
    }
  }, [activePageIndex, activePage]);

  // Update layout and synchronize position template across all images (saved to Firebase & local)
  const handleUpdateLockedLayout = async (newLayout: LockedLayoutConfig) => {
    setLockedLayout(newLayout);
    saveLockedLayout(newLayout);
    // Persist to Firebase Firestore
    await saveRemoteTextLayout(newLayout);

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

  const handleSelectTemplate = (template: DriveFolderFile) => {
    const templateImgUrl = template.directUrl || template.proxyUrl;
    setPages((prev) =>
      prev.map((page, idx) => {
        if (idx !== activePageIndex) return page;
        return {
          ...page,
          title: template.name,
          originalFileName: template.name,
          dataUrl: templateImgUrl,
        };
      })
    );
  };

  const handleUploadCustomImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const newTemplate: DriveFolderFile = {
          id: `custom_${Date.now()}`,
          name: file.name,
          proxyUrl: dataUrl,
          directUrl: dataUrl,
        };
        setTemplates((prev) => [newTemplate, ...prev.filter((t) => t.name !== file.name)]);

        setPages((prev) =>
          prev.map((page, idx) => {
            if (idx !== activePageIndex) return page;
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
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  // Directly add new page on top (di atasnya), so completed ones stay below (di bawahnya)
  const handleAddNewPage = () => {
    const newPageNum = pages.length + 1;

    const newPage: ImagePage = {
      id: `page_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: `Halaman ${newPageNum} (Kertas Kosong)`,
      originalFileName: `Kertas Kosong`,
      dataUrl: BLANK_PAPER_URL,
      naturalWidth: 1600,
      naturalHeight: 1131,
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
      {/* 2 Dedicated Floating Trigger Buttons on Left Edge (Width: 35px, Height: 120px) */}
      <div className="fixed left-0 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-3 pointer-events-auto">
        {/* Tombol 1: Pemuncul Sidebar Thumbnail (Ukuran Lebar 35px x Tinggi 120px) */}
        <button
          type="button"
          onClick={() => {
            setIsThumbnailSidebarOpen(!isThumbnailSidebarOpen);
            setIsTextSidebarOpen(false); // Close other sidebar
          }}
          style={{ width: '35px', height: '120px' }}
          className={`bg-slate-900/95 hover:bg-slate-800 active:bg-cyan-600 border-r border-t border-b rounded-r-xl shadow-2xl flex flex-col items-center justify-center py-2 gap-2 transition-all cursor-pointer ${
            isThumbnailSidebarOpen ? 'border-cyan-400 text-cyan-300 ring-1 ring-cyan-500 bg-slate-800' : 'border-slate-700/80 text-slate-200 hover:border-slate-600'
          }`}
          title="Buka Daftar Gambar (Thumbnail)"
          aria-label="Menu Daftar Gambar"
        >
          <Menu className="w-4 h-4 shrink-0 text-cyan-400" />
          <span className="text-[11px] font-semibold [writing-mode:vertical-rl] rotate-180 tracking-wide select-none">
            Gambar
          </span>
        </button>

        {/* Tombol 2: Pemuncul Sidebar Input Teks (Ukuran Lebar 35px x Tinggi 120px) */}
        <button
          type="button"
          onClick={() => {
            setIsTextSidebarOpen(!isTextSidebarOpen);
            setIsThumbnailSidebarOpen(false); // Close other sidebar
          }}
          style={{ width: '35px', height: '120px' }}
          className={`bg-slate-900/95 hover:bg-slate-800 active:bg-cyan-600 border-r border-t border-b rounded-r-xl shadow-2xl flex flex-col items-center justify-center py-2 gap-2 transition-all cursor-pointer ${
            isTextSidebarOpen ? 'border-cyan-400 text-cyan-300 ring-1 ring-cyan-500 bg-slate-800' : 'border-slate-700/80 text-slate-200 hover:border-slate-600'
          }`}
          title="Buka Input Teks 7 Baris"
          aria-label="Menu Input Teks"
        >
          <Type className="w-4 h-4 shrink-0 text-cyan-400" />
          <span className="text-[11px] font-semibold [writing-mode:vertical-rl] rotate-180 tracking-wide select-none">
            Input Teks
          </span>
        </button>
      </div>

      {/* 1. Top Navbar: Cukup Judul Ubur Ubur Kepo dan Tombol Simpan PDF */}
      <FolderAppNavbar
        totalPages={pages.length}
        onExportPdf={() => setIsExportModalOpen(true)}
      />

      {/* 2. Main Canvas Workspace: Full Screen Without Clutter */}
      <div className="flex-1 flex overflow-hidden relative w-full h-full">
        {/* Sidebar 1 (Tersembunyi): Daftar Gambar / Thumbnail */}
        <DriveFolderSidebar
          isOpen={isThumbnailSidebarOpen}
          onClose={() => setIsThumbnailSidebarOpen(false)}
          templates={templates}
          pages={pages}
          activePageIndex={activePageIndex}
          onSelectPage={(index) => {
            setActivePageIndex(index);
          }}
          onSelectTemplate={handleSelectTemplate}
          onAddNewPage={handleAddNewPage}
          onUploadCustomImage={handleUploadCustomImage}
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
            onDeletePage={handleDeletePage}
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
            <p className="text-sm font-bold text-white">Memuat Gambar...</p>
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
