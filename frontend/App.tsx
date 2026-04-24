import React, { useState, useCallback } from 'react';
import { Header } from './components/Header.tsx';
import { SetupWizard } from './components/SetupWizard.tsx';
import { ChallengeView } from './components/ChallengeView.tsx';
import { ArtworkUploader } from './components/ArtworkUploader.tsx';
import { EvaluationReport } from './components/EvaluationReport.tsx';
import { generateChallenge, evaluateArtwork, assessSkillLevel } from './services/gemini.ts';
import { AppState, UserPreferences, Challenge, Evaluation } from './types.ts';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('setup');
  const [preferences, setPreferences] = useState<UserPreferences>({ level: null, medium: null, subject: null });
  const [currentChallenge, setCurrentChallenge] = useState<Challenge & { imagePrompts: string[], complexity: string } | null>(null);
  const [evaluation, setEvaluation] = useState<Evaluation & { rating: number } | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAssess = async (base64: string, mimeType: string) => {
    setIsLoading(true);
    const level = await assessSkillLevel(base64, mimeType);
    setPreferences(p => ({ ...p, level }));
    setIsLoading(false);
  };

  const handleGenerate = async () => {
    setIsLoading(true);
    const challenge = await generateChallenge(preferences.level!, preferences.medium!, preferences.subject!);
    setCurrentChallenge(challenge);
    setAppState('challenge');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-art-50">
      <Header />
      <main className="container mx-auto p-4">
        {appState === 'setup' && <SetupWizard preferences={preferences} setPreferences={setPreferences} onComplete={handleGenerate} onAssess={handleAssess} isLoading={isLoading} />}
        {appState === 'challenge' && currentChallenge && <ChallengeView challenge={currentChallenge} onAccept={() => setAppState('upload')} onRegenerate={handleGenerate} isLoading={isLoading} />}
        {appState === 'upload' && <ArtworkUploader onUpload={async (b, m) => {
            const res = await evaluateArtwork(b, m, currentChallenge!, preferences.level!, preferences.medium!);
            setEvaluation(res);
            setUploadedImageUrl(`data:${m};base64,${b}`);
            setAppState('evaluation');
        }} isLoading={isLoading} onCancel={() => setAppState('challenge')} />}
        {appState === 'evaluation' && evaluation && <EvaluationReport evaluation={evaluation} imageUrl={uploadedImageUrl!} onRestart={() => setAppState('setup')} />}
      </main>
    </div>
  );
};

export default App;
