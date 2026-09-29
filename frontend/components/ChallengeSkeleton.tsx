import React from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LOADING_MESSAGES } from '@/lib/copy';
import { useRotatingMessage } from '@/lib/useRotatingMessage';

// Esqueleto con la forma del reto mientras Gemini lo genera
export const ChallengeSkeleton: React.FC = () => {
  const message = useRotatingMessage(LOADING_MESSAGES.challenge, true);
  return (
    <div className="mx-auto max-w-4xl space-y-6" aria-busy="true">
      <p role="status" className="flex items-center justify-center gap-2 text-lg font-medium text-primary">
        <Loader2 className="size-5 animate-spin" /> {message}
      </p>
      <Card className="overflow-hidden pt-0">
        <div className="space-y-4 bg-accent px-6 py-10">
          <Skeleton className="mx-auto h-5 w-40 bg-primary/15" />
          <Skeleton className="mx-auto h-9 w-2/3 bg-primary/15" />
          <Skeleton className="mx-auto h-4 w-1/2 bg-primary/15" />
        </div>
        <CardContent className="grid gap-8 md:grid-cols-2">
          {[0, 1].map(col => (
            <div key={col} className="space-y-3">
              <Skeleton className="h-6 w-40" />
              {[0, 1, 2].map(row => <Skeleton key={row} className="h-12 w-full" />)}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
