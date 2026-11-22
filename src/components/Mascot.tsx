import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, View } from 'react-native';
import Svg, { Circle, Defs, G, LinearGradient, Path, Polygon, Stop } from 'react-native-svg';
import { mascot as c } from '../theme';

export type MascotMood = 'happy' | 'celebrate' | 'sleepy';

/** Stellina a 4 punte centrata in (x, y). */
function sparkle(x: number, y: number, r: number) {
  const k = r * 0.28;
  return `M${x},${y - r} Q${x + k},${y - k} ${x + r},${y} Q${x + k},${y + k} ${x},${y + r} Q${x - k},${y + k} ${x - r},${y} Q${x - k},${y - k} ${x},${y - r} Z`;
}

function Eye({ cx, cy, closed }: { cx: number; cy: number; closed: boolean }) {
  if (closed) {
    return <Path d={`M${cx - 16},${cy + 2} Q${cx},${cy + 14} ${cx + 16},${cy + 2}`} stroke={c.eye} strokeWidth={5} strokeLinecap="round" fill="none" />;
  }
  return (
    <G>
      <Circle cx={cx} cy={cy} r={23} fill={c.sparkle} />
      <Circle cx={cx} cy={cy} r={18.5} fill="url(#eye)" />
      <Path d={sparkle(cx - 5, cy - 6, 6)} fill={c.sparkle} />
      <Circle cx={cx + 6} cy={cy - 1} r={2} fill={c.sparkle} />
    </G>
  );
}

/**
 * La mascotte di Gradie: una nuvoletta con il tocco da laureato (dal logo, dec. 114).
 * Vettoriale, quindi nitida a ogni misura e uguale in chiaro e scuro.
 * Fluttua piano e sbatte le palpebre; con "Riduci movimento" sta ferma.
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
  const [blink, setBlink] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduced).catch(() => {});
  }, []);

  useEffect(() => {
    if (!animated || reduced) {
      pop.setValue(1);
      return;
    }
    Animated.spring(pop, { toValue: 1, friction: 5, tension: 70, useNativeDriver: true }).start();
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: mood === 'celebrate' ? 700 : 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: mood === 'celebrate' ? 700 : 1800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [animated, reduced, mood, float, pop]);

  useEffect(() => {
    if (!animated || reduced || mood === 'sleepy') return;
    let t: ReturnType<typeof setTimeout>;
    const schedule = () => {
      t = setTimeout(() => {
        setBlink(true);
        t = setTimeout(() => {
          setBlink(false);
          schedule();
        }, 140);
      }, 2600 + Math.random() * 2200);
    };
    schedule();
    return () => clearTimeout(t);
  }, [animated, reduced, mood]);

  const closed = mood === 'sleepy' || blink;
  const lift = mood === 'celebrate' ? -10 : -6;

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
      <Svg width={size} height={size} viewBox="0 0 200 200">
        <Defs>
          <LinearGradient id="cloud" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={c.cloudTop} />
            <Stop offset="1" stopColor={c.cloudBottom} />
          </LinearGradient>
          <LinearGradient id="eye" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={c.eye} />
            <Stop offset="1" stopColor={c.eyeLow} />
          </LinearGradient>
          <LinearGradient id="cap" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={c.capTop} />
            <Stop offset="1" stopColor={c.capSide} />
          </LinearGradient>
        </Defs>

        {/* Stella e raggi sopra il tocco (festa e felice) */}
        {mood !== 'sleepy' && (
          <G opacity={mood === 'celebrate' ? 1 : 0.9}>
            <Path d={sparkle(104, 22, mood === 'celebrate' ? 15 : 12)} fill={c.star} />
            <Path d="M78,22 L86,26 M130,22 L122,26 M82,10 L88,16 M126,10 L120,16" stroke={c.star} strokeWidth={4} strokeLinecap="round" />
          </G>
        )}
        {mood === 'sleepy' && (
          <G>
            <Path d="M140,30 h12 l-12,12 h12" stroke={c.capTop} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <Path d="M160,14 h9 l-9,9 h9" stroke={c.capTop} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.7} />
          </G>
        )}

        {/* Nuvoletta */}
        <Path
          d="M44,182 C18,182 10,150 30,138 C22,112 44,92 70,100 C78,74 104,64 126,76 C146,66 172,80 172,104 C194,108 198,138 184,152 C194,170 184,182 166,182 Z"
          fill="url(#cloud)"
        />
        <Path d="M44,182 C30,182 22,174 22,164 C40,172 150,174 184,160 C188,172 180,182 166,182 Z" fill={c.cloudShade} opacity={0.55} />

        {/* Tocco: fascia, piano, nappa */}
        <Polygon points="66,84 142,74 146,104 72,114" fill={c.capBand} />
        <Polygon points="30,74 108,44 186,66 110,98" fill="url(#cap)" />
        <Polygon points="30,74 110,98 110,103 30,79" fill={c.capSide} opacity={0.8} />
        <Path d="M108,70 C84,72 60,76 50,80 L48,118" stroke={c.tassel} strokeWidth={4} fill="none" strokeLinecap="round" />
        <Circle cx={108} cy={70} r={5} fill={c.tassel} />
        <Circle cx={48} cy={120} r={6} fill={c.tassel} />
        <Path d="M42,124 L54,124 L58,146 C52,150 44,150 38,146 Z" fill={c.tassel} />
        <Path d="M48,126 L48,147" stroke={c.tasselShade} strokeWidth={2} />

        {/* Viso */}
        <Path d="M66,124 Q78,116 90,121" stroke={c.brow} strokeWidth={4} fill="none" strokeLinecap="round" />
        <Path d="M118,112 Q130,106 142,111" stroke={c.brow} strokeWidth={4} fill="none" strokeLinecap="round" />
        <Eye cx={80} cy={148} closed={closed} />
        <Eye cx={132} cy={140} closed={closed} />
        {mood === 'celebrate' && <Path d="M98,166 Q106,174 114,165" stroke={c.eye} strokeWidth={4} fill="none" strokeLinecap="round" />}
      </Svg>
    </Animated.View>
  );
}

/** Mascotte su sfondo rotondo, per righe e stati vuoti. */
export function MascotBadge({ size = 56 }: { size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden', alignItems: 'center', justifyContent: 'flex-end', backgroundColor: '#ECE8FF' }}>
      <Mascot size={size * 1.15} animated={false} />
    </View>
  );
}
