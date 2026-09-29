import * as React from 'react';
import { ToggleGroup as ToggleGroupPrimitive } from 'radix-ui';
import { cn } from '@/lib/utils';

// Variante "tarjeta" de ToggleGroup: opciones grandes y seleccionables con teclado (flechas)
function ToggleGroup({ className, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Root>) {
  return <ToggleGroupPrimitive.Root data-slot="toggle-group" className={cn('grid gap-3', className)} {...props} />;
}

function ToggleGroupItem({ className, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Item>) {
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      className={cn(
        'bg-card text-card-foreground flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-border p-4 text-center shadow-sm transition-all outline-none',
        'hover:border-primary/40 hover:-translate-y-0.5 hover:shadow-md',
        'focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        'data-[state=on]:border-primary data-[state=on]:bg-accent data-[state=on]:text-accent-foreground',
        'disabled:pointer-events-none disabled:opacity-50',
        className,
      )}
      {...props}
    />
  );
}

export { ToggleGroup, ToggleGroupItem };
