// Profilo dell'utente (dec. 133). Stato solo in memoria: nessun backend è stato scelto (dec. 53).
import { useSyncExternalStore } from 'react';
import { demoUser } from '../data/demo';

export type ProfileState = {
  /** Paese della bandiera, codice ISO a 2 lettere (es. "IT"). Modificabile. */
  country: string;
  bio: string;
  /** Id degli interessi (vedi INTEREST_IDS), al massimo MAX_INTERESTS. */
  interests: string[];
  /** Avatar: non ancora disponibile, li disegneremo noi (dec. 133). */
  avatar: null;
};

export const MAX_INTERESTS = 5;
export const MAX_BIO = 120;

export const INTEREST_IDS = [
  'math', 'science', 'history', 'languages', 'reading', 'writing', 'art', 'music',
  'photo', 'cinema', 'sport', 'games', 'coding', 'theatre', 'travel', 'nature',
] as const;
export type InterestId = (typeof INTEREST_IDS)[number];

/** Codice con # generato in automatico: 4 cifre ricavate dall'account, uguale a ogni apertura. */
export function userTag(seed: string) {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return `#${String(h % 10000).padStart(4, '0')}`;
}

let state: ProfileState = { country: 'IT', bio: '', interests: [], avatar: null };
const listeners = new Set<() => void>();

export function updateProfile(patch: Partial<ProfileState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export function useProfile() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => {
        listeners.delete(l);
      };
    },
    () => state,
    () => state,
  );
}

/** Passi che mancano per completare il profilo: avatar (in arrivo), bio, interessi. */
export function missingSteps(p: ProfileState) {
  return [p.avatar === null, p.bio.trim() === '', p.interests.length === 0].filter(Boolean).length;
}

export const myTag = userTag(demoUser.email);
