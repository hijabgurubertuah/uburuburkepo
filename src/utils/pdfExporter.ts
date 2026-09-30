import jsPDF from 'jspdf';
import { ImagePage, TextAnnotation, PDFExportOptions } from '../types';

/**
 * Renders an ImagePage with all its annotations onto a canvas at full resolution
 */
export async function renderPageToCanvas(page: ImagePage): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D context');

  // Load the base image
  const img = new Image();
  img.crossOrigin = 'anonymous';
  
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('Failed to load image for rendering'));
    img.src = page.dataUrl;
  });

  const width = img.naturalWidth || page.naturalWidth || 1200;
  const height = img.naturalHeight || page.naturalHeight || 1600;

  canvas.width = width;
  canvas.height = height;

  // Draw background image
  ctx.drawImage(img, 0, 0, width, height);

  // Scale factor for font size based on image width (reference base width ~ 1000px)
  const scale = width / 1000;

  // Render annotations on top of the image
  for (const ann of page.annotations) {
    ctx.save();

    const x = (ann.x / 100) * width;
    const y = (ann.y / 100) * height;
    const scaledFontSize = Math.max(10, Math.round(ann.fontSize * scale));
    const padding = (ann.padding || 8) * scale;

    ctx.font = `${ann.fontStyle === 'italic' ? 'italic ' : ''}${ann.fontWeight} ${scaledFontSize}px ${ann.fontFamily || 'Plus Jakarta Sans, sans-serif'}`;
    ctx.textBaseline = 'top';

    const lines = ann.text.split('\n');
    const lineHeight = scaledFontSize * (ann.lineHeight || 1.35);

    // Calculate maximum line width
    let maxLineWidth = 0;
    for (const line of lines) {
      const metrics = ctx.measureText(line);
      if (metrics.width > maxLineWidth) {
        maxLineWidth = metrics.width;
      }
    }

    const boxWidth = ann.width ? (ann.width / 100) * width : maxLineWidth + padding * 2;
    const boxHeight = lines.length * lineHeight + padding * 2;

    // Apply rotation if needed
    if (ann.rotation && ann.rotation !== 0) {
      ctx.translate(x + boxWidth / 2, y + boxHeight / 2);
      ctx.rotate((ann.rotation * Math.PI) / 180);
      ctx.translate(-(x + boxWidth / 2), -(y + boxHeight / 2));
    }

    // Draw background badge / box
    if (ann.backgroundColor && ann.backgroundColor !== 'transparent' && ann.backgroundOpacity > 0) {
      ctx.save();
      ctx.globalAlpha = ann.backgroundOpacity;
      ctx.fillStyle = ann.backgroundColor;
      
      const r = Math.min(ann.borderRadius * scale, boxWidth / 2, boxHeight / 2);
      roundRect(ctx, x, y, boxWidth, boxHeight, r);
      ctx.fill();
      ctx.restore();
    }

    // Draw border
    if (ann.borderWidth && ann.borderWidth > 0 && ann.borderColor && ann.borderColor !== 'transparent') {
      ctx.save();
      ctx.strokeStyle = ann.borderColor;
      ctx.lineWidth = ann.borderWidth * scale;
      const r = Math.min(ann.borderRadius * scale, boxWidth / 2, boxHeight / 2);
      roundRect(ctx, x, y, boxWidth, boxHeight, r);
      ctx.stroke();
      ctx.restore();
    }

    // Draw text lines
    ctx.fillStyle = ann.color;
    ctx.globalAlpha = ann.opacity ?? 1.0;

    lines.forEach((line, index) => {
      let textX = x + padding;
      if (ann.textAlign === 'center') {
        textX = x + boxWidth / 2;
        ctx.textAlign = 'center';
      } else if (ann.textAlign === 'right') {
        textX = x + boxWidth - padding;
        ctx.textAlign = 'right';
      } else {
        ctx.textAlign = 'left';
      }

      const textY = y + padding + index * lineHeight;
      ctx.fillText(line, textX, textY);

      // Underline
      if (ann.textDecoration === 'underline') {
        const metrics = ctx.measureText(line);
        const lineWidth = metrics.width;
        let lineStartX = textX;
        if (ann.textAlign === 'center') lineStartX = textX - lineWidth / 2;
        if (ann.textAlign === 'right') lineStartX = textX - lineWidth;

        ctx.beginPath();
        ctx.strokeStyle = ann.color;
        ctx.lineWidth = Math.max(1, scaledFontSize * 0.08);
        ctx.moveTo(lineStartX, textY + scaledFontSize * 1.05);
        ctx.lineTo(lineStartX + lineWidth, textY + scaledFontSize * 1.05);
        ctx.stroke();
      }
    });

    ctx.restore();
  }

  return canvas;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Exports all pages to a multi-page PDF document
 */
export async function exportPagesToPdf(
  pages: ImagePage[],
  options: PDFExportOptions,
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  if (pages.length === 0) return;

  let doc: jsPDF | null = null;

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    if (onProgress) {
      onProgress(i + 1, pages.length);
    }

    const canvas = await renderPageToCanvas(page);
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const isLandscape = canvasWidth > canvasHeight;

    if (i === 0) {
      if (options.pageSize === 'original') {
        // Use custom page size matching exact image aspect ratio in pt or mm
        doc = new jsPDF({
          orientation: isLandscape ? 'landscape' : 'portrait',
          unit: 'px',
          format: [canvasWidth, canvasHeight],
          hotfixes: ['px_scaling'],
        });
        doc.addImage(imgData, 'JPEG', 0, 0, canvasWidth, canvasHeight, undefined, 'FAST');
      } else if (options.pageSize === 'a4_landscape') {
        doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        const pageWidth = 297;
        const pageHeight = 210;
        doc.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
      } else if (options.pageSize === 'letter') {
        doc = new jsPDF({ orientation: isLandscape ? 'landscape' : 'portrait', unit: 'mm', format: 'letter' });
        const pageWidth = isLandscape ? 279.4 : 215.9;
        const pageHeight = isLandscape ? 215.9 : 279.4;
        doc.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
      } else {
        // default a4_portrait
        doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
        const pageWidth = 210;
        const pageHeight = 297;
        doc.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
      }
    } else if (doc) {
      if (options.pageSize === 'original') {
        doc.addPage([canvasWidth, canvasHeight], isLandscape ? 'landscape' : 'portrait');
        doc.addImage(imgData, 'JPEG', 0, 0, canvasWidth, canvasHeight, undefined, 'FAST');
      } else if (options.pageSize === 'a4_landscape') {
        doc.addPage('a4', 'landscape');
        doc.addImage(imgData, 'JPEG', 0, 0, 297, 210, undefined, 'FAST');
      } else if (options.pageSize === 'letter') {
        doc.addPage('letter', isLandscape ? 'landscape' : 'portrait');
        const pageWidth = isLandscape ? 279.4 : 215.9;
        const pageHeight = isLandscape ? 215.9 : 279.4;
        doc.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight, undefined, 'FAST');
      } else {
        doc.addPage('a4', 'portrait');
        doc.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
      }
    }
  }

  if (doc) {
    const filename = options.filename.endsWith('.pdf') ? options.filename : `${options.filename}.pdf`;
    doc.save(filename);
  }
}

/**
 * Downloads a single page as an image (PNG / JPEG)
 */
export async function downloadPageAsImage(page: ImagePage, format: 'png' | 'jpeg' = 'png'): Promise<void> {
  const canvas = await renderPageToCanvas(page);
  const dataUrl = canvas.toDataURL(`image/${format}`, 0.95);
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = `${page.title || 'dokumen'}.${format}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
