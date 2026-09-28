import React, { useState } from 'react';
import { Palette, X } from 'lucide-react';
import { Header } from './components/Header.tsx';
import { SetupWizard } from './components/SetupWizard.tsx';
import { ChallengeView } from './components/ChallengeView.tsx';
import { ArtworkUploader } from './components/ArtworkUploader.tsx';
import { EvaluationReport } from './components/EvaluationReport.tsx';
import { generateChallenge, evaluateArtwork, assessSkillLevel } from './services/api.ts';
import { AppState, UserPreferences, ChallengeResponse, Evaluation } from './types.ts';

const EMPTY_PREFERENCES: UserPreferences = { level: null, medium: null, subject: null };

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('setup');
  const [preferences, setPreferences] = useState<UserPreferences>(EMPTY_PREFERENCES);
  const [currentChallenge, setCurrentChallenge] = useState<ChallengeResponse | null>(null);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ejecuta una llamada a la API manejando loading y errores en un solo lugar
  const run = async (action: () => Promise<void>) => {
    setError(null);
    setIsLoading(true);
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ocurrió un error inesperado');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssess = (base64: string, mimeType: string) => run(async () => {
    const level = await assessSkillLevel(base64, mimeType);
    setPreferences(p => ({ ...p, level }));
  });

  const handleGenerate = () => run(async () => {
    const { level, medium, subject } = preferences;
    if (!level || !medium || !subject) throw new Error('Elige nivel, técnica y tema para continuar');
    setCurrentChallenge(await generateChallenge(level, medium, subject));
    setAppState('challenge');
  });

  const handleEvaluate = (base64: string, mimeType: string) => run(async () => {
    const { level, medium } = preferences;
    if (!currentChallenge || !level || !medium) throw new Error('Primero genera un reto');
    setEvaluation(await evaluateArtwork(base64, mimeType, currentChallenge, level, medium));
    setUploadedImageUrl(`data:${mimeType};base64,${base64}`);
    setAppState('evaluation');
  });

  const handleRestart = () => {
    setPreferences(EMPTY_PREFERENCES);
    setCurrentChallenge(null);
    setEvaluation(null);
    setUploadedImageUrl(null);
    setError(null);
    setAppState('setup');
  };

  return (
    <div className="min-h-screen bg-art-50 bg-gradient-to-r from-purple-50 to-pink-50">
      <Header />
      <main className="container mx-auto p-4">
        {error && (
          <div role="alert" className="max-w-3xl mx-auto mb-6 flex items-start justify-between gap-4 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
            <p>{error}</p>
            <button onClick={() => setError(null)} aria-label="Cerrar" className="shrink-0"><X className="w-5 h-5" /></button>
          </div>
        )}

        {appState === 'setup' && (
          <>
            <div className="min-h-full flex items-center justify-center p-4 md:p-8 andy-ai-grid">
              <h1>Andy AI</h1>
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Palette className="w-10 h-10" />
              </div>
            </div>
            <SetupWizard preferences={preferences} setPreferences={setPreferences} onComplete={handleGenerate} onAssess={handleAssess} isLoading={isLoading} />
          </>
        )}
        {appState === 'challenge' && currentChallenge && <ChallengeView challenge={currentChallenge} onAccept={() => setAppState('upload')} onRegenerate={handleGenerate} isLoading={isLoading} />}
        {appState === 'upload' && <ArtworkUploader onUpload={handleEvaluate} isLoading={isLoading} onCancel={() => setAppState('challenge')} />}
        {appState === 'evaluation' && evaluation && uploadedImageUrl && <EvaluationReport evaluation={evaluation} imageUrl={uploadedImageUrl} onRestart={handleRestart} />}
      </main>
    </div>
  );
};

export default App;
