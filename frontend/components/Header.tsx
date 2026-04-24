import React from 'react';
import { Palette } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-art-200 sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-art-800 p-2 rounded-lg">
            <Palette className="w-6 h-6 text-art-50" />
          </div>
          <h1 className="font-serif text-xl font-bold text-art-900 tracking-tight">
            Andy AI
          </h1>
        </div>
        <nav className="hidden sm:block">
          <p className="text-sm text-art-600 font-medium">Your AI Painting Mentor</p>
        </nav>
      </div>
    </header>
  );
};
