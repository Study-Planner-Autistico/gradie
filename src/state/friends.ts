// Amici (dec. 183, 187): chi hai smesso di seguire e chi hai bloccato, le richieste d'amicizia ricevute e inviate,
// gli amici aggiunti col codice o col QR. Stato solo in memoria: nessun backend (dec. 53).
import { useSyncExternalStore } from 'react';
import { demoFriends } from '../data/demo';
import { myTag } from './profile';

export type Person = { id: string; name: string; initials: string; color: string; code: string };

// Utenti di esempio con il loro codice (le 4 cifre dopo #, come in Profilo > QR).
const people: Person[] = [
  ...demoFriends.map((f, i) => ({ ...f, code: ['1024', '2718', '3141', '4669'][i] ?? `50${i}0` })),
  { id: 'p1', name: 'Giulia', initials: 'GM', color: '#7A4FB5', code: '5821' },
  { id: 'p2', name: 'Matteo', initials: 'MC', color: '#1F7A8C', code: '6034' },
  { id: 'p3', name: 'Elena', initials: 'ER', color: '#A33B6B', code: '7177' },
  { id: 'p4', name: 'Davide', initials: 'DS', color: '#5B6B2E', code: '8250' },
  { id: 'p5', name: 'Aurora', initials: 'AL', color: '#B5602E', code: '9312' },
];

type FriendsState = {
  unfollowed: string[];
  blocked: string[];
  /** Amici aggiunti dopo una richiesta accettata. */
  added: string[];
  /** Richieste ricevute, da accettare o rifiutare. */
  incoming: string[];
  /** Richieste inviate, in attesa di risposta. */
  outgoing: string[];
};

let state: FriendsState = { unfollowed: [], blocked: [], added: [], incoming: ['p1', 'p2'], outgoing: [] };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function useFriends() {
  return useSyncExternalStore(subscribe, () => state);
}

export const findPerson = (id: string) => people.find((p) => p.id === id);
const byIds = (ids: string[]) => ids.map(findPerson).filter((p): p is Person => !!p);

/** Tutti gli amici, senza i bloccati: quelli di partenza e quelli aggiunti. */
export function friendsOf(s: FriendsState) {
  return byIds([...demoFriends.map((f) => f.id), ...s.added]).filter((p) => !s.blocked.includes(p.id));
}
export const incomingOf = (s: FriendsState) => byIds(s.incoming);
export const outgoingOf = (s: FriendsState) => byIds(s.outgoing);

/** Segui di nuovo (true) o smetti di seguire (false). */
export function setFollowing(id: string, on: boolean) {
  const rest = state.unfollowed.filter((x) => x !== id);
  state = { ...state, unfollowed: on ? rest : [...rest, id] };
  emit();
}

/** Blocca: sparisce dagli amici e non può più scriverti. */
export function blockFriend(id: string) {
  if (state.blocked.includes(id)) return;
  state = { ...state, blocked: [...state.blocked, id] };
  emit();
}

export type RequestResult =
  | { kind: 'sent' | 'accepted' | 'already' | 'pending'; person: Person }
  | { kind: 'self' | 'notFound' | 'invalid' };

/** Le 4 cifre del codice da quello che si scrive ("#5821", "5821") o dal QR ("gradie://u/5821"). */
export function parseCode(raw: string) {
  const m = raw.trim().match(/^(?:gradie:\/\/u\/|#)?(\d{4})$/);
  return m ? m[1] : null;
}

/**
 * Manda la richiesta d'amicizia a chi ha questo codice (dec. 187). Se quella persona ti aveva già
 * mandato una richiesta, diventate subito amici.
 */
export function sendRequest(raw: string): RequestResult {
  const code = parseCode(raw);
  if (!code) return { kind: 'invalid' };
  if (`#${code}` === myTag) return { kind: 'self' };
  const person = people.find((p) => p.code === code);
  if (!person) return { kind: 'notFound' };
  if (friendsOf(state).some((p) => p.id === person.id)) return { kind: 'already', person };
  if (state.outgoing.includes(person.id)) return { kind: 'pending', person };
  if (state.incoming.includes(person.id)) {
    acceptRequest(person.id);
    return { kind: 'accepted', person };
  }
  state = { ...state, outgoing: [...state.outgoing, person.id], blocked: state.blocked.filter((x) => x !== person.id) };
  emit();
  return { kind: 'sent', person };
}

export function acceptRequest(id: string) {
  state = { ...state, incoming: state.incoming.filter((x) => x !== id), added: state.added.includes(id) ? state.added : [...state.added, id] };
  emit();
}
export function declineRequest(id: string) {
  state = { ...state, incoming: state.incoming.filter((x) => x !== id) };
  emit();
}
export function cancelRequest(id: string) {
  state = { ...state, outgoing: state.outgoing.filter((x) => x !== id) };
  emit();
}
