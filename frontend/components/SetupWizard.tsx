import React, { useState } from 'react';
import { SkillLevel, Medium, Subject, UserPreferences, skillLevelConfig } from '../types.ts';
import { Upload } from 'lucide-react';

interface SetupWizardProps {
  preferences: UserPreferences;
  setPreferences: React.Dispatch<React.SetStateAction<UserPreferences>>;
  onComplete: () => void;
  onAssess: (base64: string, mimeType: string) => void;
  isLoading: boolean;
}

const cardClass = (selected: boolean) => `clickable-card p-4 border rounded-xl ${selected ? 'active' : ''}`;

export const SetupWizard: React.FC<SetupWizardProps> = ({ preferences, setPreferences, onComplete, onAssess, isLoading }) => {
  const [showAssessment, setShowAssessment] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => onAssess(reader.result!.toString().split(',')[1], file.type);
      reader.readAsDataURL(file);
    }
  };

  const canContinue = preferences.level && preferences.medium && preferences.subject && !isLoading;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <section className="step-1 p-6 rounded-2xl border">
        <h3 className="text-xl font-semibold mb-4">1. How should we start?</h3>
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => setShowAssessment(false)} className={cardClass(!showAssessment)}>Select Level Manually</button>
          <button onClick={() => setShowAssessment(true)} className={cardClass(showAssessment)}>Upload Work for Assessment</button>
        </div>
      </section>

      {showAssessment ? (
        <div className="p-8 border-2 border-dashed rounded-2xl text-center">
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} disabled={isLoading} className="hidden" id="file-upload" />
          <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
            {isLoading ? (
              <div className="w-12 h-12 mb-2 border-4 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
            ) : (
              <Upload className="w-12 h-12 mb-2" />
            )}
            <span>{isLoading ? 'Analyzing your work...' : 'Upload a sample of your work'}</span>
          </label>
          {preferences.level && !isLoading && (
            <p className="mt-4 font-semibold">Detected level: {preferences.level}</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {Object.values(SkillLevel).map(l => {
            const config = skillLevelConfig[l];
            return (
              <button key={l} onClick={() => setPreferences(p => ({ ...p, level: l }))} className={cardClass(preferences.level === l)}>
                <div className="circle"></div>
                <img src={config.icon} alt={config.label} width="50" height="50" />
                <span className="title-1">{l}</span>
                <p>{config.description}</p>
              </button>
            );
          })}
        </div>
      )}

      <section className="p-6 rounded-2xl border">
        <h3 className="text-xl font-semibold mb-4">2. Choose your medium</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {Object.values(Medium).map(m => (
            <button key={m} onClick={() => setPreferences(p => ({ ...p, medium: m }))} className={cardClass(preferences.medium === m)}>{m}</button>
          ))}
        </div>
      </section>

      <section className="p-6 rounded-2xl border">
        <h3 className="text-xl font-semibold mb-4">3. Choose your subject</h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.values(Subject).map(s => (
            <button key={s} onClick={() => setPreferences(p => ({ ...p, subject: s }))} className={cardClass(preferences.subject === s)}>{s}</button>
          ))}
        </div>
      </section>

      <button onClick={onComplete} disabled={!canContinue} className="w-full py-4 bg-art-800 rounded-full disabled:opacity-50 disabled:cursor-not-allowed">
        {isLoading ? 'Creating your challenge...' : 'Continue'}
      </button>
    </div>
  );
};
