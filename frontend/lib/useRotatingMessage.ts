import { useEffect, useState } from 'react';

// Cambia de mensaje cada pocos segundos mientras `active` es true
export function useRotatingMessage(messages: string[], active: boolean, intervalMs = 2200): string {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!active) return;
    setIndex(0);
    const id = setInterval(() => setIndex(i => (i + 1) % messages.length), intervalMs);
    return () => clearInterval(id);
  }, [active, messages, intervalMs]);
  return messages[index];
}
