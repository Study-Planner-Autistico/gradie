// DATI DIMOSTRATIVI — solo per mostrare i componenti. Nessun backend è stato scelto (dec. 53).
import type { TintName } from '../theme';

export const demoUser = { firstName: 'Giulia', lastName: 'Rossi', email: 'giulia.rossi@example.com' };

/** Dispositivi collegati all'account (dec. 56), solo dimostrativi. Il primo è quello in uso. */
export const demoDevices = [
  { id: 'd1', name: 'iPhone 16', kind: 'phone', place: 'Milano', lastSeen: 'now' },
  { id: 'd2', name: 'iPad Air', kind: 'tablet', place: 'Milano', lastSeen: '2026-11-21' },
  { id: 'd3', name: 'Safari su Mac', kind: 'desktop', place: 'Bergamo', lastSeen: '2026-11-15' },
] as const;
export type DemoDevice = (typeof demoDevices)[number];

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
  // L'università viene prima: è l'ambiente di partenza (dec. 196).
  { id: 'env-2', name: 'Università di Bologna', detail: 'Ingegneria Informatica · 1° anno', kind: 'universita' },
  { id: 'env-1', name: 'Liceo Scientifico G. Galilei', detail: '4ª B · Scientifico', kind: 'superiori' },
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
  /** Materia a cui si riferisce: dà il colore nella striscia dei giorni e sul binario (dec. 151). */
  subject?: string;
  /** Giorni dalla data odierna (0 = oggi). */
  dayOffset: number;
};

export const demoAgenda: DemoAgendaItem[] = [
  // Università di Bologna, Ingegneria Informatica (dec. 196).
  { id: 'a1', kind: 'lesson', title: 'Analisi I', subject: 'Analisi I', start: '09:00', end: '11:00', meta: 'Aula 0.4', locked: true, dayOffset: 0 },
  { id: 'a2', kind: 'lesson', title: 'Fisica I', subject: 'Fisica I', start: '11:00', end: '13:00', meta: 'Aula Magna', dayOffset: 0 },
  { id: 'a3', kind: 'official', title: 'Ricevimento di Geometria', start: '14:30', end: '15:00', meta: 'Studio 3.12', dayOffset: 0 },
  { id: 'a9', kind: 'activity', title: 'Esercizi di Fisica I, foglio 3', subject: 'Fisica I', meta: 'Compito', dayOffset: 0 },
  { id: 'a4', kind: 'appointment', title: 'Allenamento pallavolo', start: '17:30', end: '19:00', dayOffset: 0 },
  { id: 'a5', kind: 'activity', title: 'Prova parziale di Geometria', subject: 'Geometria', meta: 'Esame', dayOffset: 1 },
  { id: 'a6', kind: 'lesson', title: 'Programmazione', subject: 'Programmazione', start: '09:00', end: '12:00', meta: 'Lab. 2', locked: true, dayOffset: 1 },
  { id: 'a7', kind: 'activity', title: 'Esercizi di Analisi I, cap. 4', subject: 'Analisi I', meta: 'Compito', dayOffset: 2 },
  { id: 'a10', kind: 'activity', title: 'Progetto di Programmazione', subject: 'Programmazione', meta: 'Consegna', dayOffset: 5 },
  { id: 'a8', kind: 'holiday', title: 'Ponte dell’Immacolata', meta: 'Chiusura ateneo', dayOffset: 4 },
];

/** Classe (superiori) o corso (università) dell'ambiente, per il riquadro in fondo alla Home (dec. 124). */
export type DemoTeacher = { id: string; name: string; initials: string; color: string };
export type DemoClass = {
  id: string;
  name: string;
  detail: string;
  students: number;
  teachers: number;
  news: number;
  members: string[];
  /** Docente della classe, mostrato nella pagina della classe con una cornice diversa (dec. 226). */
  teacher: DemoTeacher;
};

export const demoClasses: Record<string, DemoClass> = {
  'env-1': {
    id: 'c-4b', name: '4ª B', detail: 'Liceo Scientifico G. Galilei', students: 24, teachers: 9, news: 2, members: ['MR', 'LB', 'AF', 'GC', 'SP', 'EV', 'TM', 'NC'],
    teacher: { id: 't1', name: 'Prof.ssa Bianchi', initials: 'EB', color: '#5D55D7' },
  },
  'env-2': {
    id: 'c-ing1', name: 'Ingegneria Informatica', detail: 'Università di Bologna · 1° anno', students: 186, teachers: 14, news: 1, members: ['DG', 'FR', 'CL', 'MB', 'AV', 'PS', 'IR', 'GT'],
    teacher: { id: 't2', name: 'Prof. Rossi', initials: 'GR', color: '#5D55D7' },
  },
};

/** Documenti condivisi nella classe da compagni e docente (dec. 226), ognuno in una materia (dec. 227). `by` = id di un amico o del docente. */
export type DemoClassDoc = { id: string; name: string; by: string; daysAgo: number; subject: string };
export const demoClassDocs: Record<string, DemoClassDoc[]> = {
  'c-4b': [
    { id: 'd1', name: 'Programma di Fisica.pdf', by: 't1', daysAgo: 6, subject: 'Fisica' },
    { id: 'd2', name: 'Appunti Promessi Sposi cap. 8.docx', by: 'f2', daysAgo: 2, subject: 'Italiano' },
    { id: 'd3', name: 'Ricerca di Storia - gruppo 3.pptx', by: 'f1', daysAgo: 1, subject: 'Storia' },
  ],
  'c-ing1': [
    { id: 'd1', name: 'Regole del progetto.pdf', by: 't2', daysAgo: 8, subject: 'Programmazione' },
    { id: 'd2', name: 'Esercizi svolti di Analisi I.pdf', by: 'f3', daysAgo: 3, subject: 'Analisi I' },
    { id: 'd3', name: 'Schema di Fisica I.docx', by: 'f2', daysAgo: 1, subject: 'Fisica I' },
  ],
};

/** Lavori da consegnare al docente (dec. 226). `dueOffset` = giorni da oggi (negativo = scaduto). */
export type DemoAssignment = { id: string; title: string; detail: string; dueOffset: number; subject: string };
export const demoAssignments: Record<string, DemoAssignment[]> = {
  'c-4b': [
    { id: 'w1', title: 'Relazione di laboratorio', detail: 'Esperienza sul moto rettilineo, massimo 3 pagine.', dueOffset: 3, subject: 'Fisica' },
    { id: 'w2', title: 'Tema di Italiano', detail: 'Traccia B: analisi di un testo argomentativo.', dueOffset: 6, subject: 'Italiano' },
  ],
  'c-ing1': [
    { id: 'w1', title: 'Progetto di Programmazione', detail: 'Codice e relazione in un unico PDF.', dueOffset: 5, subject: 'Programmazione' },
    { id: 'w2', title: 'Esercitazione 3 di Geometria', detail: 'Esercizi 1-8 del foglio 3.', dueOffset: 2, subject: 'Geometria' },
  ],
};

/** Chat di gruppo di una materia della classe (dec. 227), chiave `classe/materia`. `minutesAgo` = minuti fa. */
export type DemoClassMessage = { id: string; from: string; text: string; minutesAgo: number };
export const demoClassChat: Record<string, DemoClassMessage[]> = {
  'c-ing1/Programmazione': [
    { id: 'm1', from: 't2', text: 'Ho caricato le regole del progetto: leggetele prima di venerdì.', minutesAgo: 60 * 26 },
    { id: 'm2', from: 'f1', text: 'Si può fare in coppia?', minutesAgo: 60 * 25 },
    { id: 'm3', from: 't2', text: 'Sì, massimo due persone per gruppo.', minutesAgo: 60 * 24 },
    { id: 'm4', from: 'f3', text: 'Chi è senza gruppo? Io ci sono 🙋', minutesAgo: 35 },
  ],
  'c-ing1/Analisi I': [
    { id: 'm1', from: 'f3', text: 'Ho messo gli esercizi svolti del capitolo 4.', minutesAgo: 60 * 3 },
    { id: 'm2', from: 'f2', text: 'Grazie! Il 7 non mi tornava proprio.', minutesAgo: 60 * 2 },
  ],
  'c-4b/Fisica': [
    { id: 'm1', from: 't1', text: 'Per la relazione basta una foto chiara dei grafici.', minutesAgo: 60 * 5 },
    { id: 'm2', from: 'f4', text: 'Va bene anche scritta a mano?', minutesAgo: 60 * 4 },
  ],
};

/** Profilo (dec. 133): iscrizione, amici (con iniziali finché non ci sono gli avatar). */
export const demoMe = { joinedYear: 2026, following: 29, followers: 12 };
export const demoFriends = [
  { id: 'f1', name: 'Marco', initials: 'MR', color: '#2F5DA8' },
  { id: 'f2', name: 'Sofia', initials: 'SP', color: '#B23A48' },
  { id: 'f3', name: 'Luca', initials: 'LB', color: '#2E6B4F' },
  { id: 'f4', name: 'Chiara', initials: 'CF', color: '#C77A2E' },
];

/** Paesi per la bandiera del profilo (codice ISO, nome IT/EN). */
export const demoCountries: { code: string; it: string; en: string }[] = [
  { code: 'IT', it: 'Italia', en: 'Italy' },
  { code: 'AL', it: 'Albania', en: 'Albania' },
  { code: 'RO', it: 'Romania', en: 'Romania' },
  { code: 'MA', it: 'Marocco', en: 'Morocco' },
  { code: 'UA', it: 'Ucraina', en: 'Ukraine' },
  { code: 'CN', it: 'Cina', en: 'China' },
  { code: 'IN', it: 'India', en: 'India' },
  { code: 'PH', it: 'Filippine', en: 'Philippines' },
  { code: 'EG', it: 'Egitto', en: 'Egypt' },
  { code: 'BD', it: 'Bangladesh', en: 'Bangladesh' },
  { code: 'PK', it: 'Pakistan', en: 'Pakistan' },
  { code: 'TN', it: 'Tunisia', en: 'Tunisia' },
  { code: 'SN', it: 'Senegal', en: 'Senegal' },
  { code: 'NG', it: 'Nigeria', en: 'Nigeria' },
  { code: 'PE', it: 'Perù', en: 'Peru' },
  { code: 'EC', it: 'Ecuador', en: 'Ecuador' },
  { code: 'BR', it: 'Brasile', en: 'Brazil' },
  { code: 'ES', it: 'Spagna', en: 'Spain' },
  { code: 'FR', it: 'Francia', en: 'France' },
  { code: 'DE', it: 'Germania', en: 'Germany' },
  { code: 'GB', it: 'Regno Unito', en: 'United Kingdom' },
  { code: 'US', it: 'Stati Uniti', en: 'United States' },
  { code: 'MD', it: 'Moldavia', en: 'Moldova' },
  { code: 'PL', it: 'Polonia', en: 'Poland' },
  { code: 'CH', it: 'Svizzera', en: 'Switzerland' },
  { code: 'SM', it: 'San Marino', en: 'San Marino' },
];

/** Emoji della bandiera da un codice ISO a 2 lettere. */
export const flagEmoji = (code: string) => String.fromCodePoint(...[...code.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));

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

/** Chiave dimostrativa per l'app di autenticazione (TOTP, base32). */
export const demoTotpSecret = 'JBSWY3DPEHPK3PXP';
export const demoRecoveryCodes = ['4F7K-92QX', 'M2PD-81ZT', 'R9WC-37HB', 'J6LN-05EV', 'T3YA-64GU', 'B8SK-29MF', 'Q1XE-73DR', 'H5VO-48NC'];

/** Media dal registro voti personale (dec. 26: solo medie, nessuna previsione). */
export const demoGrades = { average: '7,8', count: 14 };

/** Note dimostrative della schermata Attività (dec. 109). */
export type DemoNote = { id: string; title: string; subject: string; edited: string; tint: TintName; cover?: string | null };

export const demoNotes: DemoNote[] = [
  { id: 'n1', title: 'Derivate e limiti', subject: 'Analisi I', edited: 'Oggi, 09:12', tint: 'lesson', cover: '#2F5DA8' },
  { id: 'n2', title: 'Puntatori e memoria', subject: 'Programmazione', edited: 'Ieri', tint: 'activity', cover: '#B23A48' },
  { id: 'n3', title: 'Moto rettilineo uniforme', subject: 'Fisica I', edited: '18 nov', tint: 'official', cover: '#2E6B4F' },
  { id: 'n4', title: 'Vettori e forze', subject: 'Fisica I', edited: '15 nov', tint: 'official', cover: '#C77A2E' },
  { id: 'n5', title: 'Funzioni esponenziali', subject: 'Analisi I', edited: '12 nov', tint: 'lesson', cover: '#5B4B9A' },
];
