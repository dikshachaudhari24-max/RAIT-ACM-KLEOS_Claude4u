import { useLangStore } from '../store/langStore';
import { translations } from './translations';

// Languages offered in the selector. English is the default state.
export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'mr', label: 'मराठी' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'gu', label: 'ગુજરાતી' },
];

const interpolate = (str, vars) => {
  if (!vars) return str;
  return str.replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null ? String(vars[k]) : ''));
};

const resolve = (key, lang, vars) => {
  const entry = translations[key];
  if (!entry) return interpolate(key, vars);
  const value = entry[lang] ?? entry.en ?? key;
  return interpolate(value, vars);
};

// Hook: returns a t(key, vars) bound to the current language.
// Subscribing to `lang` re-renders consumers when the language changes.
export const useT = () => {
  const lang = useLangStore((s) => s.lang);
  return (key, vars) => resolve(key, lang, vars);
};

export const useLang = () => useLangStore((s) => s.lang);
export const useSetLang = () => useLangStore((s) => s.setLang);
