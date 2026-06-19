import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'hisably_lang';

// App opens in English by default; the chosen language persists across sessions.
export const useLangStore = create((set) => ({
  lang: 'en',

  setLang: async (lang) => {
    set({ lang });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {
      // non-fatal — selection still applies for this session
    }
  },

  loadLang: async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) set({ lang: saved });
    } catch (e) {
      // ignore — fall back to default 'en'
    }
  },
}));
