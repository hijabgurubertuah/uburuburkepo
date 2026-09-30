export interface DriveFolderFile {
  id: string;
  name: string;
  proxyUrl: string;
  directUrl: string;
}

export const INITIAL_FOLDER_URL =
  'https://drive.google.com/drive/folders/1lNcDdpbmbbuhz9ThWvJ0_JPtGE33ya7b?hl=ID';

export const INITIAL_FOLDER_ID = '1lNcDdpbmbbuhz9ThWvJ0_JPtGE33ya7b';

// Direct fallback list from user's exact folder
export const PRELOADED_FOLDER_FILES: DriveFolderFile[] = [
  {
    id: '1sqltAHooZu1ALY1FlHEunphsXF6EhJDr',
    name: 'UK1.jpg',
    proxyUrl: '/api/drive-image?id=1sqltAHooZu1ALY1FlHEunphsXF6EhJDr',
    directUrl: 'https://lh3.googleusercontent.com/d/1sqltAHooZu1ALY1FlHEunphsXF6EhJDr',
  },
  {
    id: '14NStsJTFbk2--dEcE1wT9RMlX2iPv7k2',
    name: 'UK2.jpg',
    proxyUrl: '/api/drive-image?id=14NStsJTFbk2--dEcE1wT9RMlX2iPv7k2',
    directUrl: 'https://lh3.googleusercontent.com/d/14NStsJTFbk2--dEcE1wT9RMlX2iPv7k2',
  },
  {
    id: '1wvJdqNIxUPc9CwwMR-dVT4FJRGoJp3ub',
    name: 'UK33.jpg',
    proxyUrl: '/api/drive-image?id=1wvJdqNIxUPc9CwwMR-dVT4FJRGoJp3ub',
    directUrl: 'https://lh3.googleusercontent.com/d/1wvJdqNIxUPc9CwwMR-dVT4FJRGoJp3ub',
  },
  {
    id: '1uoZTglnJ_UTsnRFjbGF5SQmLkARRVjHQ',
    name: 'UK4.jpg',
    proxyUrl: '/api/drive-image?id=1uoZTglnJ_UTsnRFjbGF5SQmLkARRVjHQ',
    directUrl: 'https://lh3.googleusercontent.com/d/1uoZTglnJ_UTsnRFjbGF5SQmLkARRVjHQ',
  },
  {
    id: '1o3AvOuHb9tKXQE_5t6ri1VpEhoTTQkvy',
    name: 'UK5.jpg',
    proxyUrl: '/api/drive-image?id=1o3AvOuHb9tKXQE_5t6ri1VpEhoTTQkvy',
    directUrl: 'https://lh3.googleusercontent.com/d/1o3AvOuHb9tKXQE_5t6ri1VpEhoTTQkvy',
  },
  {
    id: '1ouaVcZ0JC6XC3rIhq8pIVkxHOVyQb2al',
    name: 'UKK.jpg',
    proxyUrl: '/api/drive-image?id=1ouaVcZ0JC6XC3rIhq8pIVkxHOVyQb2al',
    directUrl: 'https://lh3.googleusercontent.com/d/1ouaVcZ0JC6XC3rIhq8pIVkxHOVyQb2al',
  },
];

export async function fetchDriveFolderFiles(folderUrlOrId: string): Promise<DriveFolderFile[]> {
  try {
    const res = await fetch(`/api/drive-folder?folder=${encodeURIComponent(folderUrlOrId)}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    if (data.success && data.files && data.files.length > 0) {
      return data.files;
    }
  } catch (err) {
    console.warn('API drive-folder fetch failed, using preloaded files:', err);
  }

  // Fallback to preloaded files if user passes the initial folder
  if (
    folderUrlOrId.includes('1lNcDdpbmbbuhz9ThWvJ0_JPtGE33ya7b') ||
    !folderUrlOrId.trim()
  ) {
    return PRELOADED_FOLDER_FILES;
  }

  return [];
}
