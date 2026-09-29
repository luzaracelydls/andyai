import type { LucideIcon } from 'lucide-react';
import {
  Apple, Brush, Droplets, Flower2, Paintbrush, Palette, PawPrint, PenTool, PersonStanding, Sparkles, Sprout,
} from 'lucide-react';
import { Medium, SkillLevel, Subject } from '../types.ts';

// Textos de la interfaz en un solo lugar. Los valores de los enums se quedan en inglés
// porque son los que entiende la API.

interface Option { label: string; description: string; icon: LucideIcon }

export const LEVELS: Record<SkillLevel, Option> = {
  [SkillLevel.Newbie]: { label: 'Principiante', description: 'Estás empezando tu camino artístico.', icon: Sprout },
  [SkillLevel.Intermediate]: { label: 'Intermedio', description: 'Quieres pulir tu técnica con retos más complejos.', icon: Sparkles },
};

export const MEDIUMS: Record<Medium, Option> = {
  [Medium.Watercolor]: { label: 'Acuarela', description: 'Transparencias y agua', icon: Droplets },
  [Medium.Acrylic]: { label: 'Acrílico', description: 'Secado rápido y colores vivos', icon: Paintbrush },
  [Medium.Oil]: { label: 'Óleo', description: 'Mezclas lentas y ricas', icon: Palette },
  [Medium.Pastels]: { label: 'Pastel seco', description: 'Texturas suaves', icon: Brush },
  [Medium.OilPastels]: { label: 'Pastel al óleo', description: 'Trazos cremosos', icon: PenTool },
};

export const SUBJECTS: Record<Subject, Option> = {
  [Subject.SingleObjects]: { label: 'Objetos', description: 'Bodegones y formas simples', icon: Apple },
  [Subject.HumanAnatomy]: { label: 'Figura humana', description: 'Proporciones y gesto', icon: PersonStanding },
  [Subject.Animals]: { label: 'Animales', description: 'Pelaje, plumas y movimiento', icon: PawPrint },
  [Subject.Plants]: { label: 'Plantas', description: 'Hojas, flores y ramas', icon: Flower2 },
};

export const CRITERIA = [
  { key: 'proportions', label: 'Proporciones' },
  { key: 'composition', label: 'Composición' },
  { key: 'colorTheory', label: 'Teoría del color' },
  { key: 'volume', label: 'Volumen y forma' },
  { key: 'lightingShadow', label: 'Luz y sombra' },
] as const;

export type CriterionKey = (typeof CRITERIA)[number]['key'];

export const LOADING_MESSAGES = {
  challenge: ['Mezclando colores…', 'Buscando la luz perfecta…', 'Preparando tu lienzo…', 'Eligiendo pinceles…'],
  evaluate: ['Observando tu obra…', 'Midiendo proporciones…', 'Analizando luces y sombras…', 'Escribiendo la crítica…'],
};
