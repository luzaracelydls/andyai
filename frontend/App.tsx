import React, { useState, useCallback } from 'react';
import { Header } from './components/Header.tsx';
import { SetupWizard } from './components/SetupWizard.tsx';
import { ChallengeView } from './components/ChallengeView.tsx';
import { ArtworkUploader } from './components/ArtworkUploader.tsx';
import { EvaluationReport } from './components/EvaluationReport.tsx';
import { generateChallenge, evaluateArtwork, assessSkillLevel } from './services/gemini.ts';
import { AppState, UserPreferences, Challenge, Evaluation, YoutubeVideo } from './types.ts';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('setup');
  const [preferences, setPreferences] = useState<UserPreferences>({ level: null, medium: null, subject: null });
  const [currentChallenge, setCurrentChallenge] = useState<Challenge & { youtubeQueries: string[], youtubeResults: string[], complexity: string } | null>(null);
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
    <div className="min-h-screen bg-art-50 bg-gradient-to-r from-purple-50 to-pink-50">
    <Header />
    <main className="container mx-auto p-4">
    <div className="min-h-full flex items-center justify-center p-4 md:p-8 andy-ai-grid">
       <h1>Andy AI</h1>
    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center" data-fg-ddaj4="1.19:1.3019:/src/app/components/WelcomeScreen.tsx:14:13:487:197:e:div:e" data-fgid-ddaj4=":r6:">
    <div>
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-palette w-10 h-10 " data-fg-ddaj5="1.19:1.3019:/src/app/components/WelcomeScreen.tsx:15:15:621:44:e:Palette::::::CGQb" data-fgid-ddaj5=":r7:"><circle cx="13.5" cy="6.5" r=".5" fill="currentColor"></circle><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"></circle><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"></circle><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"></circle><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"></path></svg>
   
    </div>
    
    </div>
    </div>
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
