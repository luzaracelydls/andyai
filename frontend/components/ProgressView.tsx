import React, { useMemo } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Flame, ImageIcon, Sparkles, Star, Trophy } from 'lucide-react';
import { CRITERIA_KEYS } from '@/lib/copy';
import { useI18n } from '@/lib/i18n';
import { practiceStreak, type HistoryEntry } from '@/lib/history';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScoreMeter } from '@/components/ScoreMeter';

interface ProgressViewProps {
  history: HistoryEntry[];
  onStart: () => void;
}

const shortDate = (iso: string, locale: string) => new Date(iso).toLocaleDateString(locale, { day: 'numeric', month: 'short' });
const average = (values: number[]) => values.reduce((a, b) => a + b, 0) / (values.length || 1);

const StatTile: React.FC<{ icon: React.ElementType; label: string; value: string }> = ({ icon: Icon, label, value }) => (
  <Card className="gap-1 py-4">
    <CardContent className="px-4">
      <p className="flex items-center gap-1.5 text-sm text-muted-foreground"><Icon className="size-4" /> {label}</p>
      <p className="mt-1 text-3xl font-bold tabular-nums">{value}</p>
    </CardContent>
  </Card>
);

// Tooltip propio: textos en tinta normal, el color solo en la marca
const RatingTooltip: React.FC<{ label: string; active?: boolean; payload?: { payload: { title: string; date: string; rating: number } }[] }> = ({ label, active, payload }) => {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-sm shadow-md">
      <p className="font-medium">{p.title}</p>
      <p className="text-muted-foreground">{p.date}</p>
      <p className="mt-1 flex items-center gap-2">
        <span className="size-2 rounded-full bg-chart-1" /> {label} <strong className="tabular-nums">{p.rating}/5</strong>
      </p>
    </div>
  );
};

export const ProgressView: React.FC<ProgressViewProps> = ({ history, onStart }) => {
  const { t } = useI18n();
  const stats = useMemo(() => ({
    streak: practiceStreak(history),
    avgRating: average(history.map(h => h.rating)),
    passed: history.filter(h => h.meetsChallenge).length,
    criteria: CRITERIA_KEYS.map(key => ({ key, avg: average(history.map(h => h.scores[key])) })),
    chart: history.map((h, i) => ({ n: i + 1, date: shortDate(h.date, t.dateLocale), title: h.challengeTitle, rating: h.rating })),
  }), [history, t.dateLocale]);

  if (history.length === 0) {
    return (
      <Card className="mx-auto max-w-lg text-center">
        <CardContent className="flex flex-col items-center gap-4 py-6">
          <span className="flex size-14 items-center justify-center rounded-full bg-accent text-primary"><ImageIcon className="size-7" /></span>
          <h1 className="text-2xl font-bold">{t.progress.emptyTitle}</h1>
          <p className="text-muted-foreground">{t.progress.emptyText}</p>
          <Button size="lg" onClick={onStart}><Sparkles /> {t.progress.start}</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-12">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold sm:text-4xl">{t.progress.title}</h1>
        <p className="text-muted-foreground">{t.progress.storedLocally}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile icon={ImageIcon} label={t.progress.statArtworks} value={String(history.length)} />
        <StatTile icon={Flame} label={t.progress.statStreak} value={String(stats.streak)} />
        <StatTile icon={Star} label={t.progress.statAverage} value={stats.avgRating.toFixed(1)} />
        <StatTile icon={Trophy} label={t.progress.statPassed} value={`${stats.passed}/${history.length}`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>{t.progress.chartTitle}</CardTitle>
            <CardDescription>{t.progress.chartDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            {history.length < 2 ? (
              <p className="py-12 text-center text-sm text-muted-foreground">{t.progress.chartNeedsMore}</p>
            ) : (
              <div className="h-64" role="img" aria-label={t.progress.chartLabel(history.length)}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.chart} margin={{ top: 8, right: 24, bottom: 0, left: -24 }}>
                    <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
                    <XAxis
                      dataKey="n"
                      type="number"
                      domain={['dataMin', 'dataMax']}
                      allowDecimals={false}
                      tickFormatter={(n: number) => stats.chart[n - 1]?.date ?? ''}
                      tickLine={false} axisLine={{ stroke: 'var(--chart-grid)' }} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
                    <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} tickLine={false} axisLine={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} />
                    <Tooltip content={<RatingTooltip label={t.progress.tooltipRating} />} cursor={{ stroke: 'var(--muted-foreground)', strokeWidth: 1 }} />
                    <Line
                      type="monotone"
                      dataKey="rating"
                      stroke="var(--chart-1)"
                      strokeWidth={2}
                      dot={{ r: 4, fill: 'var(--chart-1)', stroke: 'var(--card)', strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: 'var(--chart-1)', stroke: 'var(--card)', strokeWidth: 2 }}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t.progress.criteriaTitle}</CardTitle>
            <CardDescription>{t.progress.criteriaDescription}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.criteria.map(c => (
              <div key={c.key} className="space-y-1">
                <p className="text-sm font-medium">{t.criteria[c.key]}</p>
                <ScoreMeter label={t.criteria[c.key]} score={Math.round(c.avg * 10) / 10} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <section aria-labelledby="gallery-title" className="space-y-3">
        <h2 id="gallery-title" className="text-xl font-semibold">{t.progress.gallery}</h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {[...history].reverse().map(h => (
            <li key={h.id}>
              <Card className="h-full gap-0 overflow-hidden py-0">
                <img src={h.thumbnail} alt={h.challengeTitle} className="aspect-square w-full object-cover" />
                <CardContent className="space-y-1.5 p-3">
                  <p className="line-clamp-2 text-sm font-medium leading-snug">{h.challengeTitle}</p>
                  <p className="text-xs text-muted-foreground">{shortDate(h.date, t.dateLocale)} · {t.mediums[h.medium]?.label} · {t.subjects[h.subject]?.label}</p>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-sm font-semibold tabular-nums">
                      <Star className="size-4 fill-amber-400 text-amber-400" /> {h.rating}/5
                    </span>
                    {h.meetsChallenge && <Badge variant="secondary"><Trophy /> {t.progress.passedBadge}</Badge>}
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};
