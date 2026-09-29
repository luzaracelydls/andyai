import React, { useState } from 'react';
import { ArrowRight, Gauge, Lightbulb, RefreshCw, Target, CirclePlay } from 'lucide-react';
import { ChallengeResponse, Medium, Subject } from '../types.ts';
import { MEDIUMS, SUBJECTS } from '@/lib/copy';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

interface ChallengeViewProps {
  challenge: ChallengeResponse;
  medium: Medium;
  subject: Subject;
  onAccept: () => void;
  onRegenerate: () => void;
  isLoading: boolean;
}

const youtubeSearchUrl = (query: string) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

export const ChallengeView: React.FC<ChallengeViewProps> = ({ challenge, medium, subject, onAccept, onRegenerate, isLoading }) => {
  const [done, setDone] = useState<Set<number>>(new Set());
  const toggle = (i: number) =>
    setDone(prev => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Card className="overflow-hidden pt-0">
        <div className="bg-gradient-to-br from-fuchsia-600 via-purple-600 to-indigo-600 px-6 py-10 text-center text-white sm:px-12">
          <div className="mb-4 flex flex-wrap justify-center gap-2">
            <Badge className="bg-white/20 text-white"><Gauge /> {challenge.complexity}</Badge>
            <Badge className="bg-white/20 text-white">{MEDIUMS[medium].label}</Badge>
            <Badge className="bg-white/20 text-white">{SUBJECTS[subject].label}</Badge>
          </div>
          <p className="text-sm uppercase tracking-widest text-white/80">Tu misión</p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{challenge.title}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-white/90">{challenge.description}</p>
        </div>

        <CardContent className="grid gap-8 md:grid-cols-2">
          <section aria-labelledby="focus-title" className="space-y-3">
            <h2 id="focus-title" className="flex items-center gap-2 text-xl font-semibold">
              <Target className="size-5 text-primary" /> Puntos a trabajar
            </h2>
            <p className="text-sm text-muted-foreground">
              Márcalos mientras pintas · {done.size} de {challenge.focusAreas.length}
            </p>
            <ul className="space-y-2">
              {challenge.focusAreas.map((area, i) => (
                <li key={i}>
                  <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-accent/50 has-[[data-state=checked]]:bg-accent">
                    <Checkbox checked={done.has(i)} onCheckedChange={() => toggle(i)} className="mt-0.5" />
                    <span className={done.has(i) ? 'text-muted-foreground line-through' : ''}>{area}</span>
                  </label>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="tips-title" className="space-y-3">
            <h2 id="tips-title" className="flex items-center gap-2 text-xl font-semibold">
              <Lightbulb className="size-5 text-warning" /> Consejos
            </h2>
            <Accordion type="single" collapsible defaultValue="tip-0" className="rounded-lg border px-4">
              {challenge.tips.map((tip, i) => (
                <AccordionItem key={i} value={`tip-${i}`}>
                  <AccordionTrigger>Consejo {i + 1}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{tip}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        </CardContent>
      </Card>

      <section aria-labelledby="resources-title" className="space-y-3">
        <h2 id="resources-title" className="text-xl font-semibold">Aprende antes de empezar</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {challenge.youtubeQueries.map((q, i) => (
            <a key={i} href={youtubeSearchUrl(q)} target="_blank" rel="noopener noreferrer" className="group rounded-xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
              <Card className="h-full gap-2 py-4 transition-all group-hover:-translate-y-0.5 group-hover:shadow-md">
                <CardHeader className="grid-cols-[auto_1fr] items-center gap-3 px-4">
                  <span className="row-span-2 flex size-10 items-center justify-center rounded-lg bg-red-600 text-white">
                    <CirclePlay className="size-5" />
                  </span>
                  <CardTitle className="leading-snug">{q}</CardTitle>
                  <CardDescription>Buscar videos en YouTube ↗</CardDescription>
                </CardHeader>
              </Card>
            </a>
          ))}
        </div>
      </section>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button variant="outline" onClick={onRegenerate} disabled={isLoading}>
          <RefreshCw className={isLoading ? 'animate-spin' : ''} /> Otro reto
        </Button>
        <Button size="lg" onClick={onAccept} disabled={isLoading}>
          ¡Terminé! Subir mi obra <ArrowRight />
        </Button>
      </div>
    </div>
  );
};
