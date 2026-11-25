import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Image, View } from 'react-native';

/**
 * Umori della mascotte (dec. 201):
 * - happy e celebrate: il nuovo logo (nuvoletta con il tocco e le stelline), che fluttua piano;
 * - sleepy: la GIF di Gradie che dorme ("Modulo in progettazione", blocco app, onboarding);
 * - wonder: la GIF con le stelline negli occhi (riquadro "Oggi" della Home, dec. 202).
 */
export type MascotMood = 'happy' | 'celebrate' | 'sleepy' | 'wonder';

// Immagini su sfondo trasparente, ricavate dagli originali di Gradie (dec. 201). Le GIF hanno anche il primo
// fotogramma fermo, usato con "Riduci movimento" o quando l'animazione è spenta.
const LOGO = require('../../assets/mascot/gradie-logo.png');
const GIF = {
  sleepy: { moving: require('../../assets/mascot/gradie-dorme.gif'), still: require('../../assets/mascot/gradie-dorme-still.png') },
  wonder: { moving: require('../../assets/mascot/gradie-stelline.gif'), still: require('../../assets/mascot/gradie-stelline-still.png') },
};

/**
 * La mascotte di Gradie: una nuvoletta con il tocco da laureato.
 * Entra con un piccolo rimbalzo; il logo fluttua piano, le GIF si animano da sole. Con "Riduci movimento" sta ferma.
 */
export function Mascot({
  size = 200,
  mood = 'happy',
  animated = true,
  accessibilityLabel,
}: {
  size?: number;
  mood?: MascotMood;
  animated?: boolean;
  accessibilityLabel?: string;
}) {
  const float = useRef(new Animated.Value(0)).current;
  const pop = useRef(new Animated.Value(animated ? 0 : 1)).current;
  const [reduced, setReduced] = useState(false);
  const gif = mood === 'sleepy' || mood === 'wonder' ? GIF[mood] : undefined;
  const moving = animated && !reduced;

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduced).catch(() => {});
  }, []);

  useEffect(() => {
    if (!moving) {
      pop.setValue(1);
      return;
    }
    Animated.spring(pop, { toValue: 1, friction: 5, tension: 70, useNativeDriver: true }).start();
    // Le GIF hanno già il loro movimento: fluttua solo il logo.
    if (gif) return;
    const d = mood === 'celebrate' ? 700 : 1800;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: d, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: d, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [moving, mood, gif, float, pop]);

  const lift = mood === 'celebrate' ? -10 : -6;
  const source = gif ? (moving ? gif.moving : gif.still) : LOGO;

  return (
    <Animated.View
      accessible={!!accessibilityLabel}
      accessibilityRole={accessibilityLabel ? 'image' : undefined}
      accessibilityLabel={accessibilityLabel}
      importantForAccessibility={accessibilityLabel ? 'yes' : 'no-hide-descendants'}
      style={{
        width: size,
        height: size,
        transform: [{ scale: pop }, { translateY: float.interpolate({ inputRange: [0, 1], outputRange: [0, lift] }) }],
      }}
    >
      <Image source={source} style={{ width: size, height: size }} resizeMode="contain" />
    </Animated.View>
  );
}

/** Logo su sfondo rotondo, per righe e stati vuoti. */
export function MascotBadge({ size = 56 }: { size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ECE8FF' }}>
      <Mascot size={size * 0.86} animated={false} />
    </View>
  );
}
