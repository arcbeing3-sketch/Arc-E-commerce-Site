import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './config';
import { StoreSettings } from '../../shared/types';
import { INITIAL_SETTINGS } from './seed';

const SETTINGS_DOC = 'settings/global';

export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const snap = await getDoc(doc(db, 'settings', 'global'));
    if (snap.exists()) {
      return snap.data() as StoreSettings;
    }
    return INITIAL_SETTINGS;
  } catch (e) {
    console.error('Error fetching settings:', e);
    return INITIAL_SETTINGS;
  }
}

export function subscribeToStoreSettings(onUpdate: (settings: StoreSettings) => void) {
  return onSnapshot(doc(db, 'settings', 'global'), (snap) => {
    if (snap.exists()) {
      onUpdate(snap.data() as StoreSettings);
    } else {
      onUpdate(INITIAL_SETTINGS);
    }
  });
}

export async function updateStoreSettings(settings: Partial<StoreSettings>): Promise<void> {
  const docRef = doc(db, 'settings', 'global');
  await setDoc(docRef, settings, { merge: true });
}
