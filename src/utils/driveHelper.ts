/**
 * Helper to parse Google Drive links and direct URLs
 */
export function extractGoogleDriveFileId(url: string): string | null {
  const cleanUrl = url.trim();

  // Pattern 1: /file/d/{id}/
  const fileDPattern = /\/file\/d\/([a-zA-Z0-9_-]+)/;
  const match1 = cleanUrl.match(fileDPattern);
  if (match1 && match1[1]) return match1[1];

  // Pattern 2: id={id}
  const idPattern = /[?&]id=([a-zA-Z0-9_-]+)/;
  const match2 = cleanUrl.match(idPattern);
  if (match2 && match2[1]) return match2[1];

  // Pattern 3: /d/{id} (googleusercontent or direct)
  const dPattern = /\/d\/([a-zA-Z0-9_-]+)/;
  const match3 = cleanUrl.match(dPattern);
  if (match3 && match3[1]) return match3[1];

  return null;
}

export function convertDriveUrlToDirectImageUrl(url: string): { directUrl: string; fileId: string | null } {
  const fileId = extractGoogleDriveFileId(url);
  if (fileId) {
    // lh3.googleusercontent.com/d/FILE_ID is the fastest and cleanest Google Drive public thumbnail/image embed
    return {
      directUrl: `https://lh3.googleusercontent.com/d/${fileId}`,
      fileId,
    };
  }
  return { directUrl: url.trim(), fileId: null };
}

/**
 * Loads an image URL and converts it to a base64 Data URL to bypass cross-origin canvas tainting issues
 */
export async function fetchImageAsDataUrl(url: string): Promise<{ dataUrl: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context could not be created'));
          return;
        }
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        resolve({ dataUrl, width: img.naturalWidth, height: img.naturalHeight });
      } catch (err) {
        // If tainted canvas due to strict CORS
        reject(new Error('CORS_RESTRICTION'));
      }
    };

    img.onerror = () => {
      reject(new Error('IMAGE_LOAD_FAILED'));
    };

    img.src = url;
  });
}
