import React from 'react';
import { Challenge } from '../types.ts';
import { Target, Lightbulb, ArrowRight, RefreshCw, Image as ImageIcon, Gauge } from 'lucide-react';

interface ChallengeViewProps {
  challenge: Challenge & { imagePrompts: string[], complexity: string };
  onAccept: () => void;
  onRegenerate: () => void;
  isLoading: boolean;
}

export const ChallengeView: React.FC<ChallengeViewProps> = ({ challenge, onAccept, onRegenerate, isLoading }) => {
  return (
    <div className="max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-500">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-art-100">
        <div className="bg-art-800 text-white p-8 sm:p-12 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1 rounded-full text-sm font-medium mb-4">
            <Gauge className="w-4 h-4" /> Complexity: {challenge.complexity}
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl font-bold mb-4">{challenge.title}</h2>
          <p className="text-art-100 text-lg max-w-2xl mx-auto">{challenge.description}</p>
        </div>

        <div className="p-8 sm:p-12 grid md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h3 className="text-2xl font-serif font-semibold text-art-900 flex items-center gap-2"><Target className="text-orange-500"/> Focus Areas</h3>
            <ul className="space-y-2">{challenge.focusAreas.map((a, i) => <li key={i} className="text-art-700">• {a}</li>)}</ul>
          </div>
          <div className="space-y-6">
            <h3 className="text-2xl font-serif font-semibold text-art-900 flex items-center gap-2"><Lightbulb className="text-yellow-500"/> Pro Tips</h3>
            {challenge.tips.map((t, i) => <p key={i} className="bg-art-50 p-4 rounded-xl text-art-800">{t}</p>)}
          </div>
        </div>

        <div className="px-8 pb-8">
          <h3 className="text-xl font-serif font-semibold text-art-900 mb-4 flex items-center gap-2"><ImageIcon /> Reference Inspiration</h3>
          <div className="grid sm:grid-cols-2 gap-4 references">
            {challenge.imagePrompts.map((p, i) => (
              <div key={i} className="p-4 bg-art-100 rounded-xl text-sm italic text-art-700">"{p}"</div>
            ))}
          </div>
        </div>

        <div className="bg-art-50 p-8 flex justify-between border-t border-art-100">
          <button onClick={onRegenerate} className="flex items-center gap-2 text-art-600"><RefreshCw className="w-5 h-5" /> Regenerate</button>
          <button onClick={onAccept} className="flex items-center gap-2 px-8 py-4 rounded-full bg-art-800 text-white font-semibold">Start Painting <ArrowRight /></button>
        </div>
      </div>
    </div>
  );
};
