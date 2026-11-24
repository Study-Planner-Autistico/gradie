// Creazione e modifica degli impegni dell'Agenda (dec. 186): lezione (anche ogni settimana), scadenza, blocco di studio.
// Riepilogo delle cose senza orario di un giorno e importazione dai calendari del telefono.
import { useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { locale, t } from '../i18n';
import {
  addDaysYmd,
  addItems,
  conflictsOf,
  fromMin,
  fromYmd,
  getAgenda,
  newAgendaId,
  removeItem,
  semesterEnd,
  setAgenda,
  skipDay,
  toMin,
  updateItem,
  useAgenda,
  type AgendaItem,
  type AgendaKind,
  type Occurrence,
} from '../state/agenda';
import { calendarAvailable, listCalendars, readEvents, type DeviceCalendar } from '../state/deviceCalendar';
import { useSubjects } from '../state/subjects';
import { useTheme } from '../theme';
import { KIND_ICON } from './agenda';
import { tap } from './haptics';
import { Icon, type IconName } from './icons';
import { Button, TextField } from './ui';
import { showUndo } from './UndoToast';

type FormType = 'lesson' | 'deadline' | 'study' | 'other';
const TYPE_KIND: Record<Exclude<FormType, 'other'>, AgendaKind> = { lesson: 'lesson', deadline: 'activity', study: 'study' };
const typeOf = (k: AgendaKind): FormType => (k === 'lesson' ? 'lesson' : k === 'activity' ? 'deadline' : k === 'study' ? 'study' : 'other');
const DEADLINE_KINDS = ['homework', 'test', 'project'] as const;
const STEP = 15;

const dayLabel = (s: string) => fromYmd(s).toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' });
const shortDay = (s: string) => fromYmd(s).toLocaleDateString(locale, { day: 'numeric', month: 'short' });

/** Fine dell'anno scolastico: 10 giugno. */
function yearEnd(from: Date) {
  const y = from.getMonth() >= 8 ? from.getFullYear() + 1 : from.getFullYear();
  return `${y}-06-10`;
}

/** Foglio centrato con titolo, contenuto che scorre e pulsanti in fondo (come l'editor dei quaderni). */
function Sheet({ title, onClose, children, footer }: { title: string; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  const { colors, typography, radius, spacing } = useTheme();
  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <Pressable onPress={onClose} accessibilityLabel={t.a11y.close} style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', padding: spacing.lg }}>
          <Pressable style={{ alignSelf: 'center', width: '100%', maxWidth: 480, maxHeight: '92%', borderRadius: radius.xxl, backgroundColor: colors.surface, boxShadow: colors.shadowOverlay, overflow: 'hidden' }}>
            <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }} keyboardShouldPersistTaps="handled">
              <Text style={[typography.title2, { color: colors.text }]} accessibilityRole="header">
                {title}
              </Text>
              {children}
            </ScrollView>
            {footer && <View style={{ padding: spacing.lg, paddingTop: spacing.sm, gap: spacing.sm }}>{footer}</View>}
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function Label({ children }: { children: string }) {
  const { colors, typography } = useTheme();
  return <Text style={[typography.overline, { color: colors.textSecondary }]}>{children}</Text>;
}

/** Pillole a scelta singola. */
function Pills<T extends string>({ value, options, onChange, label }: { value: T | undefined; options: { v: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  const { colors, typography, radius, spacing } = useTheme();
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={label} style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
      {options.map((o) => {
        const on = o.v === value;
        return (
          <Pressable
            key={o.v}
            onPress={() => onChange(o.v)}
            accessibilityRole="radio"
            accessibilityState={{ checked: on }}
            style={({ pressed }) => ({ minHeight: 40, paddingHorizontal: spacing.md, justifyContent: 'center', borderRadius: radius.pill, backgroundColor: on ? colors.accent : colors.surfaceMuted, opacity: pressed ? 0.7 : 1 })}
          >
            <Text style={[typography.callout, { color: on ? colors.onAccent : colors.text, fontWeight: on ? '600' : '400' }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Valore con – e + ai lati (giorni, orari): niente rotelle, si tocca e basta. */
function Stepper({ label, value, onMinus, onPlus }: { label: string; value: string; onMinus: () => void; onPlus: () => void }) {
  const { colors, typography, radius, spacing } = useTheme();
  const btn = (icon: IconName, a11y: string, onPress: () => void) => (
    <Pressable
      onPress={() => {
        tap();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={a11y}
      style={({ pressed }) => ({ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceMuted, opacity: pressed ? 0.6 : 1 })}
    >
      <Icon name={icon} size={20} color={colors.text} />
    </Pressable>
  );
  return (
    <View style={{ flex: 1, gap: spacing.xs }}>
      <Label>{label}</Label>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, padding: spacing.xs, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border }}>
        {btn('chevron-left', t.agenda.editor.earlier(label), onMinus)}
        <Text style={[typography.headline, { flex: 1, textAlign: 'center', color: colors.text }]} numberOfLines={1} accessibilityLiveRegion="polite">
          {value}
        </Text>
        {btn('chevron-right', t.agenda.editor.later(label), onPlus)}
      </View>
    </View>
  );
}

function ToggleRow({ label, detail, value, onChange }: { label: string; detail?: string; value: boolean; onChange: (v: boolean) => void }) {
  const { colors, typography, spacing } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 48 }}>
      <View style={{ flex: 1 }}>
        <Text style={[typography.body, { color: colors.text }]}>{label}</Text>
        {detail && <Text style={[typography.caption, { color: colors.textTertiary }]}>{detail}</Text>}
      </View>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: colors.accent, false: colors.surfaceMuted }} thumbColor={colors.switchThumb} accessibilityLabel={label} />
    </View>
  );
}

export type EditorTarget = { mode: 'new'; date: string; type?: FormType } | { mode: 'edit'; occ: Occurrence };

/**
 * Nuovo impegno (pulsante +) o modifica (tocco su una card): si vede subito nel giorno scelto (dec. 186).
 * `onSaved` riceve il giorno su cui portare l'Agenda.
 */
export function AgendaEditor({ target, onClose, onSaved, onImport }: { target: EditorTarget; onClose: () => void; onSaved: (date: string) => void; onImport: () => void }) {
  const { colors, typography, radius, spacing } = useTheme();
  const subjects = useSubjects();
  const list = useAgenda();
  const E = t.agenda.editor;
  const editing = target.mode === 'edit' ? target.occ : null;
  const series = editing ? list.find((i) => i.id === editing.seriesId) : undefined;

  const [type, setType] = useState<FormType>(editing ? typeOf(editing.kind) : (target.mode === 'new' && target.type) || 'lesson');
  const [subject, setSubject] = useState<string | undefined>(editing?.subject);
  const [title, setTitle] = useState(editing?.title ?? '');
  const [meta, setMeta] = useState(editing?.meta ?? '');
  const [date, setDate] = useState(editing ? editing.date : target.mode === 'new' ? target.date : '');
  const [timed, setTimed] = useState(editing ? !!editing.start : type !== 'deadline');
  const [start, setStart] = useState(editing?.start ?? '15:00');
  const [end, setEnd] = useState(editing?.end ?? '16:00');
  const [repeat, setRepeat] = useState(editing ? !!series?.repeat : type === 'lesson');
  const [until, setUntil] = useState(series?.repeat?.until ?? semesterEnd(fromYmd(date)));
  const [onlyThis, setOnlyThis] = useState(false);
  const [err, setErr] = useState<string | undefined>();

  // Cambiando tipo nel nuovo impegno: le scadenze partono senza orario, le lezioni ripetute.
  const pickType = (v: FormType) => {
    setType(v);
    setTimed(v !== 'deadline');
    setRepeat(v === 'lesson');
    if (v === 'deadline' && !meta) setMeta(E.deadlineKinds.homework);
    if (v !== 'deadline' && Object.values(E.deadlineKinds).includes(meta)) setMeta('');
  };
  useEffect(() => {
    if (!editing && type === 'deadline' && !meta) setMeta(E.deadlineKinds.homework);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (editing?.locked) {
    return (
      <Sheet title={editing.title} onClose={onClose} footer={<Button title={t.agenda.close} onPress={onClose} />}>
        <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }}>
          <Icon name="lock-closed" size={18} color={colors.textSecondary} />
          <Text style={[typography.body, { flex: 1, color: colors.textSecondary }]}>{E.locked}</Text>
        </View>
      </Sheet>
    );
  }

  const isSeries = !!editing?.recurring;
  const seriesEdit = isSeries && !onlyThis;
  const canRepeat = !editing || isSeries ? type === 'lesson' || type === 'study' : false;
  const withTime = type === 'deadline' ? timed : true;
  const willRepeat = canRepeat && repeat && !onlyThis;

  const shiftTime = (which: 'start' | 'end', d: number) => {
    const s = toMin(start);
    const e = toMin(end);
    if (which === 'start') {
      const ns = Math.max(0, Math.min(23 * 60 + 45 - STEP, s + d));
      setStart(fromMin(ns));
      setEnd(fromMin(Math.min(23 * 60 + 59, ns + (e - s))));
    } else setEnd(fromMin(Math.max(s + STEP, Math.min(23 * 60 + 59, e + d))));
  };

  // Valori finali dell'impegno.
  const kind: AgendaKind = type === 'other' ? editing!.kind : TYPE_KIND[type];
  const finalTitle = (type === 'lesson' ? subject || title.trim() : type === 'study' ? title.trim() || (subject ? E.studyOf(subject) : '') : title.trim()) || '';
  // Spostare il giorno di una serie sposta tutte le settimane dello stesso numero di giorni.
  const seriesStart = seriesEdit && series ? addDaysYmd(series.date, Math.round((fromYmd(date).getTime() - fromYmd(editing!.date).getTime()) / 86400000)) : date;
  const candidate = {
    date: seriesEdit && willRepeat ? seriesStart : date,
    repeat: willRepeat ? { until, skip: seriesEdit ? series?.repeat?.skip ?? [] : [] } : undefined,
    start: withTime ? start : undefined,
    end: withTime ? end : undefined,
  };
  const conflicts = conflictsOf(list, candidate, editing?.seriesId);

  const save = () => {
    if (!finalTitle) return setErr(E.needTitle);
    const before = getAgenda();
    const values: Omit<AgendaItem, 'id'> = {
      kind,
      title: finalTitle,
      ...(subject ? { subject } : {}),
      ...(meta.trim() ? { meta: meta.trim() } : {}),
      ...(withTime ? { start, end } : {}),
      date: candidate.date,
      ...(candidate.repeat ? { repeat: candidate.repeat } : {}),
      ...(editing?.imported ? { imported: editing.imported } : {}),
    };
    if (!editing) addItems([{ id: newAgendaId(), ...values }]);
    else if (isSeries && onlyThis) {
      // Solo questo giorno: la serie lo salta e al suo posto c'è un impegno singolo (recupero o cambio d'orario).
      skipDay(editing.seriesId, editing.date);
      addItems([{ id: newAgendaId(), ...values }]);
    } else {
      updateItem(editing.seriesId, { ...values, subject, meta: meta.trim() || undefined, start: values.start, end: values.end, repeat: values.repeat });
    }
    showUndo(editing ? E.changed : E.added, () => setAgenda(before));
    onSaved(isSeries && !onlyThis ? date : values.date);
  };

  const remove = (all: boolean) => {
    if (!editing) return;
    const before = getAgenda();
    if (isSeries && !all) skipDay(editing.seriesId, editing.date);
    else removeItem(editing.seriesId);
    showUndo(isSeries && !all ? E.skipped : E.removed, () => setAgenda(before));
    onSaved(editing.date);
  };

  const subjectOptions = [{ v: '', label: E.noSubject }, ...subjects.map((s) => ({ v: s, label: s }))];

  return (
    <Sheet
      title={editing ? E.editTitle : E.newTitle}
      onClose={onClose}
      footer={
        <>
          {conflicts.length > 0 && (
            <View accessibilityLiveRegion="polite" style={{ flexDirection: 'row', gap: spacing.sm, padding: spacing.md, borderRadius: radius.lg, backgroundColor: colors.warningBg }}>
              <Icon name="warning" size={18} color={colors.warning} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[typography.callout, { color: colors.warning, fontWeight: '700' }]}>{E.overlap}</Text>
                {conflicts.map((c, k) => (
                  <Text key={k} style={[typography.caption, { color: colors.warning }]}>
                    {E.overlapItem(c.title, `${shortDay(c.date)} ${c.start}–${c.end}`)}
                  </Text>
                ))}
              </View>
            </View>
          )}
          <Button title={conflicts.length ? E.saveAnyway : E.save} appearance={conflicts.length ? 'warning' : 'primary'} onPress={save} />
          {editing && isSeries && (
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <View style={{ flex: 1 }}>
                <Button title={E.skipDay} onPress={() => remove(false)} />
              </View>
              <View style={{ flex: 1 }}>
                <Button title={E.deleteAll} appearance="danger" onPress={() => remove(true)} />
              </View>
            </View>
          )}
          {editing && !isSeries && <Button title={E.delete} appearance="danger" onPress={() => remove(true)} />}
          {!editing && <Button title={E.importFrom} appearance="subtle" iconBefore="calendar" onPress={onImport} />}
        </>
      }
    >
      {!editing && (
        <Pills<FormType>
          label={E.newTitle}
          value={type}
          onChange={pickType}
          options={[
            { v: 'lesson', label: E.types.lesson },
            { v: 'deadline', label: E.types.deadline },
            { v: 'study', label: E.types.study },
          ]}
        />
      )}
      {editing && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <View style={{ width: 32, height: 32, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.tints[editing.kind].bg }}>
            <Icon name={KIND_ICON[editing.kind]} size={18} color={colors.tints[editing.kind].fg} />
          </View>
          <Text style={[typography.callout, { color: colors.textSecondary }]}>{t.agenda.kind[editing.kind]}</Text>
        </View>
      )}

      {type !== 'other' && (
        <View style={{ gap: spacing.xs }}>
          <Label>{E.subject}</Label>
          <Pills<string> label={E.subject} value={subject ?? ''} onChange={(v) => setSubject(v || undefined)} options={subjectOptions} />
        </View>
      )}

      {(type !== 'lesson' || !subject) && (
        <TextField
          label={E.title}
          placeholder={type === 'study' && subject ? E.studyOf(subject) : E.titlePh}
          value={title}
          onChangeText={(v) => {
            setTitle(v);
            setErr(undefined);
          }}
          maxLength={60}
          error={err}
        />
      )}

      {type === 'deadline' && (
        <View style={{ gap: spacing.xs }}>
          <Label>{E.deadlineKind}</Label>
          <Pills<string> label={E.deadlineKind} value={meta} onChange={setMeta} options={DEADLINE_KINDS.map((k) => ({ v: E.deadlineKinds[k], label: E.deadlineKinds[k] }))} />
        </View>
      )}
      {type === 'lesson' && <TextField label={E.room} placeholder={E.roomPh} value={meta} onChangeText={setMeta} maxLength={30} />}

      <Stepper label={E.day} value={dayLabel(date)} onMinus={() => setDate(addDaysYmd(date, -1))} onPlus={() => setDate(addDaysYmd(date, 1))} />

      {type === 'deadline' && <ToggleRow label={E.withTime} detail={E.withTimeDetail} value={timed} onChange={setTimed} />}
      {withTime && (
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <Stepper label={E.start} value={start} onMinus={() => shiftTime('start', -STEP)} onPlus={() => shiftTime('start', STEP)} />
          <Stepper label={E.end} value={end} onMinus={() => shiftTime('end', -STEP)} onPlus={() => shiftTime('end', STEP)} />
        </View>
      )}

      {isSeries && <ToggleRow label={E.onlyThis} detail={E.onlyThisDetail} value={onlyThis} onChange={setOnlyThis} />}
      {canRepeat && !onlyThis && <ToggleRow label={E.repeat} detail={E.repeatDetail} value={repeat} onChange={setRepeat} />}
      {willRepeat && (
        <View style={{ gap: spacing.sm }}>
          <Stepper label={E.until} value={dayLabel(until)} onMinus={() => setUntil(addDaysYmd(until, -7) < date ? until : addDaysYmd(until, -7))} onPlus={() => setUntil(addDaysYmd(until, 7))} />
          <Pills<string>
            label={E.until}
            value={until}
            onChange={setUntil}
            options={[
              { v: semesterEnd(fromYmd(date)), label: E.untilSemester },
              { v: yearEnd(fromYmd(date)), label: E.untilYear },
            ]}
          />
        </View>
      )}
    </Sheet>
  );
}

/** Le cose senza orario di un giorno (dec. 186): consegne, festività, eventi di tutto il giorno. */
export function UntimedSheet({ items, date, onClose, onOpen, onAdd }: { items: Occurrence[]; date: string; onClose: () => void; onOpen: (o: Occurrence) => void; onAdd: () => void }) {
  const { colors, typography, radius, spacing } = useTheme();
  const D = t.agenda.deadlines;
  return (
    <Sheet title={`${D.title} · ${dayLabel(date)}`} onClose={onClose} footer={<Button title={D.add} iconBefore="plus" onPress={onAdd} />}>
      <Text style={[typography.caption, { color: colors.textSecondary }]}>{D.detail}</Text>
      {items.map((o) => {
        const tint = colors.tints[o.kind];
        return (
          <Pressable
            key={o.id}
            onPress={() => onOpen(o)}
            accessibilityRole="button"
            accessibilityLabel={[t.agenda.kind[o.kind], o.title, o.subject, o.meta].filter(Boolean).join(', ')}
            style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.xl, backgroundColor: colors.surfaceMuted, opacity: pressed ? 0.7 : 1 })}
          >
            <View style={{ width: 36, height: 36, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', backgroundColor: tint.bg }}>
              <Icon name={KIND_ICON[o.kind]} size={18} color={tint.fg} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[typography.headline, { color: colors.text }]} numberOfLines={2}>
                {o.title}
              </Text>
              {!!(o.meta || o.subject) && <Text style={[typography.caption, { color: colors.textSecondary }]}>{[o.meta, o.subject].filter(Boolean).join(' · ')}</Text>}
            </View>
            <Icon name="chevron" size={18} color={colors.textTertiary} />
          </Pressable>
        );
      })}
    </Sheet>
  );
}

/** Importazione dai calendari del telefono (dec. 186): si scelgono i calendari, gli eventi già presenti si riconoscono. */
export function ImportSheet({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const { colors, typography, radius, spacing } = useTheme();
  const I = t.agenda.importCal;
  const list = useAgenda();
  const [cals, setCals] = useState<DeviceCalendar[] | null | undefined>(undefined);
  const [chosen, setChosen] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!calendarAvailable) return setCals([]);
    listCalendars()
      .then(setCals)
      .catch(() => setCals(null));
  }, []);

  const importedIn = (id: string) => list.filter((i) => i.imported?.calendarId === id).length;

  const run = async () => {
    setBusy(true);
    try {
      const events = await readEvents(chosen);
      const known = new Set(getAgenda().flatMap((i) => (i.imported ? [`${i.imported.calendarId}/${i.imported.eventId}`] : [])));
      const fresh = events.filter((e) => !known.has(`${e.imported!.calendarId}/${e.imported!.eventId}`));
      const before = getAgenda();
      if (fresh.length) addItems(fresh);
      showUndo(I.done(fresh.length, events.length - fresh.length), () => setAgenda(before));
      onDone();
    } finally {
      setBusy(false);
    }
  };

  let body: ReactNode;
  if (!calendarAvailable) body = <Text style={[typography.body, { color: colors.textSecondary }]}>{I.unavailable}</Text>;
  else if (cals === undefined) body = (
    <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }}>
      <ActivityIndicator />
      <Text style={[typography.body, { color: colors.textSecondary }]}>{I.loading}</Text>
    </View>
  );
  else if (cals === null) body = <Text style={[typography.body, { color: colors.danger }]}>{I.denied}</Text>;
  else if (cals.length === 0) body = <Text style={[typography.body, { color: colors.textSecondary }]}>{I.none}</Text>;
  else
    body = cals.map((c) => {
      const on = chosen.includes(c.id);
      const n = importedIn(c.id);
      return (
        <Pressable
          key={c.id}
          onPress={() => setChosen((x) => (on ? x.filter((y) => y !== c.id) : [...x, c.id]))}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: on }}
          style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 52, padding: spacing.sm, borderRadius: radius.lg, backgroundColor: on ? colors.selected : 'transparent', opacity: pressed ? 0.7 : 1 })}
        >
          <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: c.color }} />
          <View style={{ flex: 1 }}>
            <Text style={[typography.body, { color: colors.text }]}>{c.title}</Text>
            <Text style={[typography.caption, { color: colors.textTertiary }]}>{[c.source, n ? I.already(n) : ''].filter(Boolean).join(' · ')}</Text>
          </View>
          <Icon name={on ? 'checkbox' : 'checkbox-outline'} size={22} color={on ? colors.accent : colors.textTertiary} />
        </Pressable>
      );
    });

  return (
    <Sheet
      title={I.title}
      onClose={onClose}
      footer={calendarAvailable && cals ? <Button title={I.import} appearance="primary" loading={busy} disabled={!chosen.length || busy} onPress={run} /> : <Button title={t.agenda.close} onPress={onClose} />}
    >
      <Text style={[typography.caption, { color: colors.textSecondary }]}>{I.detail}</Text>
      {body}
    </Sheet>
  );
}
