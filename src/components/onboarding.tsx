import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useMemo, useRef, useState, type ComponentRef, type ReactNode } from 'react';
import { AccessibilityInfo, Animated, Easing, Pressable, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useTheme, type TintName } from '../theme';
import { tap } from './haptics';
import type { IconName } from './icons';

/** "Riduci movimento" del sistema: niente fluttuazioni né coriandoli. */
function useReducedMotion() {
  const [r, setR] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setR).catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setR);
    return () => sub.remove();
  }, []);
  return r;
}

const bezier = (b: readonly [number, number, number, number]) => Easing.bezier(b[0], b[1], b[2], b[3]);

/** Progress bar Atlassian: alta 6, raggio pieno, brand (DESIGN.md §5.12). */
export function ProgressBar({ value }: { value: number }) {
  const { colors, motion } = useTheme();
  const w = useRef(new Animated.Value(value)).current;
  useEffect(() => {
    Animated.timing(w, { toValue: value, duration: motion.xlong, easing: bezier(motion.easeOutExpo), useNativeDriver: false }).start();
  }, [value, w, motion]);
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(value * 100) }}
      style={{ height: 6, borderRadius: 3, backgroundColor: colors.surfaceMuted, overflow: 'hidden', flex: 1 }}
    >
      <Animated.View
        style={{
          height: 6,
          borderRadius: 3,
          backgroundColor: colors.accent,
          width: w.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
        }}
      />
    </View>
  );
}

/** Entrata di ogni passo: scorre dal lato giusto e appare (250 ms, easing.out.expo). */
export function StepTransition({ stepKey, direction, children }: { stepKey: string; direction: 1 | -1; children: ReactNode }) {
  const { motion } = useTheme();
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    v.setValue(0);
    Animated.timing(v, { toValue: 1, duration: motion.xlong, easing: bezier(motion.easeOutExpo), useNativeDriver: true }).start();
  }, [stepKey, v, motion]);
  return (
    <Animated.View
      style={{
        flex: 1,
        opacity: v,
        transform: [{ translateX: v.interpolate({ inputRange: [0, 1], outputRange: [32 * direction, 0] }) }],
      }}
    >
      {children}
    </Animated.View>
  );
}

/** Comparsa in sequenza degli elementi di un passo. */
export function FadeUp({ delay = 0, children }: { delay?: number; children: ReactNode }) {
  const { motion } = useTheme();
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: motion.xxlong, delay, easing: bezier(motion.easeOutExpo), useNativeDriver: true }).start();
  }, [v, delay, motion]);
  return (
    <Animated.View style={{ opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }}>
      {children}
    </Animated.View>
  );
}

const ORBIT_TINTS: TintName[] = ['lesson', 'appointment', 'activity', 'official'];

/**
 * Illustrazione originale "in orbita": un nucleo con l'icona del passo e satelliti colorati
 * che fluttuano. Sostituisce le mascotte dell'ispirazione (DESIGN.md §10: niente asset copiati).
 */
export function OrbitArt({
  icon,
  satellites = ['book-outline', 'calendar-outline', 'school-outline', 'create-outline'],
  size = 220,
  tint = 'lesson',
}: {
  icon: IconName;
  satellites?: IconName[];
  size?: number;
  tint?: TintName;
}) {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  const float = useRef(new Animated.Value(0)).current;
  const pop = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduced) {
      pop.setValue(1);
      return;
    }
    Animated.spring(pop, { toValue: 1, friction: 6, tension: 60, useNativeDriver: true }).start();
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 2200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [float, pop, reduced]);
  const r = size / 2;
  const core = size * 0.36;
  return (
    <Animated.View
      importantForAccessibility="no-hide-descendants"
      accessibilityElementsHidden
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center', transform: [{ scale: pop }] }}
    >
      <View style={[styles.ring, { width: size, height: size, borderRadius: r, borderColor: colors.border }]} />
      <View style={[styles.ring, { width: size * 0.68, height: size * 0.68, borderRadius: size * 0.34, borderColor: colors.border }]} />
      <View
        style={{
          width: core,
          height: core,
          borderRadius: core / 2,
          backgroundColor: colors.tints[tint].bg,
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: colors.shadowRaised,
        }}
      >
        <Ionicons name={icon} size={core * 0.42} color={colors.tints[tint].fg} />
      </View>
      {satellites.slice(0, 4).map((s, i) => {
        const angle = (-60 + i * 95) * (Math.PI / 180);
        const dist = i % 2 === 0 ? r - 22 : r * 0.68 - 4;
        const st = ORBIT_TINTS[(i + 1) % ORBIT_TINTS.length];
        const dy = float.interpolate({ inputRange: [0, 1], outputRange: [0, i % 2 === 0 ? -6 : 6] });
        return (
          <Animated.View
            key={s + i}
            style={[
              styles.sat,
              {
                backgroundColor: colors.surface,
                boxShadow: colors.shadowOverlay,
                transform: [{ translateX: Math.cos(angle) * dist }, { translateY: Math.sin(angle) * dist }, { translateY: dy }],
              },
            ]}
          >
            <Ionicons name={s} size={20} color={colors.tints[st].fg} />
          </Animated.View>
        );
      })}
    </Animated.View>
  );
}

/** Opzione grande a scelta singola (pannello di scelta, DESIGN.md §5.13). */
export function OptionCard({
  title,
  desc,
  icon,
  selected,
  onPress,
}: {
  title: string;
  desc?: string;
  icon?: IconName;
  selected?: boolean;
  onPress: () => void;
}) {
  const { colors, typography, radius, spacing } = useTheme();
  return (
    <Pressable
      onPress={() => {
        tap();
        onPress();
      }}
      accessibilityRole="radio"
      accessibilityState={{ selected: !!selected }}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        minHeight: 64,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderRadius: radius.lg,
        borderWidth: 2,
        borderColor: selected ? colors.accent : colors.border,
        backgroundColor: selected ? colors.selected : pressed ? colors.surfaceMuted : colors.surface,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      {icon && (
        <View style={{ width: 40, height: 40, borderRadius: radius.lg, backgroundColor: selected ? colors.surface : colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name={icon} size={20} color={selected ? colors.accent : colors.textSecondary} />
        </View>
      )}
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[typography.headline, { color: selected ? colors.selectedText : colors.text }]}>{title}</Text>
        {desc && <Text style={[typography.caption, { color: colors.textTertiary }]}>{desc}</Text>}
      </View>
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          borderWidth: selected ? 6 : 2,
          borderColor: selected ? colors.accent : colors.borderInput,
          backgroundColor: colors.surface,
        }}
      />
    </Pressable>
  );
}

/**
 * Pannello di scelta dal basso sopra l'illustrazione (ispirato all'onboarding di riferimento):
 * sale con una molla, la scelta porta avanti da sola dopo un attimo.
 */
export function ChoiceSheet({ children }: { children: ReactNode }) {
  const { colors, radius, spacing } = useTheme();
  const { height } = useWindowDimensions();
  const y = useRef(new Animated.Value(height * 0.5)).current;
  useEffect(() => {
    Animated.spring(y, { toValue: 0, friction: 9, tension: 55, useNativeDriver: true }).start();
  }, [y]);
  return (
    <Animated.View
      style={{
        backgroundColor: colors.surfaceOverlay,
        borderTopLeftRadius: radius.xxl,
        borderTopRightRadius: radius.xxl,
        padding: spacing.xxl,
        paddingBottom: spacing.xxxl,
        gap: spacing.md,
        boxShadow: colors.shadowOverlay,
        transform: [{ translateY: y }],
      }}
    >
      {children}
    </Animated.View>
  );
}

/** Codice a 6 cifre: un campo invisibile e 6 caselle (DESIGN.md §5.14). */
export function CodeInput({ value, onChange, error, label }: { value: string; onChange: (v: string) => void; error?: boolean; label: string }) {
  const { colors, typography, radius, spacing } = useTheme();
  const ref = useRef<ComponentRef<typeof TextInput>>(null);
  const [focused, setFocused] = useState(false);
  const shake = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const id = setTimeout(() => ref.current?.focus(), 350);
    return () => clearTimeout(id);
  }, []);
  useEffect(() => {
    if (!error) return;
    Animated.sequence(
      [8, -8, 6, -6, 0].map((x) => Animated.timing(shake, { toValue: x, duration: 50, useNativeDriver: true })),
    ).start();
  }, [error, shake]);
  return (
    <Pressable onPress={() => ref.current?.focus()} accessibilityLabel={label}>
      <Animated.View style={{ flexDirection: 'row', gap: spacing.sm, justifyContent: 'center', transform: [{ translateX: shake }] }}>
        {Array.from({ length: 6 }, (_, i) => {
          const ch = value[i] ?? '';
          const active = focused && (i === value.length || (i === 5 && value.length === 6));
          return (
            <View
              key={i}
              style={{
                width: 46,
                height: 56,
                borderRadius: radius.md,
                borderWidth: active || error ? 2 : 1,
                borderColor: error ? colors.dangerIcon : active ? colors.borderFocused : colors.borderInput,
                backgroundColor: colors.surface,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={[typography.metric, { color: colors.text }]}>{ch}</Text>
            </View>
          );
        })}
      </Animated.View>
      <TextInput
        ref={ref}
        value={value}
        onChangeText={(v) => onChange(v.replace(/\D/g, '').slice(0, 6))}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        maxLength={6}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        accessibilityLabel={label}
        style={styles.hiddenInput}
      />
    </Pressable>
  );
}

/** Controllo segmentato per numeri piccoli (anno di corso). */
export function Segmented({ options, value, onChange }: { options: string[]; value?: string; onChange: (v: string) => void }) {
  const { colors, typography, radius, spacing } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: spacing.xs, padding: spacing.xs, borderRadius: radius.lg, backgroundColor: colors.surfaceMuted }}>
      {options.map((o) => {
        const sel = o === value;
        return (
          <Pressable
            key={o}
            onPress={() => {
              tap();
              onChange(o);
            }}
            accessibilityRole="radio"
            accessibilityState={{ selected: sel }}
            style={{
              flex: 1,
              height: 40,
              borderRadius: radius.md,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: sel ? colors.surface : 'transparent',
              boxShadow: sel ? colors.shadowRaised : undefined,
            }}
          >
            <Text style={[typography.headline, { color: sel ? colors.selectedText : colors.textSecondary }]}>{o}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Pill selezionabili (indirizzo, materie, tipo). */
export function SelectPills({
  options,
  isSelected,
  onToggle,
}: {
  options: string[];
  isSelected: (o: string) => boolean;
  onToggle: (o: string) => void;
}) {
  const { colors, typography, radius, spacing } = useTheme();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
      {options.map((o) => {
        const sel = isSelected(o);
        return (
          <Pressable
            key={o}
            onPress={() => {
              tap();
              onToggle(o);
            }}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: sel }}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.xs,
              height: 40,
              paddingHorizontal: spacing.md,
              borderRadius: radius.pill,
              borderWidth: 1,
              borderColor: sel ? colors.accent : colors.border,
              backgroundColor: sel ? colors.selected : colors.surface,
              transform: [{ scale: pressed ? 0.96 : 1 }],
            })}
          >
            {sel && <Ionicons name="checkmark" size={16} color={colors.accent} />}
            <Text style={[typography.callout, { color: sel ? colors.selectedText : colors.text }]}>{o}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Coriandoli della schermata finale: pezzi colorati che cadono una volta. */
export function Confetti() {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  const { width, height } = useWindowDimensions();
  const pieces = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        x: Math.random() * width,
        delay: Math.random() * 500,
        rot: Math.random() * 360,
        drift: (Math.random() - 0.5) * 80,
        color: [colors.accent, colors.tints.appointment.fg, colors.tints.activity.fg, colors.tints.official.fg, colors.discovery][i % 5],
        w: 6 + Math.random() * 6,
      })),
    [width, colors],
  );
  const v = useRef(pieces.map(() => new Animated.Value(0))).current;
  useEffect(() => {
    Animated.stagger(
      20,
      v.map((a, i) => Animated.timing(a, { toValue: 1, duration: 2200, delay: pieces[i].delay, easing: Easing.out(Easing.quad), useNativeDriver: true })),
    ).start();
  }, [v, pieces]);
  if (reduced) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
      {pieces.map((p, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            left: p.x,
            top: -20,
            width: p.w,
            height: p.w * 1.6,
            borderRadius: 2,
            backgroundColor: p.color,
            opacity: v[i].interpolate({ inputRange: [0, 0.8, 1], outputRange: [1, 1, 0] }),
            transform: [
              { translateY: v[i].interpolate({ inputRange: [0, 1], outputRange: [0, height * 0.8] }) },
              { translateX: v[i].interpolate({ inputRange: [0, 1], outputRange: [0, p.drift] }) },
              { rotate: v[i].interpolate({ inputRange: [0, 1], outputRange: [`${p.rot}deg`, `${p.rot + 360}deg`] }) },
            ],
          }}
        />
      ))}
    </View>
  );
}

/** QR finto per la demo TOTP: motivo deterministico, non scansionabile. */
export function FakeQr({ size = 168 }: { size?: number }) {
  const { colors, radius } = useTheme();
  const n = 21;
  const cell = size / n;
  const on = (x: number, y: number) => {
    const finder = (fx: number, fy: number) => x >= fx && x < fx + 7 && y >= fy && y < fy + 7;
    if (finder(0, 0) || finder(n - 7, 0) || finder(0, n - 7)) {
      const lx = x % (n - 7) === 0 || x === 6 || x === n - 1;
      const ly = y % (n - 7) === 0 || y === 6 || y === n - 1;
      const inner = (x >= 2 && x <= 4 && (y >= 2 && y <= 4 || y >= n - 5 && y <= n - 3)) || (x >= n - 5 && x <= n - 3 && y >= 2 && y <= 4);
      return lx || ly || inner;
    }
    return ((x * 7 + y * 13 + x * y) % 5) < 2;
  };
  return (
    <View style={{ padding: 12, backgroundColor: '#FFFFFF', borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border }}>
      <View style={{ width: size, height: size, flexDirection: 'row', flexWrap: 'wrap' }}>
        {Array.from({ length: n * n }, (_, i) => (
          <View key={i} style={{ width: cell, height: cell, backgroundColor: on(i % n, Math.floor(i / n)) ? '#292A2E' : '#FFFFFF' }} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ring: { position: 'absolute', borderWidth: 1, borderStyle: 'dashed' },
  sat: { position: 'absolute', width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  hiddenInput: { position: 'absolute', opacity: 0, width: 1, height: 1 },
});
