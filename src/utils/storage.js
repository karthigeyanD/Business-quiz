// Helper utility to safely manage slides in browser storage

const STORAGE_KEY = 'proshow_slideshow_state_v1';
const SETTINGS_KEY = 'proshow_slideshow_settings_v1';

export const DEFAULT_SETTINGS = {
  duration: 5, // 3, 5, 10, 15, 30
  transition: 'fade', // fade, slide, slide-up, zoom, flip, blur, none
  loop: true,
  shuffle: false,
  fitMode: 'contain', // contain, cover
  showCaptions: true,
  showProgressBar: true,
  bgTheme: 'dark', // dark, pitch, blur, glow
  autoHideControls: true
};

export const saveSlidesToStorage = (slides) => {
  try {
    // Only save minimal data (data URLs can be large; handle quota errors gracefully)
    const jsonStr = JSON.stringify(slides);
    localStorage.setItem(STORAGE_KEY, jsonStr);
  } catch (err) {
    console.warn('Storage quota exceeded or unavailable:', err);
  }
};

export const loadSlidesFromStorage = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error loading slides from storage:', err);
  }
  return null;
};

export const saveSettingsToStorage = (settings) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.warn('Error saving settings:', err);
  }
};

export const loadSettingsFromStorage = () => {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.warn('Error loading settings:', err);
  }
  return DEFAULT_SETTINGS;
};
