import React from 'react';
import { ChartLine, Languages, Palette, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/lib/i18n';

interface HeaderProps {
  onHome: () => void;
  onProgress: () => void;
  progressActive: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onHome, onProgress, progressActive }) => {
  const { t, lang, toggleLang } = useI18n();
  return (
    <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <button onClick={onHome} className="flex items-center gap-2 rounded-md outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
          <span className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-600 to-purple-600 text-white">
            <Palette className="size-5" />
          </span>
          <span className="font-serif text-lg font-bold">Andy AI</span>
        </button>
        <nav className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={onHome} aria-label={t.header.newChallenge}>
            <Plus /> <span className="hidden sm:inline">{t.header.newChallenge}</span>
          </Button>
          <Button variant={progressActive ? 'secondary' : 'ghost'} size="sm" onClick={onProgress} aria-current={progressActive ? 'page' : undefined}>
            <ChartLine /> <span className="hidden sm:inline">{t.header.myProgress}</span>
            <span className="sr-only sm:hidden">{t.header.myProgress}</span>
          </Button>
          {/* Muestra el idioma al que se cambia; en móvil solo el código (EN / ES) */}
          <Button variant="outline" size="sm" onClick={toggleLang} aria-label={`${t.header.switchLanguage} · ${t.header.switchLanguageLabel}`} lang={lang === 'es' ? 'en' : 'es'}>
            <Languages />
            <span className="hidden sm:inline">{t.header.switchLanguage}</span>
            <span className="sm:hidden">{lang === 'es' ? 'EN' : 'ES'}</span>
          </Button>
        </nav>
      </div>
    </header>
  );
};
