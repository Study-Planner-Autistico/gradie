// Amici (dec. 183): chi hai smesso di seguire e chi hai bloccato. Stato solo in memoria: nessun backend (dec. 53).
import { useSyncExternalStore } from 'react';

type FriendsState = { unfollowed: string[]; blocked: string[] };

let state: FriendsState = { unfollowed: [], blocked: [] };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function useFriends() {
  return useSyncExternalStore(subscribe, () => state);
}

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
