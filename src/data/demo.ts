// DATI DIMOSTRATIVI — solo per mostrare i componenti. Nessun backend è stato scelto (dec. 53).
export const demoUser = { firstName: 'Giulia', lastName: 'Rossi' };

export type DemoLesson = {
  id: string;
  subject: string;
  start: string;
  end: string;
  note?: string;
  teacher?: string;
  status: 'upcoming' | 'attended' | 'missed';
};

export const demoLessons: DemoLesson[] = [
  { id: '1', subject: 'Matematica', start: '08:00', end: '09:00', note: 'Compito: esercizi pag. 112', teacher: 'Prof. Bianchi', status: 'attended' },
  { id: '2', subject: 'Storia', start: '09:00', end: '10:00', status: 'missed' },
  { id: '3', subject: 'Inglese', start: '10:15', end: '11:15', teacher: 'Prof.ssa Verdi', status: 'upcoming' },
];
