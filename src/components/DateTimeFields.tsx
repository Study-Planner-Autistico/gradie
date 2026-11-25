// Giorno e orari dell'impegno come nel Calendario di Apple (dec. 198): una riga con l'etichetta a sinistra e il valore
// in una pillola grigia a destra; toccandola si apre sotto il calendario del mese (giorno) o due rotelle, ore 00-23
// e minuti 00-55 (orario). Con la tastiera si può anche scrivere l'orario: i due punti compaiono da soli.
import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { Platform, Pressable, ScrollView, Text, TextInput, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { locale, t } from '../i18n';
import { fromYmd, ymd } from '../state/agenda';
import { useTheme } from '../theme';
import { tap } from './haptics';
import { Icon } from './icons';

/** Riga "Etichetta ......... [valore]"; il valore è una pillola che apre il selettore. */
export function FieldRow({ label, value, open, onPress, accessibilityLabel }: { label: string; value: string; open: boolean; onPress: () => void; accessibilityLabel?: string }) {
  const { colors, typography, radius, spacing } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', minHeight: 48, gap: spacing.md }}>
      <Text style={[typography.body, { flex: 1, color: colors.text }]}>{label}</Text>
      <Pressable
        onPress={() => {
          tap();
          onPress();
        }}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={accessibilityLabel ?? `${label}: ${value}`}
        style={({ pressed }) => ({ minHeight: 36, paddingHorizontal: spacing.md, borderRadius: radius.md, justifyContent: 'center', backgroundColor: colors.surfaceMuted, opacity: pressed ? 0.7 : 1 })}
      >
        <Text style={[typography.headline, { color: open ? colors.accent : colors.text, fontVariant: ['tabular-nums'] }]}>{value}</Text>
      </Pressable>
    </View>
  );
}

const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const cap = (x: string) => x.charAt(0).toLocaleUpperCase(locale) + x.slice(1);

/** Calendario del mese, settimane da lunedì: il giorno scelto nel cerchio pieno, oggi in viola. */
export function MonthCalendar({ value, onChange, min }: { value: string; onChange: (ymd: string) => void; min?: string }) {
  const { colors, typography, radius, spacing } = useTheme();
  const [month, setMonth] = useState(() => startOfMonth(fromYmd(value)));
  const lead = (month.getDay() + 6) % 7;
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [...Array<null>(lead).fill(null), ...Array.from({ length: days }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1))];
  const today = ymd(new Date());
  // Lunedì 1 gennaio 2024: da lì le iniziali dei giorni nella lingua dell'app.
  const weekdays = Array.from({ length: 7 }, (_, i) => new Date(2024, 0, 1 + i).toLocaleDateString(locale, { weekday: 'narrow' }));
  const shift = (n: number) => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + n, 1));
  const arrow = (icon: 'chevron-left' | 'chevron-right', n: number, label: string) => (
    <Pressable
      onPress={() => {
        tap();
        shift(n);
      }}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      style={({ pressed }) => ({ width: 36, height: 36, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.5 : 1 })}
    >
      <Icon name={icon} size={20} color={colors.accent} />
    </Pressable>
  );
  return (
    <View style={{ gap: spacing.xs }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={[typography.headline, { flex: 1, color: colors.text }]}>{cap(month.toLocaleDateString(locale, { month: 'long', year: 'numeric' }))}</Text>
        {arrow('chevron-left', -1, t.agenda.prevMonth)}
        {arrow('chevron-right', 1, t.agenda.nextMonth)}
      </View>
      <View style={{ flexDirection: 'row' }}>
        {weekdays.map((w, i) => (
          <Text key={i} style={[typography.caption, { flex: 1, textAlign: 'center', color: colors.textTertiary, fontWeight: '600' }]}>
            {w.toLocaleUpperCase(locale)}
          </Text>
        ))}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {cells.map((d, i) => {
          if (!d) return <View key={`e${i}`} style={{ width: `${100 / 7}%`, height: 40 }} />;
          const key = ymd(d);
          const on = key === value;
          const isToday = key === today;
          const off = !!min && key < min;
          return (
            <Pressable
              key={key}
              disabled={off}
              onPress={() => {
                tap();
                onChange(key);
              }}
              accessibilityRole="button"
              accessibilityState={{ selected: on, disabled: off }}
              accessibilityLabel={d.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })}
              style={{ width: `${100 / 7}%`, height: 40, alignItems: 'center', justifyContent: 'center' }}
            >
              <View style={{ width: 34, height: 34, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? colors.accent : 'transparent' }}>
                <Text style={[typography.body, { color: on ? colors.onAccent : off ? colors.textTertiary : isToday ? colors.accent : colors.text, fontWeight: on || isToday ? '700' : '400' }]}>{d.getDate()}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const ITEM = 40;
const VISIBLE = 5;

/** Rotella verticale che si ferma su un valore; quello al centro è lo scelto. */
function Wheel({ values, index, onIndex, label }: { values: string[]; index: number; onIndex: (i: number) => void; label: string }) {
  const { colors, typography } = useTheme();
  const ref = useRef<ComponentRef<typeof ScrollView>>(null);
  const y = useRef(index * ITEM);
  const moving = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [shown, setShown] = useState(index);

  // Valore cambiato da fuori (tastiera, inizio che sposta la fine): la rotella lo raggiunge.
  useEffect(() => {
    if (moving.current) return;
    setShown(index);
    if (Math.round(y.current / ITEM) !== index) ref.current?.scrollTo({ y: index * ITEM, animated: true });
  }, [index]);

  const settle = () => {
    moving.current = false;
    const i = Math.max(0, Math.min(values.length - 1, Math.round(y.current / ITEM)));
    ref.current?.scrollTo({ y: i * ITEM, animated: true });
    if (i !== index) {
      tap();
      onIndex(i);
    }
  };
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    y.current = e.nativeEvent.contentOffset.y;
    moving.current = true;
    setShown(Math.max(0, Math.min(values.length - 1, Math.round(y.current / ITEM))));
    // Sul web non c'è la fine dello scorrimento: si aspetta che si fermi.
    if (Platform.OS === 'web') {
      clearTimeout(timer.current);
      timer.current = setTimeout(settle, 140);
    }
  };

  return (
    <View
      style={{ flex: 1, height: ITEM * VISIBLE }}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ text: values[index] }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => {
        const n = e.nativeEvent.actionName === 'increment' ? 1 : -1;
        onIndex(Math.max(0, Math.min(values.length - 1, index + n)));
      }}
    >
      <ScrollView
        ref={ref}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM}
        decelerationRate="fast"
        scrollEventThrottle={16}
        onScroll={onScroll}
        onMomentumScrollEnd={Platform.OS === 'web' ? undefined : settle}
        onScrollEndDrag={(e) => {
          // Rilasciata senza slancio: su iOS/Android non arriva la fine del momento.
          if (Platform.OS !== 'web' && (e.nativeEvent.velocity?.y ?? 0) === 0) settle();
        }}
        onLayout={() => ref.current?.scrollTo({ y: index * ITEM, animated: false })}
        contentContainerStyle={{ paddingVertical: ITEM * Math.floor(VISIBLE / 2) }}
      >
        {values.map((v, i) => (
          <Pressable
            key={v}
            onPress={() => {
              y.current = i * ITEM;
              settle();
            }}
            style={{ height: ITEM, alignItems: 'center', justifyContent: 'center' }}
            importantForAccessibility="no"
          >
            <Text style={[typography.title2, { color: i === shown ? colors.text : colors.textTertiary, fontVariant: ['tabular-nums'], fontWeight: i === shown ? '700' : '400' }]}>{v}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));

/** Cifre scritte → "HH:MM" mentre si scrive: "15" → "15:", "153" → "15:3"; un'ora da 3 a 9 diventa "0x:". */
export function maskTime(next: string, prev: string) {
  let d = next.replace(/\D/g, '').slice(0, 4);
  // Cancellando subito dopo i due punti si toglie anche l'ultima cifra dell'ora.
  if (next.length < prev.length && prev.endsWith(':') && !next.includes(':')) d = d.slice(0, 1);
  if (d.length === 1 && Number(d) > 2) d = `0${d}`;
  return d.length >= 2 ? `${d.slice(0, 2)}:${d.slice(2)}` : d;
}

/** "15:3" → 15:30, "24:00" → 00:00 (mezzanotte), "00:0" → 00:00; null se non è un orario. */
export function parseMasked(s: string): string | null {
  const d = s.replace(/\D/g, '');
  if (d.length < 2) return null;
  let h = Number(d.slice(0, 2));
  const mm = d.slice(2);
  const m = mm.length === 0 ? 0 : mm.length === 1 ? Number(mm) * 10 : Number(mm);
  if (h === 24 && m === 0) h = 0;
  if (h > 23 || m > 59) return null;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/** Due rotelle (ore e minuti) e, a destra, la tastiera per scrivere l'orario. */
export function TimeWheels({ value, onChange, label }: { value: string; onChange: (hhmm: string) => void; label: string }) {
  const { colors, typography, radius, spacing } = useTheme();
  const h = Number(value.slice(0, 2));
  const m = Number(value.slice(3, 5));
  const [typing, setTyping] = useState(false);
  const [text, setText] = useState('');
  const [bad, setBad] = useState(false);
  const commit = (s: string) => {
    const v = parseMasked(s);
    if (v) {
      onChange(v);
      setTyping(false);
      setBad(false);
    } else setBad(true);
  };

  return (
    <View style={{ gap: spacing.sm }}>
      {typing ? (
        <TextInput
          value={text}
          autoFocus
          keyboardType="number-pad"
          returnKeyType="done"
          maxLength={5}
          placeholder="--:--"
          placeholderTextColor={colors.textTertiary}
          accessibilityLabel={label}
          onChangeText={(s) => {
            const next = maskTime(s, text);
            setText(next);
            setBad(false);
            if (next.length === 5) commit(next);
          }}
          onSubmitEditing={() => commit(text)}
          onBlur={() => (text ? commit(text) : setTyping(false))}
          style={[
            typography.title1,
            { textAlign: 'center', color: colors.text, height: 56, borderRadius: radius.lg, borderWidth: 2, borderColor: bad ? colors.danger : colors.accent, fontVariant: ['tabular-nums'], padding: 0 },
          ]}
        />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {/* Banda grigia al centro, come le rotelle di iOS. */}
          <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 48, top: ITEM * 2, height: ITEM, borderRadius: radius.md, backgroundColor: colors.surfaceMuted }} />
          <Wheel values={HOURS} index={h} onIndex={(i) => onChange(`${HOURS[i]}:${value.slice(3, 5)}`)} label={t.agenda.editor.hours} />
          <Text style={[typography.title2, { color: colors.text }]}>:</Text>
          <Wheel values={MINUTES} index={Math.min(11, Math.round(m / 5))} onIndex={(i) => onChange(`${value.slice(0, 2)}:${MINUTES[i]}`)} label={t.agenda.editor.minutes} />
          <Pressable
            onPress={() => {
              tap();
              setText('');
              setTyping(true);
            }}
            accessibilityRole="button"
            accessibilityLabel={t.agenda.editor.typeTime(label)}
            style={({ pressed }) => ({ width: 44, height: 44, marginLeft: 4, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceMuted, opacity: pressed ? 0.6 : 1 })}
          >
            <Icon name="keyboard-outline" size={20} color={colors.text} />
          </Pressable>
        </View>
      )}
      {typing && <Text style={[typography.caption, { color: bad ? colors.danger : colors.textSecondary, textAlign: 'center' }]}>{bad ? t.agenda.editor.badTime : t.agenda.editor.typeHint}</Text>}
    </View>
  );
}
