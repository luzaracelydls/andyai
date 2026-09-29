import React from 'react';

// Medidor de un puntaje contra su máximo (0–5): pista del mismo tono y valor escrito al lado
export const ScoreMeter: React.FC<{ label: string; score: number; max?: number }> = ({ label, score, max = 5 }) => (
  <div className="flex items-center gap-3">
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={score}
      className="h-2 flex-1 overflow-hidden rounded-full bg-primary/15"
    >
      <div className="h-full rounded-full bg-chart-1 transition-[width] duration-700" style={{ width: `${(score / max) * 100}%` }} />
    </div>
    <span className="w-12 text-right text-sm font-semibold tabular-nums">{Number.isInteger(score) ? score : score.toFixed(1)}/{max}</span>
  </div>
);
