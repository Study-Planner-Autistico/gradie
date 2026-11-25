// Apertura del quaderno (dec. 198): entrando in un quaderno, la copertina si apre come un libro, alcune pagine si
// sfogliano e poi il libro si allarga e svanisce sulla pagina con tutti i fogli. Circa un secondo e mezzo; con
// "Riduci movimento" attivo non parte. Non blocca i tocchi: la pagina sotto è già pronta.
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, View } from 'react-native';
import type { NotebookLook } from '../state/subjects';
import { useTheme } from '../theme';
import { COVER_RATIO, COVER_SWATCH } from './coverArt';
import { NotebookCover } from './notebooks';

const W = 170;
const H = Math.round(W / COVER_RATIO);
const PAGES = 4;
const PAPER = '#FFFDF7';

export function BookOpening({ look, name }: { look: NotebookLook; name: string }) {
  const { colors } = useTheme();
  const [done, setDone] = useState(false);
  const cover = useRef(new Animated.Value(0)).current;
  const pages = useRef(Array.from({ length: PAGES }, () => new Animated.Value(0))).current;
  const out = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .catch(() => false)
      .then((reduce) => {
        if (!alive) return;
        if (reduce) return setDone(true);
        const flip = (v: Animated.Value, duration: number) => Animated.timing(v, { toValue: 1, duration, easing: Easing.inOut(Easing.cubic), useNativeDriver: true });
        Animated.sequence([
          flip(cover, 480),
          Animated.stagger(110, pages.map((p) => flip(p, 360))),
          Animated.timing(out, { toValue: 1, duration: 320, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
        ]).start(() => alive && setDone(true));
      });
    return () => {
      alive = false;
    };
  }, [cover, pages, out]);

  if (done) return null;

  // Ogni foglio gira attorno al dorso (bordo sinistro), da 0 a -180 gradi; il retro non si vede.
  const leaf = (v: Animated.Value) => ({
    transformOrigin: 'left center',
    transform: [{ perspective: 900 }, { rotateY: v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-180deg'] }) }],
    backfaceVisibility: 'hidden' as const,
  });
  // Aperto, il libro si sposta a destra di mezza pagina: le due facciate restano al centro.
  const shift = cover.interpolate({ inputRange: [0, 1], outputRange: [0, W / 2] });
  const scale = out.interpolate({ inputRange: [0, 1], outputRange: [1, 1.8] });
  const opacity = out.interpolate({ inputRange: [0, 0.2, 1], outputRange: [1, 1, 0] });
  const lines = (
    <View style={{ position: 'absolute', left: 14, right: 14, top: 26, gap: 12 }}>
      {Array.from({ length: Math.floor((H - 40) / 14) }, (_, k) => (
        <View key={k} style={{ height: 1, backgroundColor: '#D9DEE8' }} />
      ))}
    </View>
  );

  return (
    <Animated.View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg, opacity, zIndex: 10 }}>
      <Animated.View style={{ width: W, height: H, transform: [{ translateX: shift }, { scale }] }}>
        {/* Facciata di destra: la carta del quaderno sotto copertina e pagine. */}
        <View style={{ position: 'absolute', width: W, height: H, borderRadius: 6, backgroundColor: PAPER, borderWidth: 1, borderColor: '#E6E1D6', overflow: 'hidden' }}>{lines}</View>
        {/* Facciata di sinistra: l'interno della copertina, che compare quando la copertina è girata. */}
        <Animated.View
          style={{
            position: 'absolute',
            right: W,
            width: W,
            height: H,
            borderRadius: 6,
            backgroundColor: COVER_SWATCH[look.color],
            opacity: cover.interpolate({ inputRange: [0, 0.5, 0.51, 1], outputRange: [0, 0, 1, 1] }),
          }}
        >
          <View style={{ position: 'absolute', left: 8, right: 0, top: 8, bottom: 8, borderTopLeftRadius: 4, borderBottomLeftRadius: 4, backgroundColor: PAPER }}>{lines}</View>
        </Animated.View>
        {/* Pagine che si sfogliano, dall'ultima alla prima. */}
        {pages.map((p, k) => (
          <Animated.View
            key={k}
            style={[
              { position: 'absolute', width: W - 2, height: H - 2, top: 1, borderRadius: 4, backgroundColor: PAPER, borderWidth: 1, borderColor: '#ECE7DC', overflow: 'hidden' },
              leaf(p),
            ]}
          >
            {lines}
          </Animated.View>
        ))}
        {/* Copertina. */}
        <Animated.View style={[{ position: 'absolute', width: W, height: H, borderRadius: 6, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.18)' }, leaf(cover)]}>
          <NotebookCover look={look} name={name} width={W} height={H} />
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}
