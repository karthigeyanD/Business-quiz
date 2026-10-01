// IndexedDB utility for persistent local storage of Brand in Image quiz questions

const DB_NAME = 'proshow_brand_in_image_db';
const DB_VERSION = 1;
const STORE_NAME = 'brand_in_image_questions';

export function openBrandInImageDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

export async function saveBrandInImageQuizToDB(questions) {
  try {
    const db = await openBrandInImageDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    // Clear old questions
    await new Promise((resolve, reject) => {
      const clearReq = store.clear();
      clearReq.onsuccess = resolve;
      clearReq.onerror = reject;
    });

    // Put all questions
    for (const q of questions) {
      store.put(q);
    }

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(true);
      tx.onerror = (e) => reject(e.target.error);
    });
  } catch (err) {
    console.warn('IndexedDB save error for Brand in Image, falling back to LocalStorage:', err);
    try {
      localStorage.setItem('proshow_brand_in_image_fallback', JSON.stringify(questions));
    } catch (e) {
      console.error('LocalStorage quota error:', e);
    }
  }
}

export async function loadBrandInImageQuizFromDB() {
  try {
    const db = await openBrandInImageDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => {
        if (req.result && req.result.length > 0) {
          resolve(req.result);
        } else {
          resolve(null);
        }
      };
      req.onerror = (e) => reject(e.target.error);
    });
  } catch (err) {
    console.warn('IndexedDB load error for Brand in Image, checking LocalStorage fallback:', err);
    try {
      const raw = localStorage.getItem('proshow_brand_in_image_fallback');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }
}
