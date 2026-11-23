// Materie degli appunti, una per quaderno (dec. 141-143). Stato solo in memoria: nessun backend è stato scelto (dec. 53).
import { useSyncExternalStore } from 'react';
import { demoSubjects } from '../data/demo';
import { COVER_COLORS, COVER_THEMES, type CoverColor, type CoverTheme } from '../components/coverArt';

// Si parte dalle materie dell'onboarding; finché l'onboarding è disattivato (dec. 130) quelle predefinite delle superiori.
let subjects: string[] = [...demoSubjects.superiori];
/** Copertina del quaderno: tema (fantasia) e colore (dec. 144). */
export type NotebookLook = { theme: CoverTheme; color: CoverColor };
/** Copertine scelte, per materia (chiave in minuscolo). */
let looks: Record<string, NotebookLook> = {};
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

const key = (s: string) => s.trim().toLocaleLowerCase();
const same = (a: string, b: string) => key(a) === key(b);

/** Materie scelte nell'onboarding: sostituiscono quelle predefinite. */
export function setSubjects(list: string[]) {
  if (!list.length) return;
  subjects = list.filter((s, i) => list.findIndex((x) => same(x, s)) === i);
  emit();
}

/** Aggiunge una materia nuova; restituisce false se il nome è vuoto o c'è già. */
export function addSubject(name: string) {
  const v = name.trim();
  if (!v || subjects.some((s) => same(s, v))) return false;
  subjects = [...subjects, v];
  emit();
  return true;
}

/** Rinomina una materia (dec. 142); restituisce false se il nome è vuoto o è già di un'altra materia. */
export function renameSubject(from: string, to: string) {
  const v = to.trim();
  const i = subjects.findIndex((s) => same(s, from));
  if (!v || subjects.some((s, j) => j !== i && same(s, v))) return false;
  subjects = i < 0 ? [...subjects, v] : subjects.map((s, j) => (j === i ? v : s));
  if (looks[key(from)] && key(from) !== key(v)) {
    const { [key(from)]: c, ...rest } = looks;
    looks = { ...rest, [key(v)]: c };
  }
  emit();
  return true;
}

/** Toglie una materia, insieme al suo quaderno (dec. 142). */
export function removeSubject(name: string) {
  subjects = subjects.filter((s) => !same(s, name));
  const { [key(name)]: _, ...rest } = looks;
  looks = rest;
  emit();
}

/** Cambia tema e colore della copertina del quaderno (dec. 143-144). */
export function setSubjectLook(name: string, look: NotebookLook) {
  looks = { ...looks, [key(name)]: look };
  emit();
}

/** Copertina del quaderno: quella scelta o, se non c'è, una diversa per posizione (temi e colori a rotazione). */
export function subjectLook(all: Record<string, NotebookLook>, name: string, index: number): NotebookLook {
  const i = Math.max(0, index);
  return all[key(name)] ?? { theme: COVER_THEMES[i % COVER_THEMES.length], color: COVER_COLORS[(i * 3) % COVER_COLORS.length] };
}

export function useSubjects() {
  return useSyncExternalStore(subscribe, () => subjects, () => subjects);
}

export function useSubjectLooks() {
  return useSyncExternalStore(subscribe, () => looks, () => looks);
}
