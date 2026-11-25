import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Animated, Easing, PanResponder, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { demoEnvironments } from '../data/demo';
import { t } from '../i18n';
import { useEnvironment } from '../state/environment';
import { drawerWidth, menuProgress, setMenuOpen, useMenuOpen } from '../state/menu';
import { useTheme } from '../theme';
import { tap } from './haptics';
import { MascotBadge } from './Mascot';
import { Chip } from './ui';
import { Icon, type IconName } from './icons';

/** Pagine del menu: moduli ancora da progettare (dec. 124), si definiranno più avanti. Impostazioni stanno in fondo (dec. 128). */
const ITEMS: { label: string; icon: IconName; href?: '/registro-voti' }[] = [
  { get label() { return t.menu.materials; }, icon: 'folder' },
  // Registro voti (dec. 195): la prima voce già pronta.
  { get label() { return t.menu.grades; }, icon: 'chart', href: '/registro-voti' },
  { get label() { return t.menu.groups; }, icon: 'users' },
];

/** Apertura rapida (dec. 127): 200 ms, nessun rimbalzo, così non si aspetta. Animazione nativa, fluida. */
const spring = (toValue: number) =>
  Animated.timing(menuProgress, { toValue, duration: 200, easing: Easing.out(Easing.cubic), useNativeDriver: true });

/** Scorrimento orizzontale chiaro (più in orizzontale che in verticale). */
const horizontal = (dx: number, dy: number) => Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 2;

/**
 * Menu laterale come su Spotify (dec. 126): non va sopra la Home, la **sposta a destra** e la scurisce
 * man mano. Segue il dito: da sinistra a destra si apre, da destra a sinistra si chiude.
 * In fondo l'ambiente, che si apre a tendina per cambiarlo (dec. 124).
 */
export function PushDrawer({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const w = drawerWidth(width);
  const open = useMenuOpen();
  const openRef = useRef(open);
  openRef.current = open;

  // Apertura e chiusura dai bottoni (hamburger, velo).
  useEffect(() => {
    spring(open ? 1 : 0).start();
  }, [open]);

  const pan = useMemo(() => {
    let start = 0;
    return PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => horizontal(g.dx, g.dy) && (openRef.current ? g.dx < 0 : g.dx > 0),
      // Da aperto il menu prende per primo lo scorrimento verso sinistra (prima di liste e del cambio scheda)
      // e non lo cede finché non si alza il dito: chiuderlo non deve mai aprire l'Agenda.
      onMoveShouldSetPanResponderCapture: (_, g) => openRef.current && horizontal(g.dx, g.dy) && g.dx < 0,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        menuProgress.stopAnimation((v) => {
          start = v;
        });
      },
      onPanResponderMove: (_, g) => menuProgress.setValue(Math.max(0, Math.min(1, start + g.dx / w))),
      onPanResponderRelease: (_, g) => {
        const v = Math.max(0, Math.min(1, start + g.dx / w));
        const target = g.vx > 0.5 ? 1 : g.vx < -0.5 ? 0 : v > 0.5 ? 1 : 0;
        if (target === 1 && !openRef.current) tap();
        // Lo stato cambia solo a fine animazione: un nuovo render a metà corsa faceva saltare la Home (dec. 160).
        spring(target).start(({ finished }) => finished && setMenuOpen(target === 1));
      },
      onPanResponderTerminate: () => spring(openRef.current ? 1 : 0).start(),
    });
  }, [w]);

  const shift = menuProgress.interpolate({ inputRange: [0, 1], outputRange: [0, w] });
  // Il menu entra un po' più lento della Home (effetto profondità).
  const panelShift = menuProgress.interpolate({ inputRange: [0, 1], outputRange: [-w * 0.35, 0] });
  const dim = menuProgress.interpolate({ inputRange: [0, 1], outputRange: [0, 0.55] });

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, overflow: 'hidden' }} {...pan.panHandlers}>
      <Animated.View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: w, transform: [{ translateX: panelShift }] }}>
        <MenuPanel open={open} />
      </Animated.View>

      <Animated.View style={{ flex: 1, transform: [{ translateX: shift }], boxShadow: '-8px 0 24px rgba(0,0,0,0.18)' }}>
        {children}
        {/* Velo che scurisce la Home; da aperto un tocco chiude il menu. */}
        <Animated.View pointerEvents={open ? 'auto' : 'none'} style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: '#000', opacity: dim }}>
          <Pressable style={{ flex: 1 }} onPress={() => setMenuOpen(false)} accessibilityRole="button" accessibilityLabel={t.a11y.closeMenu} />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

function MenuPanel({ open }: { open: boolean }) {
  const { colors, typography, spacing, radius } = useTheme();
  const insets = useSafeAreaInsets();
  const [envOpen, setEnvOpen] = useState(false);

  // Voci subito visibili (niente comparsa una dopo l'altra, dec. 127).
  useEffect(() => {
    if (!open) setEnvOpen(false);
  }, [open]);

  return (
    <View
      accessibilityElementsHidden={!open}
      importantForAccessibility={open ? 'auto' : 'no-hide-descendants'}
      style={{ flex: 1, paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.lg }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, marginBottom: spacing.xl }}>
        <MascotBadge size={44} />
        <Text style={[typography.title1, { color: colors.text }]}>{t.appName}</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.md, gap: spacing.xxs }}>
        {ITEMS.map((item) => (
          <MenuItem key={item.label} label={item.label} icon={item.icon} href={item.href} />
        ))}
      </ScrollView>

      <View style={{ paddingHorizontal: spacing.md, marginBottom: spacing.sm }}>
        <MenuItem label={t.menu.settings} icon="settings" />
      </View>
      <EnvironmentPicker open={envOpen} onToggle={() => setEnvOpen((v) => !v)} onPicked={() => setEnvOpen(false)} />
    </View>
  );
}

/** Voce del menu: icona a tratto arrotondato senza sfondo, testo leggero (dec. 128). */
function MenuItem({ label, icon, href }: { label: string; icon: IconName; href?: '/registro-voti' }) {
  const { colors, typography, spacing, radius } = useTheme();
  return (
    <Pressable
      onPress={() => {
        tap();
        if (!href) return;
        setMenuOpen(false);
        router.push(href);
      }}
      accessibilityRole="button"
      accessibilityHint={href ? undefined : t.menu.soon}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        minHeight: 48,
        paddingHorizontal: spacing.sm,
        borderRadius: radius.lg,
        backgroundColor: pressed ? colors.neutralPressed : 'transparent',
      })}
    >
      <Icon name={icon} size={22} color={colors.text} />
      <Text style={[typography.body, { fontSize: 17, color: colors.text, flex: 1 }]}>{label}</Text>
      {href ? <Icon name="chevron" size={18} color={colors.textTertiary} /> : <Chip variant="muted" label={t.menu.soon} />}
    </Pressable>
  );
}

/** Ambiente in fondo al menu: tocco → si apre la tendina con gli altri ambienti. */
function EnvironmentPicker({ open, onToggle, onPicked }: { open: boolean; onToggle: () => void; onPicked: () => void }) {
  const { colors, typography, spacing, radius } = useTheme();
  const { active, setActive } = useEnvironment();
  const p = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(p, { toValue: open ? 1 : 0, duration: 150, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [open, p]);

  const rotate = p.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });

  return (
    <View style={{ paddingHorizontal: spacing.md, gap: spacing.sm }}>
      {/* Senza card (dec. 129): righe allineate alle voci del menu. */}
      <View>
        {open && (
          <Animated.View style={{ opacity: p, transform: [{ translateY: p.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] }}>
            {demoEnvironments
              .filter((e) => e.id !== active.id)
              .map((env) => (
                <Pressable
                  key={env.id}
                  onPress={() => {
                    tap();
                    setActive(env.id);
                    onPicked();
                  }}
                  accessibilityRole="button"
                  style={({ pressed }) => ({
                    paddingLeft: spacing.sm + 22 + spacing.md,
                    paddingRight: spacing.sm,
                    paddingVertical: spacing.sm,
                    borderRadius: radius.lg,
                    backgroundColor: pressed ? colors.neutralPressed : 'transparent',
                  })}
                >
                  <Text style={[typography.body, { color: colors.text }]} numberOfLines={1}>
                    {env.name}
                  </Text>
                  <Text style={[typography.caption, { color: colors.textSecondary }]} numberOfLines={1}>
                    {env.detail}
                  </Text>
                </Pressable>
              ))}
          </Animated.View>
        )}
        <Pressable
          onPress={() => {
            tap();
            onToggle();
          }}
          accessibilityRole="button"
          accessibilityState={{ expanded: open }}
          accessibilityLabel={`${t.a11y.switchEnv}: ${active.name}`}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.md,
            paddingHorizontal: spacing.sm,
            paddingVertical: spacing.sm,
            borderRadius: radius.lg,
            backgroundColor: pressed ? colors.neutralPressed : 'transparent',
          })}
        >
          <Icon name="school" size={22} color={colors.text} />
          <View style={{ flex: 1 }}>
            <Text style={[typography.headline, { color: colors.text }]} numberOfLines={1}>
              {active.name}
            </Text>
            <Text style={[typography.caption, { color: colors.textSecondary }]} numberOfLines={1}>
              {active.detail}
            </Text>
          </View>
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Icon name="chevron-up" size={20} color={colors.textSecondary} />
          </Animated.View>
        </Pressable>
      </View>
    </View>
  );
}
