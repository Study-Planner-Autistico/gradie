// Registro voti (dec. 195): voti dimostrativi per materia, in memoria (dec. 53). Le medie si calcolano da qui,
// anche quella della Panoramica in Profilo.
import { locale } from '../i18n';
import { useSubjects } from './subjects';

const DEMO: Record<string, number[]> = {
  Italiano: [8, 8, 7.5],
  Matematica: [8.5, 9, 8],
  Inglese: [8, 8.5],
  Storia: [7.5, 7, 8],
  Filosofia: [7.5, 8],
  Fisica: [7, 7.5, 6.5],
  Scienze: [8.5, 8],
  Latino: [6, 6.5, 5.5],
  Arte: [9, 9.5],
  'Scienze motorie': [9, 8.5],
};

/** Materie senza voti di prova: due o tre voti fissi ricavati dal nome, così non cambiano a ogni apertura. */
function seeded(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const n = 2 + (h % 2);
  return Array.from({ length: n }, (_, i) => 6 + (((h >> (i * 3)) % 7) * 0.5));
}

export const gradesOf = (subject: string) => DEMO[subject] ?? seeded(subject);

export const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

/** Media con una cifra decimale, nel formato della lingua (7,8 in italiano). */
export const formatAvg = (x: number) => x.toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export type SubjectAverage = { subject: string; average: number; count: number };

/** Media di ogni materia e media generale (di tutti i voti). */
export function useGradeBook() {
  const subjects = useSubjects();
  const rows: SubjectAverage[] = subjects.map((s) => {
    const g = gradesOf(s);
    return { subject: s, average: mean(g), count: g.length };
  });
  const all = subjects.flatMap(gradesOf);
  return { rows, average: mean(all), count: all.length };
}
