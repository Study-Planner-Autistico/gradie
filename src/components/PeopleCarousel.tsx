import { useCallback, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, { cancelAnimation, useAnimatedStyle, useSharedValue, withDecay, type SharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { t } from '../i18n';
import { avatarPalette, useTheme } from '../theme';
import { Avatar, AVATAR_STYLES, DEFAULT_AVATAR, type AvatarConfig } from './avatar/Avatar';
import { tap } from './haptics';

export type CarouselPerson = { id: string; name: string; teacher?: boolean };

const W = 104;
const H = 136;
/** Distanza fra due carte: meno della larghezza, così si sovrappongono a ventaglio. */
const STEP = 72;

/** Avatar disegnato fisso per ogni persona, ricavato dal suo id (gli amici non hanno ancora un avatar proprio). */
export function avatarFor(seed: string): AvatarConfig {
  // Un hash diverso per ogni parte, così due persone non si somigliano per caso.
  const hash = (s: string) => {
    let h = 2166136261;
    for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
    return h;
  };
  const pick = <T,>(list: readonly T[], salt: number) => list[hash(`${seed}:${salt}`) % list.length];
  return {
    ...DEFAULT_AVATAR,
    skin: pick(avatarPalette.skin, 1),
    hair: pick(AVATAR_STYLES.hair.filter((x) => x !== 'none'), 3),
    hairColor: pick(avatarPalette.hair.slice(0, 4), 5),
    eyebrow: pick(AVATAR_STYLES.eyebrow, 7),
    eyes: pick(AVATAR_STYLES.eyes, 9),
    glasses: pick(AVATAR_STYLES.glasses, 11),
    nose: pick(AVATAR_STYLES.nose, 13),
    mouth: pick(AVATAR_STYLES.mouth, 15),
    shirt: pick(AVATAR_STYLES.shirt, 17),
    shirtColor: pick(avatarPalette.shirt, 19),
    bg: pick(avatarPalette.bg, 21),
  };
}

/**
 * Carte dei compagni e del docente a ventaglio (dec. 226): trascinando di lato scorrono tutte e ricominciano
 * da capo senza fine. Il docente ha la cornice del brand. Un tocco su una carta apre la persona.
 */
export function PeopleCarousel({ people, onPress }: { people: CarouselPerson[]; onPress?: (p: CarouselPerson) => void }) {
  const [width, setWidth] = useState(0);
  const offset = useSharedValue(0);
  const start = useSharedValue(0);
  // Mentre si trascina (e subito dopo) il rilascio non vale come tocco su una carta: sul web il tocco arriverebbe comunque.
  const dragging = useRef(false);
  const lastDrag = useRef(0);
  const setDragging = useCallback((on: boolean) => {
    dragging.current = on;
    lastDrag.current = Date.now();
  }, []);
  const press = useCallback(
    (p: CarouselPerson) => {
      if (dragging.current || Date.now() - lastDrag.current < 250) return;
      tap();
      onPress?.(p);
    },
    [onPress],
  );

  // Si ripete l'elenco finché il giro è più largo dello spazio visibile: così il salto da un capo all'altro non si vede.
  const copies = people.length ? Math.max(1, Math.ceil((width + 2 * W) / (people.length * STEP))) : 0;
  const cards = Array.from({ length: copies }, (_, c) => people.map((p) => ({ p, key: `${c}-${p.id}` }))).flat();
  const span = cards.length * STEP;

  const pan = usePanGesture({
    activeOffsetX: [-8, 8],
    failOffsetY: [-12, 12],
    onBegin: () => {
      'worklet';
      cancelAnimation(offset);
      start.value = offset.value;
    },
    onActivate: () => {
      'worklet';
      scheduleOnRN(setDragging, true);
    },
    onUpdate: (e) => {
      'worklet';
      offset.value = start.value - e.translationX;
    },
    onDeactivate: (e) => {
      'worklet';
      offset.value = withDecay({ velocity: -e.velocityX, deceleration: 0.997 });
      scheduleOnRN(setDragging, false);
    },
  });

  return (
    <GestureDetector gesture={pan}>
      <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={{ height: H + 28, overflow: 'hidden' }} accessibilityRole="adjustable">
        {width > 0 &&
          cards.map(({ p, key }, i) => (
            <Card key={key} person={p} index={i} span={span} center={width / 2} offset={offset} onPress={press} />
          ))}
      </View>
    </GestureDetector>
  );
}

function Card({
  person,
  index,
  span,
  center,
  offset,
  onPress,
}: {
  person: CarouselPerson;
  index: number;
  span: number;
  center: number;
  offset: SharedValue<number>;
  onPress?: (p: CarouselPerson) => void;
}) {
  const { colors, typography, radius, spacing } = useTheme();
  const config = avatarFor(person.id);

  const style = useAnimatedStyle(() => {
    // Posizione della carta nel giro, riportata fra -span/2 e +span/2: il centro è 0.
    const rel = index * STEP - offset.value;
    const x = ((((rel + span / 2) % span) + span) % span) - span / 2;
    const d = Math.min(Math.abs(x) / STEP, 3);
    return {
      zIndex: Math.round(1000 - Math.abs(x)),
      transform: [
        { translateX: center - W / 2 + x },
        { translateY: 8 + d * 4 },
        { rotate: `${Math.max(-12, Math.min(12, (x / STEP) * 6))}deg` },
        { scale: 1 - d * 0.04 },
      ],
    };
  });

  const frame = person.teacher ? colors.accent : colors.surface;
  return (
    <Animated.View style={[{ position: 'absolute', left: 0, top: 0, width: W, height: H }, style]}>
      <Pressable
        onPress={() => onPress?.(person)}
        accessibilityRole="button"
        accessibilityLabel={person.teacher ? `${person.name}, ${t.classroom.teacher}` : person.name}
        style={{
          flex: 1,
          borderRadius: radius.xxl,
          borderWidth: 4,
          borderColor: frame,
          backgroundColor: config.bg,
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'flex-end',
          // Spazio per il nome in basso, così non copre il viso.
          paddingBottom: 18,
        }}
      >
        <Avatar config={config} size={W - 8} shape="square" frame="head" background={false} />
        <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, paddingVertical: spacing.xxs, backgroundColor: frame }}>
          <Text numberOfLines={1} style={[typography.caption, { fontWeight: '700', textAlign: 'center', color: person.teacher ? colors.onAccent : colors.text }]}>
            {person.name}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}
