import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { ArrowLeft, ArrowRight, Loader2, Upload, Wand2 } from 'lucide-react';
import { Medium, SkillLevel, Subject, UserPreferences } from '../types.ts';
import { LEVELS, MEDIUMS, SUBJECTS } from '@/lib/copy';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';

interface SetupWizardProps {
  preferences: UserPreferences;
  setPreferences: React.Dispatch<React.SetStateAction<UserPreferences>>;
  onComplete: () => void;
  onAssess: (file: File) => void;
  isAssessing: boolean;
}

const STEPS = [
  { key: 'level', title: '¿Cuál es tu nivel?', hint: 'Elige uno o deja que Andy lo estime con una obra tuya.' },
  { key: 'medium', title: '¿Con qué técnica vas a pintar?', hint: 'El reto se adapta a los materiales que tienes.' },
  { key: 'subject', title: '¿Qué te gustaría pintar?', hint: 'Escoge el tema de tu próximo reto.' },
] as const;

export const SetupWizard: React.FC<SetupWizardProps> = ({ preferences, setPreferences, onComplete, onAssess, isAssessing }) => {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const value = preferences[current.key];
  const isLast = step === STEPS.length - 1;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 1,
    disabled: isAssessing,
    onDropAccepted: files => onAssess(files[0]),
  });

  // Radix devuelve "" al volver a pulsar la opción elegida: lo ignoramos para no perder la selección
  const select = (key: keyof UserPreferences) => (v: string) => {
    if (v) setPreferences(p => ({ ...p, [key]: v }));
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-24 sm:pb-0">
      <div className="space-y-3 text-center">
        <p className="text-sm font-medium text-primary">Paso {step + 1} de {STEPS.length}</p>
        <Progress value={((step + 1) / STEPS.length) * 100} aria-label="Progreso de la configuración" />
        <h1 className="pt-2 text-3xl font-bold sm:text-4xl">{current.title}</h1>
        <p className="text-muted-foreground">{current.hint}</p>
      </div>

      {current.key === 'level' && (
        <div className="space-y-4">
          <ToggleGroup type="single" value={preferences.level ?? ''} onValueChange={select('level')} className="sm:grid-cols-2" aria-label="Nivel">
            {(Object.keys(LEVELS) as SkillLevel[]).map(l => {
              const { label, description, icon: Icon } = LEVELS[l];
              return (
                <ToggleGroupItem key={l} value={l} className="min-h-36 justify-start pt-6">
                  <Icon className="size-8 text-primary" />
                  <span className="text-lg font-semibold">{label}</span>
                  <span className="text-sm text-muted-foreground">{description}</span>
                </ToggleGroupItem>
              );
            })}
          </ToggleGroup>
          <div
            {...getRootProps()}
            className={cn(
              'flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors',
              isDragActive ? 'border-primary bg-accent' : 'hover:border-primary/50 hover:bg-accent/50',
            )}
          >
            <input {...getInputProps()} aria-label="Sube una obra para estimar tu nivel" />
            {isAssessing ? <Loader2 className="size-6 animate-spin text-primary" /> : <Wand2 className="size-6 text-primary" />}
            <p className="font-medium">{isAssessing ? 'Analizando tu obra…' : '¿No sabes tu nivel? Sube una obra y Andy lo estima'}</p>
            <p className="text-sm text-muted-foreground"><Upload className="inline size-3.5" /> Arrastra una imagen o haz clic</p>
          </div>
        </div>
      )}

      {current.key === 'medium' && (
        <ToggleGroup type="single" value={preferences.medium ?? ''} onValueChange={select('medium')} className="grid-cols-2 sm:grid-cols-3" aria-label="Técnica">
          {(Object.keys(MEDIUMS) as Medium[]).map(m => {
            const { label, description, icon: Icon } = MEDIUMS[m];
            return (
              <ToggleGroupItem key={m} value={m} className="min-h-32">
                <Icon className="size-7 text-primary" />
                <span className="font-semibold">{label}</span>
                <span className="text-xs text-muted-foreground">{description}</span>
              </ToggleGroupItem>
            );
          })}
        </ToggleGroup>
      )}

      {current.key === 'subject' && (
        <ToggleGroup type="single" value={preferences.subject ?? ''} onValueChange={select('subject')} className="grid-cols-2" aria-label="Tema">
          {(Object.keys(SUBJECTS) as Subject[]).map(s => {
            const { label, description, icon: Icon } = SUBJECTS[s];
            return (
              <ToggleGroupItem key={s} value={s} className="min-h-32">
                <Icon className="size-7 text-primary" />
                <span className="font-semibold">{label}</span>
                <span className="text-xs text-muted-foreground">{description}</span>
              </ToggleGroupItem>
            );
          })}
        </ToggleGroup>
      )}

      {/* En móvil los botones quedan fijos abajo, al alcance del pulgar */}
      <Card className="fixed inset-x-0 bottom-0 rounded-none border-x-0 border-b-0 py-3 sm:static sm:rounded-xl sm:border sm:py-4">
        <CardContent className="flex items-center justify-between gap-3 px-4">
          <Button variant="ghost" onClick={() => setStep(s => s - 1)} disabled={step === 0}>
            <ArrowLeft /> Atrás
          </Button>
          <Button size="lg" disabled={!value || isAssessing} onClick={() => (isLast ? onComplete() : setStep(s => s + 1))}>
            {isLast ? 'Crear mi reto' : 'Siguiente'} <ArrowRight />
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
