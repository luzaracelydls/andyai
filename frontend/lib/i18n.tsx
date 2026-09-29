import React, { createContext, useContext, useEffect, useState } from 'react';
import { COPY, type Copy, type Lang } from './copy.ts';

// Idioma de la interfaz (y del contenido que genera Gemini), recordado en este navegador

const STORAGE_KEY = 'andy-ai:lang';

function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'es' || saved === 'en') return saved;
  } catch {
    // Almacenamiento bloqueado: se usa el idioma por defecto
  }
  return 'es';
}

interface I18n {
  lang: Lang;
  t: Copy;
  toggleLang: () => void;
}

const I18nContext = createContext<I18n | null>(null);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Lang>(initialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = COPY[lang].htmlTitle;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // No pasa nada si no se puede guardar
    }
  }, [lang]);

  const toggleLang = () => setLang(l => (l === 'es' ? 'en' : 'es'));

  return <I18nContext.Provider value={{ lang, t: COPY[lang], toggleLang }}>{children}</I18nContext.Provider>;
};

export function useI18n(): I18n {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n debe usarse dentro de <LanguageProvider>');
  return ctx;
}
