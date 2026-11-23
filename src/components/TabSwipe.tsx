import { router, useFocusEffect, type Href } from 'expo-router';
import { useCallback, useMemo, useRef, useState, type ComponentType, type ReactNode } from 'react';
import { Animated, Easing, PanResponder, useWindowDimensions, View } from 'react-native';
import { TabScrollContext } from '../state/tabScroll';
import { useTheme } from '../theme';
import { tap } from './haptics';
import { TABS } from './tabs';

type TabName = (typeof TABS)[number]['name'];

/** Scorrimento chiaramente orizzontale (stessa soglia del menu laterale). */
const horizontal = (dx: number, dy: number) => Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 2;

// Ogni scheda registra il suo contenuto, così durante il trascinamento si può disegnare quella accanto.
const screens: Partial<Record<TabName, ComponentType>> = {};
export function registerTabScreen(name: TabName, screen: ComponentType) {
  screens[name] = screen;
}

/**
 * Cambio scheda scorrendo, come su Instagram (dec. 140): verso sinistra si va alla scheda dopo nella barra,
 * verso destra a quella prima. La pagina segue il dito e quella accanto entra dal lato; oltre un quarto di
 * schermo (o con uno scorrimento veloce) completa il passaggio, altrimenti torna indietro. Ai bordi fa resistenza.
 * I gesti più interni vincono: liste orizzontali, note che si scorrono e il menu della Home restano com'erano.
 */
export function TabSwipe({ name, children, noPrev }: { name: TabName; children: ReactNode; noPrev?: boolean }) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const x = useRef(new Animated.Value(0)).current;
  // Scheda che spunta dal lato mentre si trascina (montata solo durante il gesto).
  const [peek, setPeek] = useState<{ tab: TabName; side: 1 | -1 } | null>(null);
  const i = TABS.findIndex((tb) => tb.name === name);
  const prev = noPrev ? undefined : TABS[i - 1]?.name;
  const next = TABS[i + 1]?.name;

  // La pagina torna al centro solo quando non si vede più: se lo facesse subito dopo navigate, per un attimo
  // (prima che la barra nativa cambi scheda) ricomparirebbe la pagina vecchia, come un caricamento.
  useFocusEffect(
    useCallback(() => {
      x.setValue(0);
      setPeek(null);
      return () => {
        setTimeout(() => {
          x.setValue(0);
          setPeek(null);
        }, 300);
      };
    }, [x]),
  );

  const pan = useMemo(() => {
    const target = (dx: number) => (dx < 0 ? next : prev);
    const show = (dx: number) => {
      const to = target(dx);
      const side = dx < 0 ? 1 : -1;
      setPeek((p) => (to && screens[to] ? (p?.tab === to ? p : { tab: to, side }) : null));
    };
    // Se si riprende a trascinare a metà animazione, questa si interrompe e non deve cambiare scheda.
    const settle = (to: number, done: () => void) =>
      Animated.timing(x, { toValue: to, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start(({ finished }) => finished && done());
    return PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => horizontal(g.dx, g.dy) && (g.dx < 0 || !noPrev),
      onPanResponderGrant: (_, g) => show(g.dx),
      onPanResponderMove: (_, g) => {
        // Con una scheda accanto la pagina segue il dito 1:1; ai bordi solo un po' (resistenza).
        x.setValue(target(g.dx) ? Math.max(-width, Math.min(width, g.dx)) : g.dx * 0.15);
        show(g.dx);
      },
      onPanResponderRelease: (_, g) => {
        const to = target(g.dx);
        const far = Math.abs(g.dx) > width * 0.25 || (Math.abs(g.vx) > 0.5 && Math.abs(g.dx) > 30);
        if (to && far) {
          tap();
          // Prima finisce di entrare la scheda accanto, poi si passa a quella vera (che è identica).
          settle(g.dx < 0 ? -width : width, () => router.navigate(`/${to}` as Href));
          return;
        }
        settle(0, () => setPeek(null));
      },
      onPanResponderTerminate: () => settle(0, () => setPeek(null)),
    });
  }, [next, prev, noPrev, width, x]);

  const Peek = peek ? screens[peek.tab] : undefined;
  const own = useMemo(() => ({ tab: name, peek: false }), [name]);
  const peekCtx = useMemo(() => (peek ? { tab: peek.tab, peek: true } : null), [peek]);
  return (
    <View style={{ flex: 1, overflow: 'hidden', backgroundColor: colors.bg }} {...pan.panHandlers}>
      <Animated.View style={{ flex: 1, transform: [{ translateX: x }] }}>
        <TabScrollContext.Provider value={own}>{children}</TabScrollContext.Provider>
        {Peek && peek && (
          <View
            pointerEvents="none"
            importantForAccessibility="no-hide-descendants"
            accessibilityElementsHidden
            style={{ position: 'absolute', top: 0, bottom: 0, width, left: peek.side * width }}
          >
            <TabScrollContext.Provider value={peekCtx}>
              <Peek />
            </TabScrollContext.Provider>
          </View>
        )}
      </Animated.View>
    </View>
  );
}
