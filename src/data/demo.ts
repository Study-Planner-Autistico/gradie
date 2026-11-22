// DATI DIMOSTRATIVI — solo per mostrare i componenti. Nessun backend è stato scelto (dec. 53).
import type { TintName } from '../theme';

export const demoUser = { firstName: 'Giulia', lastName: 'Rossi', email: 'giulia.rossi@example.com' };

/** Profilo social (dec. 33): foto, nome, bio, follower/seguiti, interessi, post, salvati. Privato di default (dec. 15). */
export const demoProfile = {
  bio: '',
  following: 29,
  followers: 12,
  posts: 8,
  saved: 5,
  interests: [
    { label: 'Matematica', icon: 'calculator', tint: 'lesson' },
    { label: 'Fotografia', icon: 'camera', tint: 'appointment' },
    { label: 'Lettura', icon: 'book', tint: 'official' },
  ] as { label: string; icon: 'calculator' | 'camera' | 'book'; tint: TintName }[],
  moreInterests: 4,
};

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

// ——— Onboarding (modulo 01). Estratti dimostrativi: l'elenco vero viene da MIM e USTAT (dec. 86). ———

export type DemoInstitution = { id: string; name: string; city: string; kind: 'superiori' | 'universita' };

export const demoInstitutions: DemoInstitution[] = [
  { id: 'i1', name: 'Liceo Scientifico G. Galilei', city: 'Milano (MI)', kind: 'superiori' },
  { id: 'i2', name: 'Liceo Classico Dante Alighieri', city: 'Roma (RM)', kind: 'superiori' },
  { id: 'i3', name: 'IIS Leonardo da Vinci', city: 'Firenze (FI)', kind: 'superiori' },
  { id: 'i4', name: 'ITIS Enrico Fermi', city: 'Napoli (NA)', kind: 'superiori' },
  { id: 'i5', name: 'Liceo Linguistico A. Manzoni', city: 'Torino (TO)', kind: 'superiori' },
  { id: 'i6', name: 'IPSIA Galileo Ferraris', city: 'Palermo (PA)', kind: 'superiori' },
  { id: 'u1', name: 'Università di Bologna', city: 'Bologna (BO)', kind: 'universita' },
  { id: 'u2', name: 'Politecnico di Milano', city: 'Milano (MI)', kind: 'universita' },
  { id: 'u3', name: 'Sapienza Università di Roma', city: 'Roma (RM)', kind: 'universita' },
  { id: 'u4', name: 'Università di Padova', city: 'Padova (PD)', kind: 'universita' },
  { id: 'u5', name: 'Accademia di Belle Arti di Brera', city: 'Milano (MI)', kind: 'universita' },
  { id: 'u6', name: 'Conservatorio G. Verdi', city: 'Torino (TO)', kind: 'universita' },
];

export const demoTracks = ['Liceo scientifico', 'Liceo classico', 'Liceo linguistico', 'Liceo delle scienze umane', 'Liceo artistico', 'Istituto tecnico', 'Istituto professionale'];

export const demoDegreeTypes = ['Laurea triennale', 'Laurea magistrale', 'Ciclo unico', 'Diploma AFAM'];

export const demoSplits = {
  superiori: ['Trimestre', 'Quadrimestre'],
  universita: ['Semestri', 'Annuale'],
};

export const demoSubjects = {
  superiori: ['Italiano', 'Matematica', 'Inglese', 'Storia', 'Filosofia', 'Fisica', 'Scienze', 'Latino', 'Arte', 'Scienze motorie'],
  universita: ['Analisi I', 'Fisica I', 'Programmazione', 'Geometria', 'Inglese B2'],
};

export const demoRecoveryCodes = ['4F7K-92QX', 'M2PD-81ZT', 'R9WC-37HB', 'J6LN-05EV', 'T3YA-64GU', 'B8SK-29MF', 'Q1XE-73DR', 'H5VO-48NC'];

/** Media dal registro voti personale (dec. 26: solo medie, nessuna previsione). */
export const demoGrades = { average: '7,8', count: 14 };

/** Note dimostrative della schermata Attività (dec. 109). */
export type DemoNote = { id: string; title: string; subject: string; edited: string; tint: TintName };

export const demoNotes: DemoNote[] = [
  { id: 'n1', title: 'Derivate e limiti', subject: 'Matematica', edited: 'Oggi, 09:12', tint: 'lesson' },
  { id: 'n2', title: 'La Rivoluzione francese', subject: 'Storia', edited: 'Ieri', tint: 'activity' },
  { id: 'n3', title: 'Moto rettilineo uniforme', subject: 'Fisica', edited: '18 nov', tint: 'official' },
];
