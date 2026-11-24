// Menu laterale della Home (dec. 124–126): stato condiviso con la tab bar: quella nativa si nasconde, quella del web si sposta e si scurisce con la Home.
import { useSyncExternalStore } from 'react';
import { Animated } from 'react-native';

/** Avanzamento del menu: 0 chiuso, 1 aperto. Segue anche il dito durante lo scorrimento. */
export const menuProgress = new Animated.Value(0);

/** Larghezza del menu: la Home si sposta a destra di questa misura. */
export const drawerWidth = (screenWidth: number) => Math.min(330, Math.round(screenWidth * 0.82));

let open = false;
const listeners = new Set<() => void>();

export function setMenuOpen(v: boolean) {
  if (v === open) return;
  open = v;
  listeners.forEach((l) => l());
}

/** Lettura senza iscriversi, per i gesti (TabSwipe non deve cambiare scheda mentre il menu è aperto). */
export const isMenuOpen = () => open;

export function useMenuOpen() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => {
        listeners.delete(l);
      };
    },
    () => open,
    () => open,
  );
}
