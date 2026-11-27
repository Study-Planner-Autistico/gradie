// Corsi della classe (dec. 228): quelli a cui sei iscritto e quelli che hai creato tu. Ci si iscrive solo con il
// codice del corso (6 lettere o cifre) o con il suo link. Stato solo in memoria: nessun backend (dec. 53), quindi
// con il codice si trovano solo i corsi dimostrativi e quelli creati su questo telefono.
import { useSyncExternalStore } from 'react';
import { demoCourses, type DemoCourse } from '../data/demo';
import type { NotebookLook } from './subjects';

export type Course = Omit<DemoCourse, 'enrolled' | 'teacher'> & {
  /** Docente del corso; manca nei corsi che hai creato tu. */
  teacher?: DemoCourse['teacher'];
  /** Il corso l'hai creato tu. */
  owner?: boolean;
};

export const CODE_LENGTH = 6;
const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const strip = ({ enrolled: _, ...c }: DemoCourse): Course => c;
let courses: Course[] = demoCourses.filter((c) => c.enrolled).map(strip);
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

/** Tutti i corsi a cui sei iscritto, in ogni classe. */
export const useCourses = () => useSyncExternalStore(subscribe, () => courses);

/** Link d'invito: aprendolo ci si iscrive al corso. */
export const courseLink = (code: string) => `gradie://corso/${code}`;

/** Il codice da quello che si scrive o si incolla: "ab1 x7q", "AN1X7Q" o il link del corso. */
export function normalizeCode(input: string) {
  const fromLink = input.split('/corso/')[1] ?? input;
  return fromLink
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, CODE_LENGTH);
}
export const isValidCode = (code: string) => new RegExp(`^[A-Z0-9]{${CODE_LENGTH}}$`).test(code);

/** Cerca un corso per codice: fra i tuoi e fra quelli dimostrativi. */
export function findCourse(code: string): { course: Course; joined: boolean } | undefined {
  const mine = courses.find((c) => c.code === code);
  if (mine) return { course: mine, joined: true };
  const demo = demoCourses.find((c) => c.code === code);
  return demo ? { course: strip(demo), joined: false } : undefined;
}

/** Ti iscrive al corso con quel codice; restituisce il corso, o undefined se il codice non esiste. */
export function joinCourse(code: string) {
  const found = findCourse(code);
  if (!found) return undefined;
  if (!found.joined) {
    courses = [...courses, found.course];
    emit();
  }
  return found.course;
}

function newCode() {
  const all = new Set([...courses, ...demoCourses].map((c) => c.code));
  let code = '';
  do {
    code = Array.from({ length: CODE_LENGTH }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('');
  } while (all.has(code));
  return code;
}

/** Crea un corso nella classe, con un codice nuovo per invitare gli altri. */
export function createCourse(classId: string, name: string, look: NotebookLook) {
  const course: Course = { code: newCode(), classId, name: name.trim(), look, owner: true };
  courses = [...courses, course];
  emit();
  return course;
}

/** Esci dal corso (o eliminalo, se l'hai creato tu). */
export function leaveCourse(code: string) {
  courses = courses.filter((c) => c.code !== code);
  emit();
}
