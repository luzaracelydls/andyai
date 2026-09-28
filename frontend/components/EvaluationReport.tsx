import React from 'react';
import { Evaluation } from '../types.ts';
import { Star, Ruler, LayoutTemplate, Palette, Box, Sun, Heart, RotateCcw } from 'lucide-react';

interface EvaluationReportProps {
  evaluation: Evaluation & { rating: number };
  imageUrl: string;
  onRestart: () => void;
}

export const EvaluationReport: React.FC<EvaluationReportProps> = ({ evaluation, imageUrl, onRestart }) => {
  const criteriaList = [
    { key: 'proportions', label: 'Proportions', icon: Ruler },
    { key: 'composition', label: 'Composition', icon: LayoutTemplate },
    { key: 'colorTheory', label: 'Color Theory', icon: Palette },
    { key: 'volume', label: 'Volume & Form', icon: Box },
    { key: 'lightingShadow', label: 'Lighting & Shadow', icon: Sun },
    { key: 'meetsChallenge', Label: 'Challenge passed?', icon: Ruler }
  ];

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="text-center mb-10">
        <h2 className="font-serif text-4xl font-bold text-art-900 mb-4">Studio Critique</h2>
        <div className="flex justify-center gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`w-8 h-8 ${i < evaluation.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <img src={imageUrl} className="rounded-3xl shadow-md mb-6" />
          <div className="bg-art-800 p-6 rounded-2xl italic">"{evaluation.overallEncouragement}"</div>
        </div>
        <div className="lg:col-span-2 space-y-4">
          {criteriaList.map(({ key, label, icon: Icon }) => (
            <div key={key} className="bg-white p-6 rounded-2xl shadow-sm border border-art-100 flex gap-5">
              <div className="p-3 rounded-xl bg-art-100 h-fit"><Icon className="w-6 h-6 text-art-800" /></div>
              <div>
                <h4 className="text-lg font-semibold text-art-900 mb-2">{label}</h4>
                <p className="text-art-700">{evaluation[key as keyof Evaluation]}</p>
              </div>
            </div>
          ))}
          <button onClick={onRestart} className="mt-8 flex items-center gap-2 px-8 py-4 rounded-full bg-art-800  font-semibold">
            <RotateCcw /> Start New Challenge
          </button>
        </div>
      </div>
    </div>
  );
};
