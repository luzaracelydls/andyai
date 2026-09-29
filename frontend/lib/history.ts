import type { CriterionScores, Medium, Subject } from '../types.ts';

// Historial de evaluaciones guardado solo en este navegador (localStorage)

export interface HistoryEntry {
  id: string;
  date: string; // ISO
  medium: Medium;
  subject: Subject;
  challengeTitle: string;
  rating: number;
  scores: CriterionScores;
  meetsChallenge: boolean;
  thumbnail: string; // data URL pequeña
}

const KEY = 'andy-ai:history';
const MAX_ENTRIES = 30;

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addToHistory(entry: Omit<HistoryEntry, 'id' | 'date'>): HistoryEntry[] {
  const full: HistoryEntry = { ...entry, id: crypto.randomUUID(), date: new Date().toISOString() };
  const next = [...loadHistory(), full].slice(-MAX_ENTRIES);
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Almacenamiento lleno o bloqueado: el historial es opcional, la app sigue funcionando
  }
  return next;
}

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

// Días seguidos con al menos una obra, contando hasta hoy (o ayer, si hoy aún no pintas)
export function practiceStreak(entries: HistoryEntry[], today = new Date()): number {
  const days = new Set(entries.map(e => dayKey(new Date(e.date))));
  const cursor = new Date(today);
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
