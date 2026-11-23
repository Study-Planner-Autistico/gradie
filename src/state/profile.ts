// Profilo dell'utente (dec. 133). Stato solo in memoria: nessun backend è stato scelto (dec. 53).
import { useSyncExternalStore } from 'react';
import type { AvatarConfig } from '../components/avatar/Avatar';
import { demoUser } from '../data/demo';

export type ProfileState = {
  /** Nome e cognome, modificabili da "I miei dati"; l'email no (servirebbe la verifica via posta). */
  firstName: string;
  lastName: string;
  /** Profilo privato (dec. 15): gli altri vedono solo nome e avatar. */
  isPrivate: boolean;
  /** Paese della bandiera, codice ISO a 2 lettere (es. "IT"). Modificabile. */
  country: string;
  bio: string;
  /** Id degli interessi (vedi INTEREST_IDS), al massimo MAX_INTERESTS. */
  interests: string[];
  /** Avatar disegnato con l'editor (dec. 133, 136); null finché non lo crea. */
  avatar: AvatarConfig | null;
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

const initial: ProfileState = { firstName: demoUser.firstName, lastName: demoUser.lastName, isPrivate: false, country: 'IT', bio: '', interests: [], avatar: null };
let state: ProfileState = initial;
const listeners = new Set<() => void>();

export function updateProfile(patch: Partial<ProfileState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export const getProfile = () => state;

/** Torna ai valori iniziali (uscita o eliminazione dell'account). */
export function resetProfile() {
  updateProfile(initial);
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

/** Passi che mancano per completare il profilo: avatar, bio, interessi. */
export function missingSteps(p: ProfileState) {
  return [p.avatar === null, p.bio.trim() === '', p.interests.length === 0].filter(Boolean).length;
}

export const myTag = userTag(demoUser.email);

// shortcut: link con lo schema dell'app (app.json "scheme"); per i link condivisi serve un dominio web, decisione aperta.
export const profileLink = `gradie://u/${myTag.slice(1)}`;
