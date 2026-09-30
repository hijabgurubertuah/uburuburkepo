import * as pdfjsLib from 'pdfjs-dist';
import { ImagePage } from '../types';

// Configure pdfjs worker
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.0.379'}/pdf.worker.min.mjs`;
} catch (e) {
  console.warn('PDF worker setup warning:', e);
}

export async function extractPagesFromPdf(
  file: File,
  onProgress?: (current: number, total: number) => void
): Promise<ImagePage[]> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdfDoc = await loadingTask.promise;
  const numPages = pdfDoc.numPages;

  const extractedPages: ImagePage[] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    
    // Render at scale 2.0 for crisp, high-resolution text and visuals
    const scale = 2.0;
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) continue;

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    // Fill white background before rendering
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
      canvas: canvas,
    };

    await page.render(renderContext).promise;

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    extractedPages.push({
      id: `page_${Date.now()}_${pageNum}_${Math.random().toString(36).substring(2, 7)}`,
      title: `${file.name.replace(/\.[^/.]+$/, '')} - Hal ${pageNum}`,
      originalFileName: file.name,
      dataUrl,
      naturalWidth: canvas.width,
      naturalHeight: canvas.height,
      annotations: [],
    });

    if (onProgress) {
      onProgress(pageNum, numPages);
    }
  }

  return extractedPages;
}
