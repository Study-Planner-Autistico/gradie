// Registro voti (dec. 195-196): voti in trentesimi, come all'università (da 18 a 30, con la lode). In memoria
// (dec. 53). Ogni voto inserito dà monete: più è alto, più monete (dec. 196). Le medie si calcolano da qui,
// anche quella della Panoramica in Profilo.
import { useSyncExternalStore } from 'react';
import { locale } from '../i18n';
import { useSubjects } from './subjects';

export const MIN_GRADE = 18;
export const MAX_GRADE = 30;

export type GradeKind = 'exam' | 'partial';
export type Grade = { id: string; subject: string; value: number; lode?: boolean; kind: GradeKind; date: string };

const day = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() - offset);
  return d.toISOString().slice(0, 10);
};

let counter = 0;
const g = (subject: string, value: number, kind: GradeKind, ago: number, lode?: boolean): Grade => ({
  id: `g${++counter}`,
  subject,
  value,
  kind,
  date: day(ago),
  ...(lode ? { lode } : {}),
});

let grades: Grade[] = [
  g('Analisi I', 28, 'partial', 12),
  g('Programmazione', 29, 'partial', 8),
  g('Geometria', 25, 'partial', 15),
  g('Analisi I', 26, 'partial', 40),
  g('Fisica I', 24, 'partial', 30),
  g('Programmazione', 30, 'partial', 50, true),
  g('Geometria', 23, 'partial', 35),
  g('Inglese B2', 28, 'exam', 60),
];

const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const useGrades = () =>
  useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => grades,
  );

export function addGrade(x: Omit<Grade, 'id'>): Grade {
  const grade = { ...x, id: `g${Date.now().toString(36)}-${++counter}` };
  grades = [grade, ...grades];
  emit();
  return grade;
}

export function removeGrade(id: string) {
  grades = grades.filter((x) => x.id !== id);
  emit();
}

/** Monete per un voto: 18 → 1, ogni punto in più 2 monete (30 → 25), la lode altre 10. */
export const coinsFor = (value: number, lode?: boolean) => Math.max(0, 1 + (value - MIN_GRADE) * 2) + (lode ? 10 : 0);

/** La lode conta 30 nella media. */
export const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

/** Media con una cifra decimale, nel formato della lingua (27,4 in italiano). */
export const formatAvg = (x: number) => x.toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** Voto come si scrive: "28", "30 e lode". */
export const formatGrade = (x: Pick<Grade, 'value' | 'lode'>, lodeLabel: string) => (x.lode ? `${x.value} ${lodeLabel}` : `${x.value}`);

export type SubjectAverage = { subject: string; average: number; count: number };

/** Media di ogni materia (0 se non ha ancora voti) e media generale di tutti i voti delle materie attuali. */
export function useGradeBook() {
  const subjects = useSubjects();
  const all = useGrades();
  const rows: SubjectAverage[] = subjects.map((s) => {
    const v = all.filter((x) => x.subject === s).map((x) => x.value);
    return { subject: s, average: mean(v), count: v.length };
  });
  const inBook = all.filter((x) => subjects.includes(x.subject));
  return { rows, all: inBook, average: mean(inBook.map((x) => x.value)), count: inBook.length };
}
