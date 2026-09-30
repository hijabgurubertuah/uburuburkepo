import express from 'express';
import { createServer as createViteServer } from 'vite';
import https from 'https';

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(express.json());

// Helper to extract folder ID from Google Drive folder URL
function extractFolderId(url: string): string | null {
  const match = url.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (match) return match[1];
  const match2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match2) return match2[1];
  // If pure ID was passed
  if (/^[a-zA-Z0-9_-]{20,}$/.test(url.trim())) return url.trim();
  return null;
}

// Pre-seeded images for the user's specific folder
const DEFAULT_FOLDER_ID = '1lNcDdpbmbbuhz9ThWvJ0_JPtGE33ya7b';
const DEFAULT_FOLDER_FILES = [
  { id: '1sqltAHooZu1ALY1FlHEunphsXF6EhJDr', name: 'UK1.jpg' },
  { id: '14NStsJTFbk2--dEcE1wT9RMlX2iPv7k2', name: 'UK2.jpg' },
  { id: '1wvJdqNIxUPc9CwwMR-dVT4FJRGoJp3ub', name: 'UK33.jpg' },
  { id: '1uoZTglnJ_UTsnRFjbGF5SQmLkARRVjHQ', name: 'UK4.jpg' },
  { id: '1o3AvOuHb9tKXQE_5t6ri1VpEhoTTQkvy', name: 'UK5.jpg' },
  { id: '1o3AvOuHb9tKXQE_5t6ri1VpEhoTTQkvy', name: 'UK5.jpg' },
  { id: '1ouaVcZ0JC6XC3rIhq8pIVkxHOVyQb2al', name: 'UKK.jpg' },
];

// Deduplicate default files
const DEDUPED_DEFAULT_FILES = [
  { id: '1sqltAHooZu1ALY1FlHEunphsXF6EhJDr', name: 'UK1.jpg' },
  { id: '14NStsJTFbk2--dEcE1wT9RMlX2iPv7k2', name: 'UK2.jpg' },
  { id: '1wvJdqNIxUPc9CwwMR-dVT4FJRGoJp3ub', name: 'UK33.jpg' },
  { id: '1uoZTglnJ_UTsnRFjbGF5SQmLkARRVjHQ', name: 'UK4.jpg' },
  { id: '1o3AvOuHb9tKXQE_5t6ri1VpEhoTTQkvy', name: 'UK5.jpg' },
  { id: '1ouaVcZ0JC6XC3rIhq8pIVkxHOVyQb2al', name: 'UKK.jpg' },
];

// API: Detect images inside Google Drive folder
app.get('/api/drive-folder', (req, res) => {
  const folderInput = (req.query.folder as string) || DEFAULT_FOLDER_ID;
  const folderId = extractFolderId(folderInput) || DEFAULT_FOLDER_ID;

  const url = `https://drive.google.com/drive/folders/${folderId}?hl=ID`;

  https.get(url, (driveRes) => {
    let html = '';
    driveRes.on('data', (chunk) => {
      html += chunk;
    });

    driveRes.on('end', () => {
      // Regex to find all file items in folder
      const regex = /(?:\\x22|")([a-zA-Z0-9_-]{28,})(?:\\x22|"),(?:\x5b|\\x5b|\[)(?:\\x22|")[a-zA-Z0-9_-]+(?:\\x22|")(?:\x5d|\\x5d|\]),(?:\\x22|")([^"\\]+\.(?:jpg|jpeg|png|webp|gif|pdf))(?:\\x22|")/g;
      const matches = [...html.matchAll(regex)];

      const foundMap = new Map<string, string>();
      for (const m of matches) {
        if (!foundMap.has(m[1])) {
          foundMap.set(m[1], m[2]);
        }
      }

      let files = Array.from(foundMap.entries()).map(([id, name]) => ({
        id,
        name,
        proxyUrl: `/api/drive-image?id=${id}`,
        directUrl: `https://lh3.googleusercontent.com/d/${id}`,
      }));

      // Fallback if Google Drive blocked or didn't return matches and it's the default folder
      if (files.length === 0 && folderId === DEFAULT_FOLDER_ID) {
        files = DEDUPED_DEFAULT_FILES.map((f) => ({
          id: f.id,
          name: f.name,
          proxyUrl: `/api/drive-image?id=${f.id}`,
          directUrl: `https://lh3.googleusercontent.com/d/${f.id}`,
        }));
      }

      res.json({
        success: true,
        folderId,
        total: files.length,
        files,
      });
    });
  }).on('error', (err) => {
    // If network error, return fallback
    if (folderId === DEFAULT_FOLDER_ID) {
      return res.json({
        success: true,
        folderId,
        total: DEDUPED_DEFAULT_FILES.length,
        files: DEDUPED_DEFAULT_FILES.map((f) => ({
          id: f.id,
          name: f.name,
          proxyUrl: `/api/drive-image?id=${f.id}`,
          directUrl: `https://lh3.googleusercontent.com/d/${f.id}`,
        })),
      });
    }
    res.status(500).json({ success: false, error: err.message });
  });
});

// API: Proxy image bytes with CORS headers to prevent canvas tainting during PDF export
app.get('/api/drive-image', (req, res) => {
  const fileId = req.query.id as string;
  if (!fileId) {
    return res.status(400).send('File ID is required');
  }

  const imageUrl = `https://lh3.googleusercontent.com/d/${fileId}`;

  https.get(imageUrl, (imgRes) => {
    if (imgRes.statusCode && (imgRes.statusCode === 301 || imgRes.statusCode === 302) && imgRes.headers.location) {
      https.get(imgRes.headers.location, (redirectRes) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Content-Type', redirectRes.headers['content-type'] || 'image/jpeg');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        redirectRes.pipe(res);
      });
      return;
    }

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', imgRes.headers['content-type'] || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    imgRes.pipe(res);
  }).on('error', (err) => {
    res.status(500).send(err.message);
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DocuText Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
