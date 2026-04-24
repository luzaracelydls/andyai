import React, { useState } from 'react';
import { SkillLevel, Medium, Subject, UserPreferences } from '../types.ts';
import { Sparkles, Paintbrush, Image as ImageIcon, User, Upload } from 'lucide-react';

interface SetupWizardProps {
  preferences: UserPreferences;
  setPreferences: React.Dispatch<React.SetStateAction<UserPreferences>>;
  onComplete: () => void;
  onAssess: (base64: string, mimeType: string) => void;
  isLoading: boolean;
}

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

  const [isActive, setIsActive] = useState(false); 
 

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h2 className="text-3xl font-bold text-center">Welcome to Andy AI Mentor🎨</h2>
      
      <section className="step-1 p-6 rounded-2xl border">
        <h3 className="text-xl font-semibold mb-4">1. How should we start?</h3>
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => setShowAssessment(false)} className={`p-4 border rounded-xl ${!showAssessment  ? 'active' : ''}`}>Select Level Manually</button>
          <button onClick={() => setShowAssessment(true)} className="p-4 border rounded-xl bg-art-50">Upload Work for Assessment</button>
        </div>
      </section>

      {showAssessment ? (
        <div className="p-8 border-2 border-dashed rounded-2xl text-center">
          <input type="file" onChange={handleFile} className="hidden" id="file-upload" />
          <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
            <Upload className="w-12 h-12 mb-2" />
            <span>Upload a sample of your work</span>
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {Object.values(SkillLevel).map(l => (
            <button key={l} onClick={() => {setPreferences(p => ({...p, level: l})); }} className={`p-4 border rounded-xl ${preferences.level === l ? 'bg-art-800 text-white' : ''}`}>{l}</button>
          ))}
        </div>
      )}

      <button onClick={onComplete} disabled={!preferences.level} className="w-full py-4 bg-art-800 text-white rounded-full">Continue</button>
    </div>
  );
};
