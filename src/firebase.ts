import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc,
  getDocFromServer
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { LockedLayoutConfig } from './config/lockedLayout';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Connection test as required by skill
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'settings', 'text_layout'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client offline, utilizing cached layout.');
    }
  }
}

// Fetch default layout from Firestore
export async function fetchRemoteTextLayout(): Promise<LockedLayoutConfig | null> {
  try {
    const isMobile = typeof window !== 'undefined' ? window.innerWidth < 640 : false;
    const docRef = doc(db, 'settings', 'text_layout');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      const fetchedFontSize = isMobile ? 6 : (data.fontSize === 18 ? 13 : (data.fontSize ?? 13));
      return {
        x: data.x ?? 22,
        y: data.y ?? 36,
        width: data.width ?? 62,
        fontSize: fetchedFontSize,
        lineHeight: data.lineHeight ?? 1.6,
        textAlign: data.textAlign ?? 'left',
        isLocked: data.isLocked ?? true,
      };
    }
  } catch (err) {
    console.warn('Failed to fetch remote text layout, falling back to local:', err);
  }
  return null;
}

// Save default layout to Firestore (called by admin with password)
export async function saveRemoteTextLayout(layout: LockedLayoutConfig): Promise<boolean> {
  try {
    const docRef = doc(db, 'settings', 'text_layout');
    await setDoc(docRef, {
      x: layout.x,
      y: layout.y,
      width: layout.width,
      fontSize: layout.fontSize,
      lineHeight: layout.lineHeight,
      textAlign: layout.textAlign || 'left',
      isLocked: layout.isLocked,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (err) {
    console.error('Failed to save text layout to Firestore:', err);
    return false;
  }
}
