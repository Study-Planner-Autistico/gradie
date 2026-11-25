// Monete di Gradie (dec. 193): il saldo che si vede in Profilo, accanto alle impostazioni.
// Per ora solo un numero in memoria (dec. 53); come si guadagnano e a cosa servono è da decidere.
import { useSyncExternalStore } from 'react';

let coins = 120;
const listeners = new Set<() => void>();

export const useCoins = () =>
  useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => coins,
  );

export function addCoins(n: number) {
  coins = Math.max(0, coins + n);
  listeners.forEach((l) => l());
}
