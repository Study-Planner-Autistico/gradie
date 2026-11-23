// Materie degli appunti, una per quaderno (dec. 141-143). Stato solo in memoria: nessun backend è stato scelto (dec. 53).
import { useSyncExternalStore } from 'react';
import { demoSubjects } from '../data/demo';
import { covers } from '../theme';

// Si parte dalle materie dell'onboarding; finché l'onboarding è disattivato (dec. 130) quelle predefinite delle superiori.
let subjects: string[] = [...demoSubjects.superiori];
/** Colore della copertina del quaderno, per materia (chiave in minuscolo). */
let colors: Record<string, string> = {};
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
  if (colors[key(from)] && key(from) !== key(v)) {
    const { [key(from)]: c, ...rest } = colors;
    colors = { ...rest, [key(v)]: c };
  }
  emit();
  return true;
}

/** Toglie una materia, insieme al suo quaderno (dec. 142). */
export function removeSubject(name: string) {
  subjects = subjects.filter((s) => !same(s, name));
  const { [key(name)]: _, ...rest } = colors;
  colors = rest;
  emit();
}

/** Cambia il colore della copertina del quaderno (dec. 143). */
export function setSubjectColor(name: string, color: string) {
  colors = { ...colors, [key(name)]: color };
  emit();
}

/** Colore del quaderno: quello scelto o, se non c'è, uno della tavolozza in base alla posizione. */
export function subjectColor(all: Record<string, string>, name: string, index: number) {
  return all[key(name)] ?? covers[Math.max(0, index) % covers.length].color;
}

export function useSubjects() {
  return useSyncExternalStore(subscribe, () => subjects, () => subjects);
}

export function useSubjectColors() {
  return useSyncExternalStore(subscribe, () => colors, () => colors);
}
