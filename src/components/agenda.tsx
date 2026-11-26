import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Modal, PanResponder, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { DemoAgendaItem } from '../data/demo';
import { locale, t } from '../i18n';
import { fonts, useTheme, type TintName } from '../theme';
import { tap } from './haptics';
import { EmptyState } from './ui';
import { tabSwipeLock } from './TabSwipe';
import { Icon, type IconName } from './icons';

export const KIND_ICON: Record<TintName, IconName> = {
  lesson: 'book',
  appointment: 'person',
  activity: 'flag',
  official: 'people',
  holiday: 'sunny',
  study: 'school-outline',
};

export function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

/**
 * Settimana da lunedì a domenica a foglietti di calendario (dec. 204): in alto il giorno breve in una fascia colorata
 * (viola tenue; piena del brand per il giorno scelto; rossa sabato e domenica), sotto il numero. Sotto il foglietto, i pallini delle materie.
 * Scorrendo di lato si va alla settimana prima o dopo, lo stesso giorno della settimana.
 */
export function DayStrip({
  selected,
  onSelect,
  dotsFor,
}: {
  selected: Date;
  onSelect: (d: Date) => void;
  /** Colori delle materie del giorno, già senza doppioni. */
  dotsFor: (d: Date) => string[];
}) {
  const { colors, typography, spacing, radius, layout } = useTheme();
  const { width } = useWindowDimensions();
  const today = new Date().toDateString();
  const monday = addDays(selected, -((selected.getDay() + 6) % 7));
  const x = useRef(new Animated.Value(0)).current;
  const latest = useRef({ selected, onSelect });
  latest.current = { selected, onSelect };
  const pan = useMemo(
    () =>
      PanResponder.create({
        // Più interno della TabSwipe: lo scorrimento di lato sulla settimana non cambia scheda (dec. 140).
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 12 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
        onPanResponderTerminationRequest: () => false,
        onPanResponderMove: (_, g) => x.setValue(g.dx),
        onPanResponderRelease: (_, g) => {
          const dir = g.dx < -width / 5 || g.vx < -0.5 ? 1 : g.dx > width / 5 || g.vx > 0.5 ? -1 : 0;
          if (!dir) return Animated.spring(x, { toValue: 0, useNativeDriver: true }).start();
          Animated.timing(x, { toValue: -dir * width, duration: 160, easing: Easing.in(Easing.quad), useNativeDriver: true }).start(() => {
            tap();
            latest.current.onSelect(addDays(latest.current.selected, dir * 7));
            x.setValue(dir * width);
            Animated.timing(x, { toValue: 0, duration: 200, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
          });
        },
        onPanResponderTerminate: () => Animated.spring(x, { toValue: 0, useNativeDriver: true }).start(),
      }),
    [x, width],
  );
  return (
    // I gesti li prende il contenitore fermo: anche a metà animazione la settimana resta sotto il dito.
    <View {...pan.panHandlers}>
    <Animated.View style={[styles.row, { gap: spacing.sm, alignItems: 'flex-start', transform: [{ translateX: x }] }]}>
      {Array.from({ length: 7 }, (_, i) => addDays(monday, i)).map((d, i) => {
        const isSel = d.toDateString() === selected.toDateString();
        const isToday = d.toDateString() === today;
        const weekend = i >= 5;
        const band = isSel ? colors.accent : weekend ? colors.dangerIcon : colors.selected;
        const bandText = isSel || weekend ? colors.onAccent : colors.selectedText;
        const number = isSel || isToday ? colors.accent : weekend ? colors.danger : colors.text;
        return (
          <Pressable
            key={d.toDateString()}
            onPress={() => onSelect(d)}
            accessibilityRole="button"
            accessibilityState={{ selected: isSel }}
            accessibilityLabel={d.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })}
            style={{ flex: 1, alignItems: 'center', gap: spacing.sm }}
          >
            <View style={{ alignSelf: 'stretch', borderRadius: radius.lg, overflow: 'hidden', backgroundColor: isSel ? colors.selected : colors.surface, boxShadow: colors.shadowRaised }}>
              <View style={{ backgroundColor: band, paddingVertical: 2, alignItems: 'center' }}>
                <Text style={[typography.caption, { color: bandText, fontWeight: '600', textTransform: 'capitalize' }]}>
                  {d.toLocaleDateString(locale, { weekday: 'short' }).replace('.', '')}
                </Text>
              </View>
              <View style={{ height: layout.iconButton, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={[typography.stat, { color: number }]}>{d.getDate()}</Text>
              </View>
            </View>
            <Dots colors={dotsFor(d)} ring={colors.bg} />
          </Pressable>
        );
      })}
    </Animated.View>
    </View>
  );
}

/** Card piatta di un evento (dec. 157-158), icone piene: icona del tipo nel suo riquadro tinto, titolo, orario con l'orologio e, a capo, l'aula. */
function EventCard({ item, onPress }: { item: DemoAgendaItem; onPress?: () => void }) {
  const { colors, typography, radius, spacing } = useTheme();
  const tint = colors.tints[item.kind];
  const time = `${item.start} – ${item.end}`;
  const line = (icon: IconName, text: string) => (
    <View style={[styles.row, { gap: spacing.xs }]}>
      <Icon name={icon} size={14} color={colors.textTertiary} />
      <Text style={[typography.time, { flex: 1, color: colors.textSecondary }]} numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
  // Un tocco non fa niente; tenendo premuto si apre la modifica (dec. 195, prima bastava un tocco, dec. 186).
  return (
    <Pressable
      onLongPress={onPress}
      delayLongPress={350}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityHint={onPress ? t.agenda.holdToEdit : undefined}
      accessibilityActions={onPress ? [{ name: 'activate' }, { name: 'longpress' }] : undefined}
      onAccessibilityAction={onPress ? () => onPress() : undefined}
      accessibilityLabel={[t.agenda.kind[item.kind], item.title, time, item.meta, item.locked && t.agenda.teacherTimetable].filter(Boolean).join(', ')}
      style={({ pressed }) => ({ flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, backgroundColor: colors.surface, borderRadius: radius.xl, opacity: pressed ? 0.75 : 1 })}
    >
      <View style={{ width: 40, height: 40, borderRadius: radius.lg, backgroundColor: tint.bg, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={KIND_ICON[item.kind]} size={20} color={tint.fg} />
      </View>
      <View style={{ flex: 1, gap: spacing.xxs }}>
        <Text style={[typography.headline, { color: colors.text }]} numberOfLines={2}>
          {item.title}
        </Text>
        {line('time', time)}
        {item.meta ? line('location', item.meta) : null}
      </View>
      {item.locked && <Icon name="lock-closed" size={14} color={colors.textTertiary} accessibilityLabel={t.agenda.teacherTimetable} />}
    </Pressable>
  );
}

const RAIL = 72;
const minutes = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));

/** Ora attuale, aggiornata ogni 30 secondi, per far avanzare la linea del tempo e "Ora". */
function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);
  return now;
}

/**
 * Eventi del giorno in verticale (dec. 151, 157): l'ora d'inizio sta sulla linea del tempo, accanto la card.
 * Fra un orario e l'altro sempre GAP_DOTS pallini (dec. 206), mai sotto le pillole: verdi se quel momento è passato, grigi se no.
 * Solo gli eventi con orario.
 */
export function DayTimeline<T extends DemoAgendaItem>({ items, day, onOpen }: { items: T[]; day: Date; onOpen?: (item: T) => void }) {
  const { colors, typography, spacing, radius } = useTheme();
  const now = useNow();
  const [centers, setCenters] = useState<number[]>([]);
  const [heights, setHeights] = useState<number[]>([]);
  const timed = items.filter((i) => i.start && i.end).sort((a, b) => a.start!.localeCompare(b.start!));
  const starts = timed.map((i) => minutes(i.start!));

  const d0 = new Date(day).setHours(0, 0, 0, 0);
  const t0 = new Date(now).setHours(0, 0, 0, 0);
  const nowMin = d0 < t0 ? Infinity : d0 > t0 ? -Infinity : now.getHours() * 60 + now.getMinutes();

  const ready = centers.length === timed.length && centers.every((c) => c !== undefined);
  // Riga dell'impegno in corso: sulla linea, al posto dell'orario, la pillola "Ora" che scende col tempo (dec. 195).
  const liveIdx = timed.findIndex((it, i) => nowMin >= starts[i] && nowMin < minutes(it.end!));
  const liveP = liveIdx >= 0 ? Math.max(0, Math.min(1, (nowMin - starts[liveIdx]) / (minutes(timed[liveIdx].end!) - starts[liveIdx]))) : 0;
  const liveTop = liveIdx >= 0 ? centers[liveIdx] - (heights[liveIdx] ?? 0) / 2 : 0;
  const nowPillTop = liveP * ((heights[liveIdx] ?? PILL_H) - PILL_H);
  // Ciò che sta sulla linea in ogni riga (pillola dell'orario o "Ora"): centro e momento che rappresenta.
  const railAt = (i: number) => (i === liveIdx ? { y: liveTop + nowPillTop + PILL_H / 2, min: nowMin } : { y: centers[i], min: starts[i] });
  const gapDots: { y: number; on: boolean }[] = [];
  const addGap = (top: number, bottom: number, from: number, to: number) => {
    for (let k = 1; k <= GAP_DOTS; k++) {
      const f = k / (GAP_DOTS + 1);
      // Ogni pallino è un momento fra i due orari: verde quando è passato, grigio prima (dec. 206).
      gapDots.push({ y: top + (bottom - top) * f, on: nowMin >= from + (to - from) * f });
    }
  };
  if (ready) {
    for (let i = 0; i < timed.length - 1; i++) {
      const a = railAt(i);
      const b = railAt(i + 1);
      addGap(a.y + PILL_HALF, b.y - PILL_HALF, a.min, b.min);
    }
    // Alba in cima e tramonto in fondo (dec. 208): 4 pallini anche fra loro e il primo e l'ultimo orario, come inizio e fine giornata.
    const a = railAt(0);
    addGap(EDGE_ICON + 6, a.y - PILL_HALF, 0, a.min);
    const last = timed.length - 1;
    const z = railAt(last);
    addGap(z.y + PILL_HALF, z.y + PILL_HALF + EDGE_GAP, z.min, 24 * 60);
  }
  // Il tramonto sta sempre alla stessa distanza dall'ultimo orario, anche se l'ultima card è bassa.
  const lastI = timed.length - 1;
  const sunsetTop = ready ? railAt(lastI).y + PILL_HALF + EDGE_GAP + 6 : 0;
  const lastBottom = ready ? centers[lastI] + (heights[lastI] ?? 0) / 2 : 0;

  return (
    <View style={{ gap: spacing.md, paddingTop: EDGE, paddingBottom: ready ? Math.max(0, sunsetTop + EDGE_ICON - lastBottom) : EDGE }}>
      {ready && (
        <>
          <View style={{ position: 'absolute', top: 0, left: RAIL / 2 - EDGE_ICON / 2 }} accessible={false}>
            <Icon name="sunrise" size={EDGE_ICON} color={colors.warningIcon} />
          </View>
          <View style={{ position: 'absolute', top: sunsetTop, left: RAIL / 2 - EDGE_ICON / 2 }} accessible={false}>
            <Icon name="sunset" size={EDGE_ICON} color={colors.dangerIcon} />
          </View>
        </>
      )}
      {gapDots.map(({ y, on }, k) => (
        <View
          key={k}
          style={{ position: 'absolute', left: RAIL / 2 - DOT / 2, top: y - DOT / 2, width: DOT, height: DOT, borderRadius: DOT / 2, backgroundColor: on ? NOW_GREEN : colors.textDisabled }}
        />
      ))}
      {timed.map((item, i) => {
        const reached = nowMin >= starts[i];
        // Impegno in corso: al posto dell'orario la colonna di pallini verdi con "Ora" (dec. 195).
        const endMin = minutes(item.end!);
        const live = reached && nowMin < endMin;
        return (
          <View
            key={item.id}
            // In corso: la riga si allunga, così la fila di pallini e "Ora" hanno spazio per scendere.
            style={[styles.row, { gap: spacing.sm }, live && { minHeight: 132, alignItems: 'stretch' }]}
            onLayout={(e) => {
              const { y, height } = e.nativeEvent.layout;
              setCenters((c) => {
                const n = [...c];
                n[i] = y + height / 2;
                return n;
              });
              setHeights((h) => {
                const n = [...h];
                n[i] = height;
                return n;
              });
            }}
          >
            {live && heights[i] ? (
              <NowRail height={heights[i]} pillTop={nowPillTop} />
            ) : (
            <View style={{ width: RAIL, alignItems: 'center' }}>
              <View
                style={{
                  paddingHorizontal: spacing.sm,
                  paddingVertical: spacing.xxs,
                  borderRadius: radius.pill,
                  borderWidth: 2,
                  borderColor: reached ? NOW_GREEN : colors.border,
                  backgroundColor: reached ? NOW_GREEN : colors.bg,
                }}
              >
                <Text style={[typography.time, { color: reached ? '#fff' : colors.textSecondary }]} numberOfLines={1}>{item.start}</Text>
              </View>
            </View>
            )}
            <EventCard item={item} onPress={onOpen ? () => onOpen(item) : undefined} />
          </View>
        );
      })}
    </View>
  );
}

/** Verde acceso di sistema (iOS systemGreen), come lo screen di riferimento (dec. 206). */
const NOW_GREEN = '#34C759';
const GAP_DOTS = 4;
/** Icone di alba e tramonto a capo e in fondo alla linea, e lo spazio che lasciano sopra e sotto le righe. */
const EDGE_ICON = 26;
const EDGE = 52;
/** Spazio dei 4 pallini fra l'ultimo orario e il tramonto. */
const EDGE_GAP = 56;
/** Metà altezza della pillola dell'orario (riga 20 + padding 2×2 + bordo 2×2), più un po' d'aria. */
const PILL_HALF = 14 + 4;
const DOT = 6;
const PILL_H = 24;

/** Impegno in corso (dec. 195, 206): nella colonna dell'orario la pillola "Ora", che scende col tempo; i pallini attorno li disegna DayTimeline. */
function NowRail({ height, pillTop }: { height: number; pillTop: number }) {
  const { typography, radius } = useTheme();
  return (
    <View style={{ width: RAIL, height, alignItems: 'center' }} accessible accessibilityLabel={t.agenda.now}>
      <View style={{ position: 'absolute', top: pillTop, height: PILL_H, paddingHorizontal: 12, borderRadius: radius.pill, justifyContent: 'center', backgroundColor: NOW_GREEN }}>
        <Text style={[typography.caption, { color: '#fff', fontWeight: '700' }]}>{t.agenda.now}</Text>
      </View>
    </View>
  );
}

/** Pallini sovrapposti delle materie di un giorno (al massimo 4), bordati del colore del fondo. */
function Dots({ colors: list, ring }: { colors: string[]; ring: string }) {
  const { radius } = useTheme();
  return (
    <View style={[styles.row, { height: 14 }]}>
      {list.slice(0, 4).map((c, i) => (
        <View key={c} style={{ width: 14, height: 14, borderRadius: radius.pill, backgroundColor: c, borderWidth: 2, borderColor: ring, marginLeft: i ? -5 : 0 }} />
      ))}
    </View>
  );
}

const CELL = 60;
const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const addMonths = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth() + n, 1);
const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
const cap = (x: string) => x.charAt(0).toLocaleUpperCase(locale) + x.slice(1);

/** Giorni da mostrare nella griglia del mese, settimane da lunedì: `null` per le caselle vuote prima del primo. */
function monthCells(month: Date) {
  const lead = (month.getDay() + 6) % 7;
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  return [...Array<null>(lead).fill(null), ...Array.from({ length: days }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1))];
}

/**
 * Calendario dell'Agenda (dec. 163), dall'icona in alto a sinistra. Una card dal basso con il mese: giorni da
 * lunedì, pallini delle materie, oggi in viola e il giorno scelto nel cerchio pieno. Toccando il titolo si
 * scelgono mese e anno; scorrendo di lato si cambia mese (o giorno, nella pagina del giorno). Toccando un giorno la
 * card si allarga verso l'alto e mostra la pagina del giorno, senza cambiare il giorno scelto nell'Agenda (dec. 164).
 * Parte dal bordo in basso come un foglio di sistema e trascinandola giù si chiude.
 */
export function CalendarSheet({
  visible,
  selected,
  onClose,
  itemsOf,
  dotsFor,
}: {
  visible: boolean;
  selected: Date;
  onClose: () => void;
  itemsOf: (d: Date) => DemoAgendaItem[];
  dotsFor: (d: Date) => string[];
}) {
  const { colors, typography, spacing, radius, layout, motion } = useTheme();
  const insets = useSafeAreaInsets();
  const { height: screenH } = useWindowDimensions();
  const [month, setMonth] = useState(() => startOfMonth(selected));
  const [picking, setPicking] = useState(false);
  const [day, setDay] = useState<Date | null>(null);
  const slide = useRef(new Animated.Value(1)).current; // 0 dentro, 1 fuori dallo schermo
  const drag = useRef(new Animated.Value(0)).current; // trascinamento verso il basso
  const size = useRef(new Animated.Value(0)).current; // altezza della card
  const dayRef = useRef(day);
  dayRef.current = day;
  // La pagina del giorno scorre: in cima, trascinare giù chiude la card invece di far rimbalzare la lista.
  const atTop = useRef(true);
  // Altezza dell'area della pagina del giorno e del suo contenuto: la ScrollView c'è solo se non ci sta.
  const [listH, setListH] = useState(0);
  const [contentH, setContentH] = useState(0);
  const overflow = contentH > listH + 1;
  useEffect(() => {
    atTop.current = true;
  }, [day]);

  const cells = monthCells(month);
  const rows = Math.ceil(cells.length / 7);
  const gap = spacing.sm;
  // Maniglia + header 56 + giorni della settimana 32 + righe + margini interni + zona della home indicator.
  const monthH = spacing.lg + 56 + 32 + (picking ? 4 * 56 + 48 : rows * CELL) + spacing.lg + insets.bottom;
  const fullH = screenH - insets.top - gap;
  const targetH = day ? fullH : Math.min(monthH, fullH);

  useEffect(() => {
    tabSwipeLock.current = visible;
    if (!visible) return;
    setMonth(startOfMonth(selected));
    setDay(null);
    setPicking(false);
    drag.setValue(0);
    Animated.timing(slide, { toValue: 0, duration: motion.long, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    Animated.timing(size, { toValue: targetH, duration: motion.long, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [visible, targetH, size, motion.long]);

  const close = () =>
    Animated.timing(slide, { toValue: 1, duration: motion.medium, easing: Easing.in(Easing.cubic), useNativeDriver: true }).start(() => onClose());

  // Come un foglio di sistema: trascinando in basso la card segue il dito e oltre una soglia si chiude.
  // Di lato: nel mese si cambia mese, nella pagina del giorno si va al giorno prima o dopo.
  const pan = useMemo(() => {
    const vertical = (dx: number, dy: number) => dy > 10 && dy > Math.abs(dx) * 1.5;
    const sideways = (dx: number, dy: number) => Math.abs(dx) > 16 && Math.abs(dx) > Math.abs(dy) * 2;
    let mode: 'down' | 'side' | null = null;
    return PanResponder.create({
      // La direzione si decide qui: nel grant lo spostamento può essere ancora zero.
      onMoveShouldSetPanResponder: (_, g) => {
        mode = vertical(g.dx, g.dy) ? 'down' : sideways(g.dx, g.dy) ? 'side' : null;
        return mode !== null;
      },
      // Prima della lista: se è in cima, il trascinamento verso il basso è della card.
      onMoveShouldSetPanResponderCapture: (_, g) => {
        if (!atTop.current || !vertical(g.dx, g.dy)) return false;
        mode = 'down';
        return true;
      },
      onPanResponderTerminationRequest: () => mode !== 'down',
      // Se nessun pulsante della card vuole il tocco lo prende la card stessa, dall'inizio: altrimenti lo prende un
      // contenitore sopra di lei (lista o cambio scheda) e la card non viene più consultata per il trascinamento.
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, g) => {
        if (mode === null) mode = vertical(g.dx, g.dy) ? 'down' : sideways(g.dx, g.dy) ? 'side' : null;
        if (mode === 'down') drag.setValue(Math.max(0, g.dy));
      },
      onPanResponderRelease: (_, g) => {
        if (mode === 'down') {
          if (g.dy > 120 || g.vy > 0.8) close();
          else Animated.spring(drag, { toValue: 0, useNativeDriver: true, bounciness: 0 }).start();
        } else if (Math.abs(g.dx) >= 50) {
          tap();
          const step = g.dx < 0 ? 1 : -1;
          if (dayRef.current) setDay(addDays(dayRef.current, step));
          else setMonth((m) => addMonths(m, step));
        }
        mode = null;
      },
      onPanResponderTerminate: () => {
        mode = null;
        Animated.spring(drag, { toValue: 0, useNativeDriver: true, bounciness: 0 }).start();
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const weekdays = Array.from({ length: 7 }, (_, i) => cap(new Date(2024, 0, 1 + i).toLocaleDateString(locale, { weekday: 'short' }).replace('.', '')));
  const monthName = cap(month.toLocaleDateString(locale, { month: 'long' }));
  const today = new Date();
  const showToday = !picking && !sameDay(startOfMonth(today), month);

  const roundBtn = (icon: IconName, label: string, onPress: () => void) => (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      // Solo l'icona, senza cerchio, come tutti i pulsanti a icona dell'app (dec. 173-174).
      style={({ pressed }) => ({ width: layout.iconButton, height: layout.iconButton, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.5 : 1 })}
    >
      <Icon name={icon} size={icon === 'close' || icon === 'chevron-back' ? 28 : 26} color={colors.text} />
    </Pressable>
  );

  const monthView = (
    <>
      <View style={[styles.row, { height: 56, gap: spacing.sm }]}>
        <Pressable
          onPress={() => setPicking((p) => !p)}
          accessibilityRole="button"
          accessibilityLabel={`${t.agenda.pickMonth}: ${monthName} ${month.getFullYear()}`}
          accessibilityState={{ expanded: picking }}
          style={({ pressed }) => [styles.row, { flex: 1, gap: spacing.xs, opacity: pressed ? 0.6 : 1 }]}
        >
          {/* Con "Oggi" accanto i mesi lunghi ("Settembre 2026") non ci stanno a 20: il titolo scende di 3 punti. */}
          <Text style={[typography.title2, { flexShrink: 1, color: colors.text }, showToday && { fontSize: typography.title2.fontSize - 3 }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
            {monthName} <Text style={{ color: colors.accent }}>{month.getFullYear()}</Text>
          </Text>
          <Icon name={picking ? 'chevron-down' : 'chevron-forward'} size={22} color={colors.accent} strokeWidth={2.5} />
        </Pressable>
        {showToday && (
          <Pressable
            onPress={() => {
              tap();
              setMonth(startOfMonth(today));
            }}
            accessibilityRole="button"
            style={({ pressed }) => ({ height: 36, paddingHorizontal: spacing.md, borderRadius: radius.pill, justifyContent: 'center', backgroundColor: colors.selected, opacity: pressed ? 0.7 : 1 })}
          >
            <Text style={[typography.callout, { fontWeight: '600', color: colors.selectedText }]}>{t.agenda.today}</Text>
          </Pressable>
        )}
        {roundBtn('close', t.agenda.close, close)}
      </View>

      {picking ? (
        <View style={{ gap: spacing.md }}>
          <View style={[styles.row, { justifyContent: 'space-between', height: 48 }]}>
            {roundBtn('chevron-left', t.agenda.prevYear, () => setMonth((m) => new Date(m.getFullYear() - 1, m.getMonth(), 1)))}
            <Text style={[typography.title2, { color: colors.text }]}>{month.getFullYear()}</Text>
            {roundBtn('chevron-right', t.agenda.nextYear, () => setMonth((m) => new Date(m.getFullYear() + 1, m.getMonth(), 1)))}
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: spacing.sm }}>
            {Array.from({ length: 12 }, (_, i) => {
              const on = i === month.getMonth();
              return (
                <Pressable
                  key={i}
                  onPress={() => {
                    tap();
                    setMonth(new Date(month.getFullYear(), i, 1));
                    setPicking(false);
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  style={{ width: '33.333%', alignItems: 'center' }}
                >
                  <View style={{ height: 48, minWidth: 88, paddingHorizontal: spacing.md, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? colors.accent : 'transparent' }}>
                    <Text style={[typography.callout, { fontWeight: '600', color: on ? colors.onAccent : colors.text }]}>
                      {cap(new Date(2024, i, 1).toLocaleDateString(locale, { month: 'short' }).replace('.', ''))}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : (
        <View
          accessible
          accessibilityLabel={`${monthName} ${month.getFullYear()}`}
          accessibilityActions={[{ name: 'increment', label: t.agenda.nextMonth }, { name: 'decrement', label: t.agenda.prevMonth }]}
          onAccessibilityAction={(e) => setMonth((m) => addMonths(m, e.nativeEvent.actionName === 'increment' ? 1 : -1))}
        >
          <View style={[styles.row, { height: 32 }]}>
            {weekdays.map((w) => (
              <Text key={w} style={[typography.callout, { flex: 1, textAlign: 'center', color: colors.textSecondary }]}>
                {w}
              </Text>
            ))}
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {cells.map((d, i) => {
              if (!d) return <View key={`e${i}`} style={{ width: '14.2857%', height: CELL }} />;
              const isSel = sameDay(d, selected);
              const isToday = sameDay(d, today);
              return (
                <Pressable
                  key={d.getDate()}
                  onPress={() => {
                    tap();
                    setDay(d);
                  }}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSel }}
                  accessibilityLabel={d.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })}
                  style={{ width: '14.2857%', height: CELL, alignItems: 'center', gap: spacing.xxs }}
                >
                  <View style={{ width: layout.dayCell, height: layout.dayCell, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: isSel ? colors.accent : 'transparent' }}>
                    <Text style={[typography.stat, { fontSize: 20, color: isSel ? colors.onAccent : isToday ? colors.accent : colors.text }]}>{d.getDate()}</Text>
                  </View>
                  <Dots colors={dotsFor(d)} ring={colors.surfaceOverlay} />
                </Pressable>
              );
            })}
          </View>
        </View>
      )}
    </>
  );

  const dayContent = day && (
    <>
      {/* Il numero del giorno al centro, come il giorno della Home (dec. 150). */}
      <View style={{ alignItems: 'center', gap: spacing.xs }}>
        <Text accessibilityRole="header" style={{ fontFamily: fonts.heading, fontSize: 52, lineHeight: 60, paddingHorizontal: spacing.xs, color: sameDay(day, today) ? colors.accent : colors.text }}>
          {day.getDate()}
        </Text>
        <Text style={[typography.body, { fontSize: 18, color: colors.textSecondary }]}>
          {`${cap(day.toLocaleDateString(locale, { weekday: 'long' }))}, ${day.toLocaleDateString(locale, { month: 'long', year: 'numeric' })}`}
        </Text>
      </View>
      {itemsOf(day).length === 0 ? <EmptyState icon="sunny" message={t.agenda.empty} /> : <DayTimeline items={itemsOf(day)} day={day} />}
    </>
  );

  const dayView = day && (
    <>
      <View style={[styles.row, { height: 56, justifyContent: 'space-between' }]}>
        {roundBtn('chevron-back', t.agenda.backToMonth, () => {
          setMonth(startOfMonth(day));
          setDay(null);
        })}
        {roundBtn('close', t.agenda.close, close)}
      </View>
      {/* Su iOS una ScrollView, anche ferma, si prende i trascinamenti della card: c'è solo se gli impegni non
          ci stanno. Altrimenti è una vista normale, come quella del mese, e trascinando giù la card si chiude. */}
      <View style={{ flex: 1 }} onLayout={(e) => setListH(e.nativeEvent.layout.height)}>
        {overflow ? (
          <ScrollView
            key={day.toDateString()}
            alwaysBounceVertical={false}
            onContentSizeChange={(_, h) => setContentH(h)}
            // Con la lista lunga si chiude tirandola giù oltre la cima.
            onScrollEndDrag={(e) => {
              if (e.nativeEvent.contentOffset.y < -60) close();
            }}
            contentContainerStyle={{ gap: spacing.lg, paddingBottom: spacing.xl }}
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={(e) => {
              atTop.current = e.nativeEvent.contentOffset.y <= 0;
            }}
          >
            {dayContent}
          </ScrollView>
        ) : (
          <View style={{ gap: spacing.lg, paddingBottom: spacing.xl }} onLayout={(e) => setContentH(e.nativeEvent.layout.height)}>
            {dayContent}
          </View>
        )}
      </View>
    </>
  );

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={day ? () => setDay(null) : close} statusBarTranslucent>
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: '#000', opacity: slide.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0] }) }]}>
        <Pressable style={{ flex: 1 }} onPress={close} accessibilityRole="button" accessibilityLabel={t.agenda.close} />
      </Animated.View>
      <Animated.View
        pointerEvents="box-none"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          transform: [{ translateY: Animated.add(slide.interpolate({ inputRange: [0, 1], outputRange: [0, screenH] }), drag) }],
        }}
      >
        <Animated.View
          {...pan.panHandlers}
          accessibilityViewIsModal
          style={{
            height: size,
            overflow: 'hidden',
            paddingHorizontal: spacing.lg,
            paddingBottom: insets.bottom,
            backgroundColor: day ? colors.bg : colors.surfaceOverlay,
            borderTopLeftRadius: radius.xxl * 2,
            borderTopRightRadius: radius.xxl * 2,
            boxShadow: colors.shadowOverlay,
          }}
        >
          {/* Maniglia, come i fogli di sistema (Messaggi, Notifiche). */}
          <View style={{ height: spacing.lg, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: 36, height: 5, borderRadius: radius.pill, backgroundColor: colors.borderBold, opacity: 0.5 }} />
          </View>
          {/* Pagina del giorno sul fondo dello schermo, così le card degli eventi si staccano come nell'Agenda. */}
          {day ? dayView : monthView}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
});
