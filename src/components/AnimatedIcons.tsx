/**
 * Icone animate: tracciati e animazioni ripresi da Animate UI (animate-ui.com, icone "send" e "chevron-down"),
 * riscritti per React Native con react-native-svg e Animated, perché la libreria originale è solo per il web.
 *
 * Copyright (c) 2025 Elliot Sutton — licenza "MIT + Commons Clause": uso consentito all'interno di
 * un'applicazione; non si possono vendere o ridistribuire i componenti da soli.
 *
 * Uso con parsimonia (dec. 122): solo per poche icone della Home.
 */
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

export type AnimatedIconHandle = { play: () => void; press?: (down: boolean) => void };
type Props = { size?: number; color: string };

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduced).catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => sub.remove();
  }, []);
  return reduced;
}

const inOut = Easing.inOut(Easing.ease);

/** Aeroplanino di carta: si carica, vola via in alto a destra e rientra dal basso a sinistra (1,2 s). */
export const SendIcon = forwardRef<AnimatedIconHandle, Props>(function SendIcon({ size = 24, color }, ref) {
  const p = useRef(new Animated.Value(0)).current;
  const reduced = useReducedMotion();

  useImperativeHandle(ref, () => ({
    play: () => {
      if (reduced) return;
      p.stopAnimation();
      p.setValue(0);
      Animated.sequence([
        Animated.timing(p, { toValue: 1, duration: 300, easing: inOut, useNativeDriver: true }),
        Animated.timing(p, { toValue: 2, duration: 300, easing: inOut, useNativeDriver: true }),
        Animated.timing(p, { toValue: 3, duration: 0, useNativeDriver: true }),
        Animated.timing(p, { toValue: 4, duration: 600, easing: inOut, useNativeDriver: true }),
      ]).start();
    },
  }));

  const range = [0, 1, 2, 3, 4];
  const translateX = p.interpolate({ inputRange: range, outputRange: [0, -0.1 * size, size, -1.25 * size, 0] });
  const translateY = p.interpolate({ inputRange: range, outputRange: [0, 0.1 * size, -size, 1.25 * size, 0] });
  const scale = p.interpolate({ inputRange: range, outputRange: [1, 0.8, 1, 1, 1] });

  return (
    <Animated.View style={{ width: size, height: size, transform: [{ translateX }, { translateY }, { scale }] }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <Path d="M14.5,21.7c.1.3.4.4.7.3.1,0,.2-.2.3-.3L22,2.7c0-.3,0-.5-.3-.6-.1,0-.2,0-.3,0L2.3,8.5c-.3,0-.4.4-.3.6,0,.1.2.2.3.3l7.9,3.2c.5.2.9.6,1.1,1.1l3.2,7.9Z" />
        <Path d="M21.9,2.1l-10.9,10.9" />
      </Svg>
    </Animated.View>
  );
});

/** Freccia della tendina: scende quando si preme e torna su al rilascio (0,3 s). */
export const ChevronDownIcon = forwardRef<AnimatedIconHandle, Props>(function ChevronDownIcon({ size = 24, color }, ref) {
  const y = useRef(new Animated.Value(0)).current;
  const reduced = useReducedMotion();
  const to = (v: number) => Animated.timing(y, { toValue: v, duration: 300, easing: inOut, useNativeDriver: true });

  useImperativeHandle(ref, () => ({
    play: () => {
      if (reduced) return;
      Animated.sequence([to(1), to(0)]).start();
    },
    press: (down: boolean) => {
      if (reduced) return;
      to(down ? 1 : 0).start();
    },
  }));

  const translateY = y.interpolate({ inputRange: [0, 1], outputRange: [0, (4 / 24) * size] });
  return (
    <Animated.View style={{ width: size, height: size, transform: [{ translateY }] }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <Path d="m6 9 6 6 6-6" />
      </Svg>
    </Animated.View>
  );
});

/**
 * Menu ad hamburger (icona "menu" di Animate UI): da aperto le linee esterne ruotano in una X
 * e quella centrale sparisce. Molla 200/20 come l'originale. Controllata da `open`.
 */
export function MenuIcon({ open, size = 24, color }: Props & { open: boolean }) {
  const p = useRef(new Animated.Value(open ? 1 : 0)).current;
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced) p.setValue(open ? 1 : 0);
    else Animated.spring(p, { toValue: open ? 1 : 0, stiffness: 200, damping: 20, mass: 1, useNativeDriver: true }).start();
  }, [open, reduced, p]);

  const u = size / 24;
  const bar = { position: 'absolute' as const, left: 4 * u, width: 16 * u, height: 2 * u, borderRadius: u, backgroundColor: color };
  const shift = 6 * u;
  return (
    <View style={{ width: size, height: size }}>
      <Animated.View
        style={[bar, { top: 5 * u, transform: [{ translateY: p.interpolate({ inputRange: [0, 1], outputRange: [0, shift] }) }, { rotate: p.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '45deg'] }) }] }]}
      />
      <Animated.View style={[bar, { top: 11 * u, opacity: p.interpolate({ inputRange: [0, 0.5], outputRange: [1, 0], extrapolate: 'clamp' }) }]} />
      <Animated.View
        style={[bar, { top: 17 * u, transform: [{ translateY: p.interpolate({ inputRange: [0, 1], outputRange: [0, -shift] }) }, { rotate: p.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-45deg'] }) }] }]}
      />
    </View>
  );
}

/** Campanella (icona "bell" di Animate UI): oscilla dall'alto e il batacchio dondola. Pallino se ci sono novità. */
export const BellIcon = forwardRef<AnimatedIconHandle, Props & { dot?: boolean; dotColor?: string }>(function BellIcon(
  { size = 24, color, dot, dotColor },
  ref,
) {
  const swing = useRef(new Animated.Value(0)).current;
  const clap = useRef(new Animated.Value(0)).current;
  const reduced = useReducedMotion();

  useImperativeHandle(ref, () => ({
    play: () => {
      if (reduced) return;
      swing.setValue(0);
      clap.setValue(0);
      Animated.parallel([
        Animated.timing(swing, { toValue: 1, duration: 900, easing: inOut, useNativeDriver: true }),
        Animated.timing(clap, { toValue: 1, duration: 1100, easing: inOut, useNativeDriver: true }),
      ]).start();
    },
  }));

  const u = size / 24;
  const rotate = swing.interpolate({ inputRange: [0, 1 / 6, 2 / 6, 3 / 6, 4 / 6, 5 / 6, 1], outputRange: ['0deg', '20deg', '-10deg', '10deg', '-5deg', '3deg', '0deg'] });
  const translateX = clap.interpolate({ inputRange: [0, 1 / 7, 2 / 7, 3 / 7, 4 / 7, 5 / 7, 6 / 7, 1], outputRange: [0, -6, 5, -5, 4, -3, 2, 0].map((v) => v * u) });
  const svg = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  return (
    <View style={{ width: size, height: size }}>
      <Animated.View style={{ width: size, height: size, transformOrigin: 'top', transform: [{ rotate }] }}>
        <Animated.View style={{ position: 'absolute', transform: [{ translateX }] }}>
          <Svg {...svg}>
            <Path d="M10.268 21a2 2 0 0 0 3.464 0" />
          </Svg>
        </Animated.View>
        <Svg {...svg}>
          <Path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
        </Svg>
      </Animated.View>
      {dot && <View style={{ position: 'absolute', top: 1 * u, right: 2 * u, width: 8 * u, height: 8 * u, borderRadius: 4 * u, backgroundColor: dotColor ?? color }} />}
    </View>
  );
});
