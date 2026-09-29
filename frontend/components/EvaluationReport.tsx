import React from 'react';
import { ChartLine, Dumbbell, RotateCcw, Sparkles, Star, Trophy } from 'lucide-react';
import { Evaluation } from '../types.ts';
import { CRITERIA_KEYS } from '@/lib/copy';
import { useI18n } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScoreMeter } from '@/components/ScoreMeter';

interface EvaluationReportProps {
  evaluation: Evaluation;
  imageUrl: string;
  challengeTitle: string;
  onRetry: () => void;
  onRestart: () => void;
  onProgress: () => void;
}

const clampScore = (n: number) => Math.max(0, Math.min(5, Math.round(n)));

export const EvaluationReport: React.FC<EvaluationReportProps> = ({ evaluation, imageUrl, challengeTitle, onRetry, onRestart, onProgress }) => {
  const { t } = useI18n();
  const rating = clampScore(evaluation.rating);

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      <div className="space-y-3 text-center">
        <p className="text-sm font-medium text-primary">{challengeTitle}</p>
        <h1 className="text-3xl font-bold sm:text-4xl">{t.evaluation.title}</h1>
        <div className="flex justify-center gap-1" role="img" aria-label={t.evaluation.ratingLabel(rating)}>
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              className={`size-8 animate-pop-in ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
              style={{ animationDelay: `${i * 90}ms` }}
            />
          ))}
        </div>
        <div
          className={`mx-auto inline-flex animate-pop-in items-center gap-2 rounded-full px-4 py-2 font-semibold ${evaluation.meetsChallenge ? 'bg-success/15 text-success' : 'bg-warning/20 text-amber-800'}`}
          style={{ animationDelay: '500ms' }}
        >
          {evaluation.meetsChallenge
            ? <><Trophy className="size-5" /> {t.evaluation.passed}</>
            : <><Dumbbell className="size-5" /> {t.evaluation.keepGoing}</>}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-2">
          <img src={imageUrl} alt={t.evaluation.artworkAlt} className="w-full rounded-2xl border shadow-md" />
          <Card className="bg-accent">
            <CardContent className="flex gap-3">
              <Sparkles className="size-5 shrink-0 text-primary" />
              <p className="italic">{evaluation.overallEncouragement}</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-3 lg:col-span-3">
          {CRITERIA_KEYS.map(key => (
            <Card key={key} className="gap-3 py-4">
              <CardHeader className="px-4">
                <CardTitle className="text-base">{t.criteria[key]}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 px-4">
                <ScoreMeter label={t.criteria[key]} score={clampScore(evaluation.scores[key])} />
                <p className="text-sm text-muted-foreground">{evaluation[key]}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button variant="outline" onClick={onRetry}><RotateCcw /> {t.evaluation.retry}</Button>
        <Button variant="outline" onClick={onProgress}><ChartLine /> {t.evaluation.viewProgress}</Button>
        <Button onClick={onRestart}><Sparkles /> {t.evaluation.newChallenge}</Button>
      </div>
    </div>
  );
};
