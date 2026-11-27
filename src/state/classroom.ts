// Classe (dec. 226): documenti caricati da te e lavori consegnati al docente, per ogni classe.
// Stato solo in memoria e file nella cache dell'app: nessun backend (dec. 53).
import { useSyncExternalStore } from 'react';

export type ClassFile = { id: string; name: string; uri: string; at: number };

type ClassroomState = {
  /** Documenti che hai caricato, per classe. */
  docs: Record<string, ClassFile[]>;
  /** Lavori consegnati, per classe e per consegna. */
  submissions: Record<string, Record<string, ClassFile>>;
};

let state: ClassroomState = { docs: {}, submissions: {} };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function useClassroom() {
  return useSyncExternalStore(subscribe, () => state);
}

const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export function addClassDoc(classId: string, file: { name: string; uri: string }) {
  const doc: ClassFile = { id: newId(), name: file.name, uri: file.uri, at: Date.now() };
  state = { ...state, docs: { ...state.docs, [classId]: [doc, ...(state.docs[classId] ?? [])] } };
  emit();
}

export function removeClassDoc(classId: string, id: string) {
  state = { ...state, docs: { ...state.docs, [classId]: (state.docs[classId] ?? []).filter((d) => d.id !== id) } };
  emit();
}

export function submitWork(classId: string, assignmentId: string, file: { name: string; uri: string }) {
  const sub: ClassFile = { id: newId(), name: file.name, uri: file.uri, at: Date.now() };
  state = { ...state, submissions: { ...state.submissions, [classId]: { ...state.submissions[classId], [assignmentId]: sub } } };
  emit();
}

export function unsubmitWork(classId: string, assignmentId: string) {
  const { [assignmentId]: _, ...rest } = state.submissions[classId] ?? {};
  state = { ...state, submissions: { ...state.submissions, [classId]: rest } };
  emit();
}
