import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, CheckCircle2 } from 'lucide-react';

// La API acepta ~6 MB en base64, que equivale a ~4 MB de imagen
const MAX_FILE_BYTES = 4 * 1024 * 1024;

interface ArtworkUploaderProps {
  onUpload: (base64: string, mimeType: string) => void;
  isLoading: boolean;
  onCancel: () => void;
}

export const ArtworkUploader: React.FC<ArtworkUploaderProps> = ({
  onUpload,
  isLoading,
  onCancel
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileData, setFileData] = useState<{ base64: string; mimeType: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Libera la URL de vista previa cuando cambia o se desmonta el componente
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError(null);

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }

    if (file.size > MAX_FILE_BYTES) {
      setError('The image is too large. Please upload one under 4MB.');
      return;
    }

    // Create preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Convert to base64 for API
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Extract just the base64 data part, removing the data:image/jpeg;base64, prefix
      const base64Data = base64String.split(',')[1];
      setFileData({ base64: base64Data, mimeType: file.type });
    };
    reader.onerror = () => {
      setError('Failed to read file.');
    };
    reader.readAsDataURL(file);
  };

  const handleClear = () => {
    setPreviewUrl(null);
    setFileData(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = () => {
    if (fileData) {
      onUpload(fileData.base64, fileData.mimeType);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center mb-8">
        <h2 className="font-serif text-3xl font-bold text-art-900 mb-3">Submit Your Masterpiece</h2>
        <p className="text-art-600">Upload a clear photo of your finished work for constructive feedback.</p>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-lg border border-art-100">
        {!previewUrl ? (
          <div 
            className="border-2 border-dashed border-art-300 rounded-2xl p-12 text-center hover:bg-art-50 transition-colors cursor-pointer group"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="bg-art-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8 text-art-600" />
            </div>
            <h3 className="text-lg font-semibold text-art-800 mb-1">Click to upload image</h3>
            <p className="text-sm text-art-500">JPEG, PNG or WEBP up to 4MB</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="relative rounded-2xl overflow-hidden border border-art-200 bg-art-50 flex justify-center items-center min-h-[300px]">
              <img 
                src={previewUrl} 
                alt="Artwork preview" 
                className="max-h-[500px] object-contain"
              />
              <button 
                onClick={handleClear}
                disabled={isLoading}
                className="absolute top-4 right-4 bg-white/90 p-2 rounded-full shadow-md hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                title="Remove image"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex items-center gap-3 text-green-700 bg-green-50 p-4 rounded-xl border border-green-200">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">Image ready for evaluation.</p>
            </div>
          </div>
        )}

        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/jpeg, image/png, image/webp" 
          className="hidden" 
        />

        {error && (
          <p className="text-red-500 text-sm mt-4 text-center">{error}</p>
        )}

        <div className="flex justify-between mt-8 pt-6 border-t border-art-100">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-6 py-2 rounded-full text-art-600 font-medium hover:bg-art-100 transition-colors disabled:opacity-50"
          >
            Back to Challenge
          </button>
          <button
            onClick={handleSubmit}
            disabled={!fileData || isLoading}
            className={`flex items-center gap-2 px-8 py-3 rounded-full font-semibold transition-all ${
              fileData && !isLoading
                ? 'bg-art-800 text-white hover:bg-art-900 shadow-md hover:shadow-lg'
                : 'bg-art-200 text-art-400 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              'Get Feedback'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
