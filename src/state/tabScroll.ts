// Scorrimento di ogni scheda della barra (dec. 140): la pagina vera lo registra, e la copia che spunta dal lato
// durante il cambio scheda parte dallo stesso punto, così tornando non si vede prima la cima e poi il salto.
import { createContext, useContext, useMemo } from 'react';

const offsets: Record<string, number> = {};

/** In quale scheda si trova lo scorrimento, e se è la copia mostrata durante il trascinamento. */
export const TabScrollContext = createContext<{ tab: string; peek: boolean } | null>(null);

/** Props per lo ScrollView principale di una schermata: fuori dalle schede non fa nulla. */
export function useTabScroll() {
  const ctx = useContext(TabScrollContext);
  return useMemo(() => {
    const y = ctx ? (offsets[ctx.tab] ?? 0) : 0;
    return {
      /** Solo per la copia: parte dallo scorrimento della pagina vera (iOS/Android subito, al primo frame). */
      contentOffset: ctx?.peek ? { x: 0, y } : undefined,
      /** Stessa cosa per il web, dove contentOffset non c'è: scorre appena lo ScrollView è montato. */
      ref: (node: { scrollTo?: (o: { y: number; animated: boolean }) => void } | null) => {
        if (node && ctx?.peek && y > 0) requestAnimationFrame(() => node.scrollTo?.({ y, animated: false }));
      },
      initialY: ctx?.peek ? y : 0,
      record: (value: number) => {
        if (ctx && !ctx.peek) offsets[ctx.tab] = value;
      },
    };
  }, [ctx]);
}
