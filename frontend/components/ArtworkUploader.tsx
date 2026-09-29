import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { ArrowLeft, ImageUp, Loader2, Sparkles, X } from 'lucide-react';
import { prepareImage, type PreparedImage } from '@/lib/image';
import { LOADING_MESSAGES } from '@/lib/copy';
import { useRotatingMessage } from '@/lib/useRotatingMessage';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ArtworkUploaderProps {
  challengeTitle: string;
  onUpload: (image: PreparedImage) => void;
  isLoading: boolean;
  onCancel: () => void;
}

export const ArtworkUploader: React.FC<ArtworkUploaderProps> = ({ challengeTitle, onUpload, isLoading, onCancel }) => {
  const [image, setImage] = useState<PreparedImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [preparing, setPreparing] = useState(false);
  const message = useRotatingMessage(LOADING_MESSAGES.evaluate, isLoading);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 1,
    disabled: isLoading || preparing,
    onDropRejected: () => setError('Ese archivo no es una imagen. Prueba con JPG, PNG o WEBP.'),
    onDropAccepted: async ([file]) => {
      setError(null);
      setPreparing(true);
      try {
        // Se reduce a 1600 px en JPEG: fotos del celular de 10 MB quedan en unos cientos de KB
        setImage(await prepareImage(file));
      } catch (e) {
        setError(e instanceof Error ? e.message : 'No se pudo leer la imagen');
      } finally {
        setPreparing(false);
      }
    },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-2 text-center">
        <p className="text-sm font-medium text-primary">{challengeTitle}</p>
        <h1 className="text-3xl font-bold sm:text-4xl">Sube tu obra</h1>
        <p className="text-muted-foreground">Una foto nítida, de frente y con buena luz ayuda a que la crítica sea precisa.</p>
      </div>

      <Card>
        <CardContent className="space-y-4">
          {image ? (
            <div className="relative flex min-h-72 items-center justify-center overflow-hidden rounded-xl border bg-muted">
              <img src={image.dataUrl} alt="Vista previa de tu obra" className={cn('max-h-[28rem] object-contain', isLoading && 'opacity-40')} />
              {isLoading ? (
                <div role="status" className="absolute inset-0 flex flex-col items-center justify-center gap-3 font-medium text-primary">
                  <Loader2 className="size-8 animate-spin" /> {message}
                </div>
              ) : (
                <Button variant="secondary" size="icon" onClick={() => setImage(null)} className="absolute right-3 top-3 rounded-full" aria-label="Quitar imagen">
                  <X />
                </Button>
              )}
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={cn(
                'flex min-h-72 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-colors',
                isDragActive ? 'border-primary bg-accent' : 'hover:border-primary/50 hover:bg-accent/50',
              )}
            >
              <input {...getInputProps()} aria-label="Selecciona la foto de tu obra" />
              <span className="flex size-14 items-center justify-center rounded-full bg-accent text-primary">
                {preparing ? <Loader2 className="size-7 animate-spin" /> : <ImageUp className="size-7" />}
              </span>
              <p className="text-lg font-semibold">{isDragActive ? 'Suéltala aquí' : 'Arrastra tu foto o haz clic'}</p>
              <p className="text-sm text-muted-foreground">JPG, PNG o WEBP · la reducimos automáticamente</p>
            </div>
          )}
          {error && <p role="alert" className="text-center text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button variant="ghost" onClick={onCancel} disabled={isLoading}>
          <ArrowLeft /> Volver al reto
        </Button>
        <Button size="lg" onClick={() => image && onUpload(image)} disabled={!image || isLoading}>
          <Sparkles /> {isLoading ? 'Evaluando…' : 'Recibir crítica'}
        </Button>
      </div>
    </div>
  );
};
