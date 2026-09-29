import React, { Suspense, lazy, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { Header } from './components/Header.tsx';
import { SetupWizard } from './components/SetupWizard.tsx';
import { ChallengeView } from './components/ChallengeView.tsx';
import { ChallengeSkeleton } from './components/ChallengeSkeleton.tsx';
import { ArtworkUploader } from './components/ArtworkUploader.tsx';
import { EvaluationReport } from './components/EvaluationReport.tsx';
import { Toaster } from './components/ui/sonner.tsx';
import { generateChallenge, evaluateArtwork, assessSkillLevel } from './services/api.ts';
import { AppState, UserPreferences, ChallengeResponse, Evaluation } from './types.ts';
import { LEVELS } from './lib/copy.ts';
import { prepareImage, makeThumbnail, type PreparedImage } from './lib/image.ts';
import { addToHistory, loadHistory, type HistoryEntry } from './lib/history.ts';

// Recharts solo se descarga al abrir "Mi progreso"
const ProgressView = lazy(() => import('./components/ProgressView.tsx').then(m => ({ default: m.ProgressView })));

const EMPTY_PREFERENCES: UserPreferences = { level: null, medium: null, subject: null };

type Pending = 'assess' | 'challenge' | 'evaluate' | null;

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('setup');
  const [preferences, setPreferences] = useState<UserPreferences>(EMPTY_PREFERENCES);
  const [currentChallenge, setCurrentChallenge] = useState<ChallengeResponse | null>(null);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory);
  const [pending, setPending] = useState<Pending>(null);
  const [error, setError] = useState<string | null>(null);

  // Cada pantalla nueva empieza arriba (si no, "Mi progreso" se abre a media página)
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [appState]);

  // Ejecuta una llamada a la API manejando loading y errores en un solo lugar
  const run = async (kind: Exclude<Pending, null>, action: () => Promise<void>) => {
    setError(null);
    setPending(kind);
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ocurrió un error inesperado');
    } finally {
      setPending(null);
    }
  };

  const handleAssess = (file: File) => run('assess', async () => {
    const image = await prepareImage(file);
    const level = await assessSkillLevel(image.base64, image.mimeType);
    setPreferences(p => ({ ...p, level }));
    toast.success(`Andy estima que tu nivel es: ${LEVELS[level].label}`);
  });

  const handleGenerate = () => run('challenge', async () => {
    const { level, medium, subject } = preferences;
    if (!level || !medium || !subject) throw new Error('Elige nivel, técnica y tema para continuar');
    setCurrentChallenge(await generateChallenge(level, medium, subject));
    setAppState('challenge');
  });

  const handleEvaluate = (image: PreparedImage) => run('evaluate', async () => {
    const { level, medium, subject } = preferences;
    if (!currentChallenge || !level || !medium || !subject) throw new Error('Primero genera un reto');
    const result = await evaluateArtwork(image.base64, image.mimeType, currentChallenge, level, medium);
    setEvaluation(result);
    setUploadedImageUrl(image.dataUrl);
    setAppState('evaluation');
    setHistory(addToHistory({
      medium,
      subject,
      challengeTitle: currentChallenge.title,
      rating: result.rating,
      scores: result.scores,
      meetsChallenge: result.meetsChallenge,
      thumbnail: await makeThumbnail(image.dataUrl),
    }));
    toast.success('Guardada en tu progreso');
  });

  const handleRestart = () => {
    setPreferences(EMPTY_PREFERENCES);
    setCurrentChallenge(null);
    setEvaluation(null);
    setUploadedImageUrl(null);
    setError(null);
    setAppState('setup');
  };

  const showProgress = () => {
    setError(null);
    setAppState('history');
  };

  return (
    <div className="min-h-screen">
      <Header onHome={handleRestart} onProgress={showProgress} progressActive={appState === 'history'} />
      <Toaster />
      <main className="mx-auto max-w-5xl px-4 py-8">
        {error && (
          <div role="alert" className="mx-auto mb-6 flex max-w-3xl items-start justify-between gap-4 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-destructive">
            <p>{error}</p>
            <button onClick={() => setError(null)} aria-label="Cerrar" className="shrink-0"><X className="size-5" /></button>
          </div>
        )}

        {appState === 'setup' && (pending === 'challenge'
          ? <ChallengeSkeleton />
          : <SetupWizard preferences={preferences} setPreferences={setPreferences} onComplete={handleGenerate} onAssess={handleAssess} isAssessing={pending === 'assess'} />)}
        {appState === 'challenge' && currentChallenge && preferences.medium && preferences.subject && (pending === 'challenge'
          ? <ChallengeSkeleton />
          : <ChallengeView challenge={currentChallenge} medium={preferences.medium} subject={preferences.subject} onAccept={() => setAppState('upload')} onRegenerate={handleGenerate} isLoading={pending !== null} />)}
        {appState === 'upload' && currentChallenge && (
          <ArtworkUploader challengeTitle={currentChallenge.title} onUpload={handleEvaluate} isLoading={pending === 'evaluate'} onCancel={() => setAppState('challenge')} />
        )}
        {appState === 'evaluation' && evaluation && uploadedImageUrl && currentChallenge && (
          <EvaluationReport
            evaluation={evaluation}
            imageUrl={uploadedImageUrl}
            challengeTitle={currentChallenge.title}
            onRetry={() => setAppState('upload')}
            onRestart={handleRestart}
            onProgress={showProgress}
          />
        )}
        {appState === 'history' && (
          <Suspense fallback={<p role="status" className="text-center text-muted-foreground">Cargando tu progreso…</p>}>
            <ProgressView history={history} onStart={handleRestart} />
          </Suspense>
        )}
      </main>
    </div>
  );
};

export default App;
