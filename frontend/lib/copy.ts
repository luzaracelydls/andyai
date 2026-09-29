import type { LucideIcon } from 'lucide-react';
import {
  Apple, Brush, Droplets, Flower2, Paintbrush, Palette, PawPrint, PenTool, PersonStanding, Sparkles, Sprout,
} from 'lucide-react';
import { Medium, SkillLevel, Subject } from '../types.ts';

// Textos de la interfaz en español e inglés. Los valores de los enums se quedan en inglés
// porque son los que entiende la API.

export type Lang = 'es' | 'en';

interface Option { label: string; description: string }

// Íconos de cada opción (no dependen del idioma)
export const LEVEL_ICONS: Record<SkillLevel, LucideIcon> = {
  [SkillLevel.Newbie]: Sprout,
  [SkillLevel.Intermediate]: Sparkles,
};
export const MEDIUM_ICONS: Record<Medium, LucideIcon> = {
  [Medium.Watercolor]: Droplets,
  [Medium.Acrylic]: Paintbrush,
  [Medium.Oil]: Palette,
  [Medium.Pastels]: Brush,
  [Medium.OilPastels]: PenTool,
};
export const SUBJECT_ICONS: Record<Subject, LucideIcon> = {
  [Subject.SingleObjects]: Apple,
  [Subject.HumanAnatomy]: PersonStanding,
  [Subject.Animals]: PawPrint,
  [Subject.Plants]: Flower2,
};

export const CRITERIA_KEYS = ['proportions', 'composition', 'colorTheory', 'volume', 'lightingShadow'] as const;
export type CriterionKey = (typeof CRITERIA_KEYS)[number];

const es = {
  htmlTitle: 'Andy AI · Tu mentora de pintura',
  dateLocale: 'es',
  header: {
    newChallenge: 'Nuevo reto',
    myProgress: 'Mi progreso',
    switchLanguage: 'English',
    switchLanguageLabel: 'Cambiar el idioma a inglés',
  },
  levels: {
    [SkillLevel.Newbie]: { label: 'Principiante', description: 'Estás empezando tu camino artístico.' },
    [SkillLevel.Intermediate]: { label: 'Intermedio', description: 'Quieres pulir tu técnica con retos más complejos.' },
  } as Record<SkillLevel, Option>,
  mediums: {
    [Medium.Watercolor]: { label: 'Acuarela', description: 'Transparencias y agua' },
    [Medium.Acrylic]: { label: 'Acrílico', description: 'Secado rápido y colores vivos' },
    [Medium.Oil]: { label: 'Óleo', description: 'Mezclas lentas y ricas' },
    [Medium.Pastels]: { label: 'Pastel seco', description: 'Texturas suaves' },
    [Medium.OilPastels]: { label: 'Pastel al óleo', description: 'Trazos cremosos' },
  } as Record<Medium, Option>,
  subjects: {
    [Subject.SingleObjects]: { label: 'Objetos', description: 'Bodegones y formas simples' },
    [Subject.HumanAnatomy]: { label: 'Figura humana', description: 'Proporciones y gesto' },
    [Subject.Animals]: { label: 'Animales', description: 'Pelaje, plumas y movimiento' },
    [Subject.Plants]: { label: 'Plantas', description: 'Hojas, flores y ramas' },
  } as Record<Subject, Option>,
  criteria: {
    proportions: 'Proporciones',
    composition: 'Composición',
    colorTheory: 'Teoría del color',
    volume: 'Volumen y forma',
    lightingShadow: 'Luz y sombra',
  } as Record<CriterionKey, string>,
  setup: {
    step: (n: number, total: number) => `Paso ${n} de ${total}`,
    progressLabel: 'Progreso de la configuración',
    steps: {
      level: { title: '¿Cuál es tu nivel?', hint: 'Elige uno o deja que Andy lo estime con una obra tuya.', label: 'Nivel' },
      medium: { title: '¿Con qué técnica vas a pintar?', hint: 'El reto se adapta a los materiales que tienes.', label: 'Técnica' },
      subject: { title: '¿Qué te gustaría pintar?', hint: 'Escoge el tema de tu próximo reto.', label: 'Tema' },
    },
    assessPrompt: '¿No sabes tu nivel? Sube una obra y Andy lo estima',
    assessing: 'Analizando tu obra…',
    dropHint: 'Arrastra una imagen o haz clic',
    assessInputLabel: 'Sube una obra para estimar tu nivel',
    back: 'Atrás',
    next: 'Siguiente',
    create: 'Crear mi reto',
  },
  challenge: {
    mission: 'Tu misión',
    focusTitle: 'Puntos a trabajar',
    focusProgress: (done: number, total: number) => `Márcalos mientras pintas · ${done} de ${total}`,
    tipsTitle: 'Consejos',
    tip: (n: number) => `Consejo ${n}`,
    resourcesTitle: 'Aprende antes de empezar',
    searchYoutube: 'Buscar videos en YouTube ↗',
    another: 'Otro reto',
    done: '¡Terminé! Subir mi obra',
  },
  upload: {
    title: 'Sube tu obra',
    hint: 'Una foto nítida, de frente y con buena luz ayuda a que la crítica sea precisa.',
    notImage: 'Ese archivo no es una imagen. Prueba con JPG, PNG o WEBP.',
    previewAlt: 'Vista previa de tu obra',
    remove: 'Quitar imagen',
    dropHere: 'Suéltala aquí',
    dropPrompt: 'Arrastra tu foto o haz clic',
    formats: 'JPG, PNG o WEBP · la reducimos automáticamente',
    inputLabel: 'Selecciona la foto de tu obra',
    back: 'Volver al reto',
    evaluating: 'Evaluando…',
    submit: 'Recibir crítica',
  },
  evaluation: {
    title: 'Crítica de estudio',
    ratingLabel: (n: number) => `Calificación: ${n} de 5`,
    passed: '¡Reto cumplido!',
    keepGoing: 'Sigue practicando: ¡vas por buen camino!',
    artworkAlt: 'Tu obra',
    retry: 'Intentar este reto otra vez',
    viewProgress: 'Ver mi progreso',
    newChallenge: 'Nuevo reto',
  },
  progress: {
    title: 'Mi progreso',
    storedLocally: 'Se guarda solo en este navegador.',
    loading: 'Cargando tu progreso…',
    emptyTitle: 'Aún no hay obras evaluadas',
    emptyText: 'Completa tu primer reto y aquí verás tu galería, tu racha y cómo mejoras en cada criterio.',
    start: 'Empezar un reto',
    statArtworks: 'Obras evaluadas',
    statStreak: 'Racha (días)',
    statAverage: 'Calificación media',
    statPassed: 'Retos cumplidos',
    chartTitle: 'Calificación por obra',
    chartDescription: 'De la más antigua a la más reciente (0–5)',
    chartNeedsMore: 'Evalúa una obra más para ver tu evolución.',
    chartLabel: (n: number) => `Evolución de la calificación en ${n} obras`,
    tooltipRating: 'Calificación:',
    criteriaTitle: 'Promedio por criterio',
    criteriaDescription: 'Dónde estás más fuerte y qué practicar',
    gallery: 'Galería',
    passedBadge: 'Cumplido',
  },
  loading: {
    challenge: ['Mezclando colores…', 'Buscando la luz perfecta…', 'Preparando tu lienzo…', 'Eligiendo pinceles…'],
    evaluate: ['Observando tu obra…', 'Midiendo proporciones…', 'Analizando luces y sombras…', 'Escribiendo la crítica…'],
  },
  toasts: {
    levelEstimated: (level: string) => `Andy estima que tu nivel es: ${level}`,
    saved: 'Guardada en tu progreso',
  },
  errors: {
    close: 'Cerrar',
    unexpected: 'Ocurrió un error inesperado',
    missingChoices: 'Elige nivel, técnica y tema para continuar',
    noChallenge: 'Primero genera un reto',
    imageRead: 'No se pudo leer la imagen. Prueba con otra foto.',
    connection: (url: string) =>
      `No se pudo conectar con la API en ${url}. Revisa que esté corriendo (abre ${url}/health) ` +
      'y que la página esté abierta en http://localhost:5173.',
    assess: 'Error al analizar la imagen',
    challenge: 'Error al generar el reto',
    evaluate: 'Error al evaluar la obra',
  },
};

export type Copy = typeof es;

const en: Copy = {
  htmlTitle: 'Andy AI · Your painting mentor',
  dateLocale: 'en',
  header: {
    newChallenge: 'New challenge',
    myProgress: 'My progress',
    switchLanguage: 'Español',
    switchLanguageLabel: 'Switch language to Spanish',
  },
  levels: {
    [SkillLevel.Newbie]: { label: 'Beginner', description: 'You are just starting your artistic journey.' },
    [SkillLevel.Intermediate]: { label: 'Intermediate', description: 'You want to refine your technique with harder challenges.' },
  },
  mediums: {
    [Medium.Watercolor]: { label: 'Watercolor', description: 'Transparency and water' },
    [Medium.Acrylic]: { label: 'Acrylic', description: 'Fast drying, vivid colors' },
    [Medium.Oil]: { label: 'Oil', description: 'Slow, rich blending' },
    [Medium.Pastels]: { label: 'Soft pastels', description: 'Soft textures' },
    [Medium.OilPastels]: { label: 'Oil pastels', description: 'Creamy strokes' },
  },
  subjects: {
    [Subject.SingleObjects]: { label: 'Objects', description: 'Still lifes and simple shapes' },
    [Subject.HumanAnatomy]: { label: 'Human figure', description: 'Proportions and gesture' },
    [Subject.Animals]: { label: 'Animals', description: 'Fur, feathers and movement' },
    [Subject.Plants]: { label: 'Plants', description: 'Leaves, flowers and branches' },
  },
  criteria: {
    proportions: 'Proportions',
    composition: 'Composition',
    colorTheory: 'Color theory',
    volume: 'Volume and form',
    lightingShadow: 'Light and shadow',
  },
  setup: {
    step: (n, total) => `Step ${n} of ${total}`,
    progressLabel: 'Setup progress',
    steps: {
      level: { title: 'What is your level?', hint: 'Pick one or let Andy estimate it from one of your artworks.', label: 'Level' },
      medium: { title: 'Which medium will you paint with?', hint: 'The challenge adapts to the materials you have.', label: 'Medium' },
      subject: { title: 'What would you like to paint?', hint: 'Choose the subject of your next challenge.', label: 'Subject' },
    },
    assessPrompt: "Not sure about your level? Upload an artwork and Andy will estimate it",
    assessing: 'Analyzing your artwork…',
    dropHint: 'Drag an image or click',
    assessInputLabel: 'Upload an artwork to estimate your level',
    back: 'Back',
    next: 'Next',
    create: 'Create my challenge',
  },
  challenge: {
    mission: 'Your mission',
    focusTitle: 'Focus areas',
    focusProgress: (done, total) => `Tick them off as you paint · ${done} of ${total}`,
    tipsTitle: 'Tips',
    tip: n => `Tip ${n}`,
    resourcesTitle: 'Learn before you start',
    searchYoutube: 'Search videos on YouTube ↗',
    another: 'Another challenge',
    done: "I'm done! Upload my artwork",
  },
  upload: {
    title: 'Upload your artwork',
    hint: 'A sharp, straight-on photo with good light helps the critique be accurate.',
    notImage: "That file isn't an image. Try JPG, PNG or WEBP.",
    previewAlt: 'Preview of your artwork',
    remove: 'Remove image',
    dropHere: 'Drop it here',
    dropPrompt: 'Drag your photo or click',
    formats: 'JPG, PNG or WEBP · we resize it automatically',
    inputLabel: 'Select the photo of your artwork',
    back: 'Back to the challenge',
    evaluating: 'Evaluating…',
    submit: 'Get feedback',
  },
  evaluation: {
    title: 'Studio critique',
    ratingLabel: n => `Rating: ${n} out of 5`,
    passed: 'Challenge completed!',
    keepGoing: "Keep practicing: you're on the right track!",
    artworkAlt: 'Your artwork',
    retry: 'Try this challenge again',
    viewProgress: 'See my progress',
    newChallenge: 'New challenge',
  },
  progress: {
    title: 'My progress',
    storedLocally: 'Saved only in this browser.',
    loading: 'Loading your progress…',
    emptyTitle: 'No evaluated artworks yet',
    emptyText: 'Finish your first challenge and you will see your gallery, your streak and how you improve in each criterion.',
    start: 'Start a challenge',
    statArtworks: 'Artworks evaluated',
    statStreak: 'Streak (days)',
    statAverage: 'Average rating',
    statPassed: 'Challenges completed',
    chartTitle: 'Rating per artwork',
    chartDescription: 'From oldest to most recent (0–5)',
    chartNeedsMore: 'Evaluate one more artwork to see your progress.',
    chartLabel: n => `Rating over ${n} artworks`,
    tooltipRating: 'Rating:',
    criteriaTitle: 'Average per criterion',
    criteriaDescription: 'Where you are strongest and what to practice',
    gallery: 'Gallery',
    passedBadge: 'Completed',
  },
  loading: {
    challenge: ['Mixing colors…', 'Finding the perfect light…', 'Preparing your canvas…', 'Choosing brushes…'],
    evaluate: ['Looking at your artwork…', 'Measuring proportions…', 'Studying light and shadow…', 'Writing the critique…'],
  },
  toasts: {
    levelEstimated: level => `Andy estimates your level is: ${level}`,
    saved: 'Saved to your progress',
  },
  errors: {
    close: 'Close',
    unexpected: 'Something unexpected went wrong',
    missingChoices: 'Choose a level, medium and subject to continue',
    noChallenge: 'Create a challenge first',
    imageRead: "Couldn't read the image. Try another photo.",
    connection: url =>
      `Couldn't reach the API at ${url}. Check that it is running (open ${url}/health) ` +
      'and that the page is open at http://localhost:5173.',
    assess: 'Error analyzing the image',
    challenge: 'Error creating the challenge',
    evaluate: 'Error evaluating the artwork',
  },
};

export const COPY: Record<Lang, Copy> = { es, en };
