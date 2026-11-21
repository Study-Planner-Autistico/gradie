// DATI DIMOSTRATIVI — solo per mostrare i componenti. Nessun backend è stato scelto (dec. 53).
import type { TintName } from '../theme';

export const demoUser = { firstName: 'Giulia', lastName: 'Rossi', email: 'giulia.rossi@example.com' };

export type DemoEnvironment = { id: string; name: string; detail: string; kind: 'superiori' | 'universita' };

/** Ambienti = istituti (dec. 62). */
export const demoEnvironments: DemoEnvironment[] = [
  { id: 'env-1', name: 'Liceo Scientifico G. Galilei', detail: '4ª B · Scientifico', kind: 'superiori' },
  { id: 'env-2', name: 'Università di Bologna', detail: 'Ingegneria Informatica · 1° anno', kind: 'universita' },
];

export type DemoAgendaItem = {
  id: string;
  kind: TintName;
  title: string;
  start?: string;
  end?: string;
  meta?: string;
  /** Lezione dell'orario del docente: non modificabile (dec. 102). */
  locked?: boolean;
  /** Giorni dalla data odierna (0 = oggi). */
  dayOffset: number;
};

export const demoAgenda: DemoAgendaItem[] = [
  { id: 'a1', kind: 'lesson', title: 'Matematica', start: '08:00', end: '09:00', meta: 'Aula 12', locked: true, dayOffset: 0 },
  { id: 'a2', kind: 'lesson', title: 'Fisica', start: '09:00', end: '10:00', meta: 'Lab. 2', dayOffset: 0 },
  { id: 'a3', kind: 'official', title: 'Assemblea di classe', start: '11:15', end: '12:00', dayOffset: 0 },
  { id: 'a4', kind: 'appointment', title: 'Allenamento pallavolo', start: '17:30', end: '19:00', dayOffset: 0 },
  { id: 'a5', kind: 'activity', title: 'Verifica di Storia', meta: 'Verifica', dayOffset: 1 },
  { id: 'a6', kind: 'lesson', title: 'Inglese', start: '08:00', end: '10:00', meta: 'Aula 12', locked: true, dayOffset: 1 },
  { id: 'a7', kind: 'activity', title: 'Esercizi pag. 112', meta: 'Compito', dayOffset: 2 },
  { id: 'a8', kind: 'holiday', title: 'Ponte dell’Immacolata', meta: 'Chiusura istituto', dayOffset: 4 },
];

/** Media dal registro voti personale (dec. 26: solo medie, nessuna previsione). */
export const demoGrades = { average: '7,8', count: 14 };
