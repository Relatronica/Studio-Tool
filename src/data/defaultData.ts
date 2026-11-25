import { Exam, PlannerSettings } from '../types';
import { addDays, getTodayISO } from '../utils/dateUtils';

export function getDefaultSettings(): PlannerSettings {
  return {
    weeklyAvailability: {
      1: 4, // Lunedì
      2: 4, // Martedì
      3: 3.5, // Mercoledì
      4: 4, // Giovedì
      5: 3.5, // Venerdì
      6: 2.5, // Sabato
      0: 0, // Domenica
    },
    blockedDates: [],
    maxBlockHours: 2,
  };
}

export function getDefaultExams(): Exam[] {
  const today = getTodayISO();
  return [
    {
      id: 'exam-privato',
      name: 'Diritto Privato',
      emoji: '⚖️',
      examDate: addDays(today, 18),
      color: 'blue',
      reviewDays: 3,
      priority: 'high',
      notes: 'Focus su obbligazioni, contratti e responsabilità civile.',
      books: [
        {
          id: 'book-torrente',
          title: 'Manuale Torrente',
          totalPages: 320,
          completedPages: 95,
          pagesPerHour: 14,
        },
        {
          id: 'book-codice',
          title: 'Casi e Giurisprudenza',
          totalPages: 90,
          completedPages: 20,
          pagesPerHour: 12,
        },
      ],
    },
    {
      id: 'exam-analisi',
      name: 'Analisi Matematica II',
      emoji: '📐',
      examDate: addDays(today, 27),
      color: 'purple',
      reviewDays: 4,
      priority: 'medium',
      notes: 'Esercizi su integrali multipli ed equazioni differenziali.',
      books: [
        {
          id: 'book-bramanti',
          title: 'Bramanti-Pagani-Salsa',
          totalPages: 240,
          completedPages: 60,
          pagesPerHour: 8,
        },
      ],
    },
    {
      id: 'exam-economia',
      name: 'Economia Politica',
      emoji: '📊',
      examDate: addDays(today, 35),
      color: 'teal',
      reviewDays: 3,
      priority: 'low',
      notes: 'Ripassare i grafici IS-LM e mercato del lavoro.',
      books: [
        {
          id: 'book-blanchard',
          title: 'Macroeconomia (Blanchard)',
          totalPages: 210,
          completedPages: 40,
          pagesPerHour: 15,
        },
      ],
    },
  ];
}

