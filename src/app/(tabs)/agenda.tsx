import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { CalendarSheet, DayStrip, DayTimeline } from '../../components/agenda';
import { COVER_SWATCH } from '../../components/coverArt';
import { tap } from '../../components/haptics';
import { EmptyState, Screen } from '../../components/ui';
import { AgendaEditor, ImportSheet, UntimedSheet, type EditorTarget } from '../../components/AgendaEditor';
import { fromYmd, occurrencesOn, useAgenda, ymd, type Occurrence } from '../../state/agenda';
import { t } from '../../i18n';
import { subjectLook, useSubjectLooks, useSubjects } from '../../state/subjects';
import { useTheme } from '../../theme';
import { registerTabScreen, TabSwipe } from '../../components/TabSwipe';
import { Icon } from '../../components/icons';
import { enableReminders, syncReminders, useReminderPermission } from '../../state/reminders';

/** Agenda (modulo 02 §5 AG-01): sette giorni con quello scelto al centro e gli eventi in verticale (dec. 151). */
function AgendaScreen() {
  const { colors, typography, spacing, layout, radius } = useTheme();
  const subjects = useSubjects();
  const looks = useSubjectLooks();
  const [selected, setSelected] = useState(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [editor, setEditor] = useState<EditorTarget | null>(null);
  const [untimedOpen, setUntimedOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const agenda = useAgenda();
  // Promemoria (dec. 195): con il permesso, una notifica all'inizio di ogni impegno; si riprogrammano a ogni modifica.
  const reminders = useReminderPermission();
  useEffect(() => {
    syncReminders(agenda).catch(() => {});
  }, [agenda, reminders]);
  // Impegni salvati (dec. 186): sulla linea quelli con orario; quelli senza in un riepilogo del giorno.
  const allOf = (d: Date) => occurrencesOn(agenda, ymd(d));
  const itemsOf = (d: Date) => allOf(d).filter((i) => i.start);
  const items = itemsOf(selected);
  const untimed = allOf(selected).filter((i) => !i.start);
  const isToday = ymd(selected) === ymd(new Date());
  const day = ymd(selected);
  const open = (o: Occurrence) => {
    setUntimedOpen(false);
    setEditor({ mode: 'edit', occ: o });
  };
  const saved = (date: string) => {
    setEditor(null);
    // Il risultato si vede subito: l'Agenda va sul giorno dell'impegno.
    setSelected(fromYmd(date));
  };
  const bar = ({ pressed }: { pressed: boolean }) => ({
    width: layout.iconButton,
    height: layout.iconButton,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    opacity: pressed ? 0.6 : 1,
  });

  // Colore della materia = colore della copertina del suo quaderno (dec. 144).
  const subjectColor = (name?: string) => {
    const i = name ? subjects.findIndex((s) => s.toLocaleLowerCase() === name.toLocaleLowerCase()) : -1;
    return i < 0 ? undefined : COVER_SWATCH[subjectLook(looks, subjects[i], i).color];
  };
  const dotsFor = (d: Date) => [...new Set(allOf(d).map((i) => subjectColor(i.subject)).filter((c): c is string => !!c))];

  return (
    <>
    <Screen
      header={
        // Come la barra della Home (alta 44, icone a linea 24 senza sfondo), così il titolo cade nello stesso punto (dec. 155-156).
        <View style={{ height: layout.iconButton, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginLeft: -10 }}>
            <Pressable
              onPress={() => {
                tap();
                setCalendarOpen(true);
              }}
              accessibilityRole="button"
              accessibilityLabel={t.agenda.calendar}
              style={bar}
            >
              <Icon name="calendar" size={26} color={colors.text} />
            </Pressable>
            {!isToday && (
              <Pressable
                onPress={() => {
                  tap();
                  setSelected(new Date());
                }}
                hitSlop={6}
                accessibilityRole="button"
                style={({ pressed }) => ({ height: 32, paddingHorizontal: spacing.md, borderRadius: radius.pill, justifyContent: 'center', backgroundColor: colors.selected, opacity: pressed ? 0.7 : 1 })}
              >
                <Text style={[typography.callout, { fontWeight: '600', color: colors.selectedText }]}>{t.agenda.today}</Text>
              </Pressable>
            )}
          </View>
          {/* Nuova lezione, scadenza o blocco di studio nel giorno scelto (dec. 186). */}
          <Pressable
            onPress={() => {
              tap();
              setEditor({ mode: 'new', date: day });
            }}
            accessibilityRole="button"
            accessibilityLabel={t.agenda.add}
            style={(s) => ({ ...bar(s), marginRight: -10 })}
          >
            <Icon name="plus" size={26} color={colors.text} />
          </Pressable>
        </View>
      }
    >
      {/* Centrato e con gli stessi margini del giorno della Home, ma più piccolo (40 invece di 52) sulla stessa riga di 60. */}
      <View style={{ alignItems: 'center', marginTop: spacing.xl, marginBottom: spacing.lg }}>
        <Text style={[typography.hero, { lineHeight: 60, color: colors.heading }]} accessibilityRole="header">
          {t.agenda.title}
        </Text>
      </View>
      <DayStrip selected={selected} onSelect={setSelected} dotsFor={dotsFor} />
      {(reminders === 'undetermined' || reminders === 'denied') && <ReminderCard denied={reminders === 'denied'} />}
      {/* Scadenze e impegni senza orario del giorno: un riepilogo a parte, aperto da qui (dec. 186). */}
      {untimed.length > 0 && (
        <Pressable
          onPress={() => {
            tap();
            setUntimedOpen(true);
          }}
          accessibilityRole="button"
          accessibilityLabel={`${t.agenda.deadlines.title}: ${untimed.map((u) => u.title).join(', ')}`}
          style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, alignSelf: 'flex-start', minHeight: 40, paddingHorizontal: spacing.md, borderRadius: radius.pill, backgroundColor: colors.tints.activity.bg, opacity: pressed ? 0.7 : 1 })}
        >
          <Icon name="flag" size={16} color={colors.tints.activity.fg} />
          <Text style={[typography.callout, { color: colors.tints.activity.fg, fontWeight: '600' }]}>{t.agenda.deadlines.count(untimed.length)}</Text>
          <Icon name="chevron" size={16} color={colors.tints.activity.fg} />
        </Pressable>
      )}
      {items.length === 0 ? (
        <EmptyState icon="sunny-outline" message={t.agenda.empty} />
      ) : (
        <DayTimeline items={items} day={selected} onOpen={open} />
      )}
      <Text style={[typography.caption, { color: colors.textTertiary }]}>{t.demo}</Text>
    </Screen>
    {/* Fuori dalla lista della pagina: dentro, la ScrollView si prendeva i trascinamenti della card (dec. 164). */}
    <CalendarSheet
      visible={calendarOpen}
      selected={selected}
      onClose={() => setCalendarOpen(false)}
      itemsOf={itemsOf}
      dotsFor={dotsFor}
    />
    {editor && <AgendaEditor target={editor} onClose={() => setEditor(null)} onSaved={saved} onImport={() => { setEditor(null); setImportOpen(true); }} />}
    {untimedOpen && !editor && (
      <UntimedSheet
        items={untimed}
        date={day}
        onClose={() => setUntimedOpen(false)}
        onOpen={open}
        onAdd={() => {
          setUntimedOpen(false);
          setEditor({ mode: 'new', date: day, type: 'deadline' });
        }}
      />
    )}
    {importOpen && <ImportSheet onClose={() => setImportOpen(false)} onDone={() => setImportOpen(false)} />}
    </>
  );
}

/**
 * Invito ai promemoria (dec. 195): alto come "N senza orario" ma largo tutta la riga, color pesca con la campanella e
 * il bottone "Attiva" che chiede il permesso delle notifiche. Se era stato negato, il bottone apre le Impostazioni del telefono.
 */
function ReminderCard({ denied }: { denied: boolean }) {
  const { colors, typography, spacing, radius } = useTheme();
  const R = t.agenda.reminders;
  // Prova storybook: azzurro dei link invece del pesca.
  const bg = colors.informationBg;
  const fg = colors.information;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, minHeight: 40, paddingLeft: spacing.md, paddingRight: 4, borderRadius: radius.pill, backgroundColor: bg }}>
      <Icon name="bell" size={18} color={colors.link} />
      <Text numberOfLines={1} style={[typography.callout, { flex: 1, color: fg, fontWeight: '600' }]}>
        {R.title}
        <Text style={{ fontWeight: '400' }}>{` · ${R.detail}`}</Text>
      </Text>
      <Pressable
        onPress={() => {
          tap();
          enableReminders();
        }}
        accessibilityRole="button"
        accessibilityLabel={`${R.title}: ${R.detail}`}
        style={({ pressed }) => ({ height: 32, paddingHorizontal: spacing.md, borderRadius: radius.pill, justifyContent: 'center', backgroundColor: fg, opacity: pressed ? 0.75 : 1 })}
      >
        <Text style={[typography.callout, { color: colors.onAccent, fontWeight: '700' }]}>{denied ? R.openSettings : R.enable}</Text>
      </Pressable>
    </View>
  );
}

// Scorrendo a destra/sinistra si cambia scheda (dec. 140).
registerTabScreen('agenda', AgendaScreen);
export default function Agenda() {
  return (
    <TabSwipe name="agenda">
      <AgendaScreen />
    </TabSwipe>
  );
}
