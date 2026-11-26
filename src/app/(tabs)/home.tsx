import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Fragment, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { tap } from '../../components/haptics';
import { Mascot } from '../../components/Mascot';
import { PushDrawer } from '../../components/SideMenu';
import { Screen } from '../../components/ui';
import { CoverCard, NotebookCover } from '../../components/notebooks';
import { COVER_RATIO } from '../../components/coverArt';
import { demoAgenda, demoClasses, demoNotes, type DemoAgendaItem, type DemoClass } from '../../data/demo';
import { locale, t } from '../../i18n';
import { useEnvironment } from '../../state/environment';
import { setMenuOpen, useMenuOpen } from '../../state/menu';
import { useNotes } from '../../state/whiteboard';
import { sheetsOf, sortBooks, useSheets } from '../../state/notebooks';
import { subjectLook, useSubjectLooks, useSubjects } from '../../state/subjects';
import { covers, fonts, useTheme } from '../../theme';
import { registerTabScreen, TabSwipe } from '../../components/TabSwipe';
import { Icon } from '../../components/icons';
import { unreadTotal, useThreads } from '../../state/messages';
import { useProfile } from '../../state/profile';

/** Ordine di importanza per scegliere l'impegno di domani. */
const RANK: Partial<Record<DemoAgendaItem['kind'], number>> = { activity: 0, holiday: 1, official: 2, appointment: 3 };
const MAX_ROWS = 5;
/** Colonna dell'ora: larga abbastanza per "08:00" in grassetto anche con il font di iOS e il testo più grande. */
const TIME_W = 56;
/** Entro quanti minuti l'impegno successivo mostra "tra N min". */
const SOON_MIN = 90;

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const label = (i: DemoAgendaItem) => (i.start ? `${i.title} · ${i.start}` : i.title);
const toMin = (hhmm?: string) => (hhmm ? Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5)) : undefined);

/** Minuti dalla mezzanotte, aggiornati ogni 30 secondi. */
function useMinutesNow() {
  const get = () => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  };
  const [m, setM] = useState(get);
  useEffect(() => {
    const id = setInterval(() => setM(get()), 30_000);
    return () => clearInterval(id);
  }, []);
  return m;
}

/**
 * Home (dec. 120–124). Dall'alto: menu, notifiche e messaggi (fissi); giorno e data; saluto con il nome e "Riprendi" (dec. 199, 200);
 * riquadro "Oggi" come un orario; prossime scadenze; appunti delle materie di oggi; la tua classe.
 */
function HomeScreen() {
  const { spacing } = useTheme();
  const { active } = useEnvironment();
  const menuOpen = useMenuOpen();
  const now = new Date();

  const todayItems = demoAgenda.filter((i) => i.dayOffset === 0);
  // Solo gli eventi dell'Agenda con il loro orario (dec. 132): niente compiti, verifiche o altre attività,
  // che stanno in Prossime scadenze. Prima quelli con l'ora, in ordine; poi quelli di tutto il giorno (chiusure).
  const schedule = todayItems.filter((i) => i.kind !== 'activity').sort((a, b) => (a.start ?? '99').localeCompare(b.start ?? '99'));
  const tomorrow = demoAgenda
    .filter((i) => i.dayOffset === 1 && RANK[i.kind] !== undefined)
    .sort((a, b) => (RANK[a.kind] ?? 9) - (RANK[b.kind] ?? 9))[0];
  const deadlines = demoAgenda.filter((i) => i.kind === 'activity' && i.dayOffset >= 1 && i.dayOffset <= 7).sort((a, b) => a.dayOffset - b.dayOffset);
  const klass = demoClasses[active.id];

  return (
    <PushDrawer>
      <Screen header={<TopBar menuOpen={menuOpen} onMenu={() => setMenuOpen(!menuOpen)} />}>
        <View style={{ alignItems: 'center', gap: spacing.xs, marginTop: spacing.xl, marginBottom: spacing.lg }}>
          <DayTitle date={now} />
        </View>

        <Greeting />
        <ResumeRow />
        <TodayCard items={schedule} tomorrow={tomorrow} />
        <Deadlines items={deadlines} />
        <RecentBooks />
        {klass && <ClassTile klass={klass} />}
      </Screen>
    </PushDrawer>
  );
}

/** In alto, senza bordi e fissi: menu e campanella a sinistra, messaggi a destra. Icone Hugeicons (dec. 124, 159). */
function TopBar({ menuOpen, onMenu }: { menuOpen: boolean; onMenu: () => void }) {
  const { colors, layout, radius } = useTheme();
  const unread = unreadTotal(useThreads());
  const btn = ({ pressed }: { pressed: boolean }) => ({
    width: layout.iconButton,
    height: layout.iconButton,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    opacity: pressed ? 0.6 : 1,
  });
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: -10 }}>
        <Pressable
          onPress={() => {
            tap();
            onMenu();
          }}
          accessibilityRole="button"
          accessibilityLabel={t.a11y.openMenu}
          accessibilityState={{ expanded: menuOpen }}
          style={btn}
        >
          <Icon name={menuOpen ? 'close' : 'menu'} size={26} color={colors.text} />
        </Pressable>
        <Pressable
          onPress={() => {
            tap();
            router.push('/notifiche');
          }}
          accessibilityRole="button"
          accessibilityLabel={t.a11y.notifications}
          style={btn}
        >
          <View>
            <Icon name="bell" size={26} color={colors.text} />
            <View style={{ position: 'absolute', top: 1, right: 2, width: 8, height: 8, borderRadius: radius.pill, backgroundColor: colors.danger }} />
          </View>
        </Pressable>
      </View>
      <Pressable
        onPress={() => {
          tap();
          router.push('/messaggi');
        }}
        accessibilityRole="button"
        accessibilityLabel={unread ? `${t.a11y.messages}, ${t.messages.unreadA11y(unread)}` : t.a11y.messages}
        style={(s) => ({ ...btn(s), marginRight: -10 })}
      >
        <View>
          <Icon name="paper-plane-outline" size={26} color={colors.text} />
          {/* Messaggi non letti (dec. 189). */}
          {unread > 0 && (
            <View style={{ position: 'absolute', top: -6, right: -8, minWidth: 18, height: 18, paddingHorizontal: 4, borderRadius: 9, backgroundColor: colors.danger, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '700' }}>{unread}</Text>
            </View>
          )}
        </View>
      </Pressable>
    </View>
  );
}

function DayTitle({ date }: { date: Date }) {
  const { colors, typography, spacing } = useTheme();
  const weekday = capitalize(date.toLocaleDateString(locale, { weekday: 'long' }));
  const full = date.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
  return (
    <>
      {/* Su iOS la spaziatura negativa taglia l'ultima lettera ("Martedì"): un po' di margine interno; i nomi
          lunghi ("Mercoledì") si rimpiccioliscono invece di andare a capo o essere tagliati. */}
      <Text
        accessibilityRole="header"
        numberOfLines={1}
        adjustsFontSizeToFit
        style={{ fontFamily: fonts.heading, fontSize: 52, lineHeight: 60, letterSpacing: -0.5, paddingHorizontal: spacing.xs, color: colors.accent }}
      >
        {weekday}
      </Text>
      <Text style={[typography.body, { fontSize: 18, color: colors.textSecondary }]}>{full}</Text>
    </>
  );
}

/** Una sola riga sopra il riquadro: l'ultima cosa aperta, per riprenderla con un tocco. */
function ResumeRow() {
  const { colors, typography, spacing } = useTheme();
  const created = useNotes();
  const last = created[0] ? { id: created[0].id, title: created[0].title } : { id: demoNotes[0].id, title: demoNotes[0].title };
  return (
    <Pressable
      onPress={() => {
        tap();
        router.push(`/lavagna/${last.id}`);
      }}
      accessibilityRole="button"
      accessibilityLabel={`${t.home.resume}: ${last.title}`}
      hitSlop={6}
      style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, opacity: pressed ? 0.6 : 1 })}
    >
      <Icon name="time-outline" size={18} color={colors.textSecondary} />
      <Text style={[typography.callout, { color: colors.textSecondary }]}>{t.home.resume}</Text>
      <Text style={[typography.callout, { color: colors.text, fontWeight: '700', flex: 1 }]} numberOfLines={1}>
        {last.title}
      </Text>
      <Icon name="chevron-forward" size={16} color={colors.textTertiary} />
    </Pressable>
  );
}

/** Riquadro in evidenza: impegni di oggi come un orario, con quello in corso evidenziato; sotto l'impegno di domani. */
/**
 * Saluto sopra "Oggi" (dec. 199), al centro, con il solo nome dell'account: buongiorno fino a mezzogiorno,
 * buon pomeriggio dalle 12, buonasera dalle 19 (e di notte, fino alle 5). Cambia da solo con l'ora.
 */
function Greeting() {
  const { colors, spacing } = useTheme();
  const { firstName } = useProfile();
  const h = Math.floor(useMinutesNow() / 60);
  const g = h >= 19 || h < 5 ? t.greeting.evening : h >= 12 ? t.greeting.afternoon : t.greeting.morning;
  const name = firstName.trim();
  return (
    <Text accessibilityRole="header" style={{ fontFamily: fonts.heading, fontSize: 24, lineHeight: 30, textAlign: 'center', color: colors.text, marginBottom: spacing.sm }}>
      {name ? `${g}, ${name}` : g}
    </Text>
  );
}

function TodayCard({ items, tomorrow }: { items: DemoAgendaItem[]; tomorrow?: DemoAgendaItem }) {
  const { colors, typography, spacing, radius } = useTheme();
  const nowMin = useMinutesNow();
  const fg = colors.onFeature;
  const extra = items.length - MAX_ROWS;

  const current = items.find((i) => {
    const s = toMin(i.start);
    const e = toMin(i.end);
    return s !== undefined && e !== undefined && s <= nowMin && nowMin < e;
  });
  const next = current ? undefined : items.find((i) => (toMin(i.start) ?? -1) > nowMin);
  const nextIn = next ? (toMin(next.start) ?? 0) - nowMin : undefined;

  return (
    <Pressable
      onPress={() => router.navigate('/agenda')}
      accessibilityRole="button"
      style={({ pressed }) => ({
        minHeight: 210,
        borderRadius: radius.xxl,
        backgroundColor: colors.feature,
        padding: spacing.xl,
        overflow: 'hidden',
        opacity: pressed ? 0.92 : 1,
      })}
    >
      <View style={{ position: 'absolute', right: -16, bottom: -16 }}>
        <Mascot size={116} mood="wonder" />
      </View>

      <View style={{ marginRight: 80, gap: spacing.md, flex: 1 }}>
        <Text style={[typography.title1, { color: fg }]}>{t.home.today}</Text>
        {items.length === 0 ? (
          <Text style={[typography.callout, { color: fg, opacity: 0.9 }]}>{t.home.emptyToday}</Text>
        ) : (
          <View style={{ gap: spacing.xxs, marginHorizontal: -spacing.sm }}>
            {items.slice(0, MAX_ROWS).map((i) => {
              const end = toMin(i.end);
              const past = end !== undefined && end <= nowMin;
              const isNow = i === current;
              const sub = isNow && end !== undefined ? `${t.home.now} · ${t.home.endsIn(end - nowMin)}` : i === next && nextIn !== undefined && nextIn <= SOON_MIN ? t.home.startsIn(nextIn) : undefined;
              return (
                <View
                  key={i.id}
                  style={{
                    paddingHorizontal: spacing.sm,
                    paddingVertical: isNow ? spacing.xs : 2,
                    borderRadius: radius.md,
                    backgroundColor: isNow ? 'rgba(255,255,255,0.18)' : 'transparent',
                    opacity: past ? 0.5 : 1,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: spacing.md }}>
                    <Text numberOfLines={1} style={[typography.callout, { width: TIME_W, flexShrink: 0, color: fg, fontWeight: '700', fontVariant: ['tabular-nums'] }]}>
                      {i.start ?? ''}
                    </Text>
                    <Text style={[typography.callout, { color: fg, flexShrink: 1, fontWeight: isNow ? '700' : '500' }]} numberOfLines={1}>
                      {i.title}
                    </Text>
                  </View>
                  {sub && (
                    <Text style={[typography.caption, { color: fg, opacity: 0.85, marginLeft: TIME_W + spacing.md }]} numberOfLines={1}>
                      {sub}
                    </Text>
                  )}
                </View>
              );
            })}
            {extra > 0 && <Text style={[typography.caption, { color: fg, opacity: 0.8, marginLeft: TIME_W + spacing.md + spacing.sm }]}>{t.home.more(extra)}</Text>}
          </View>
        )}
      </View>

      <View style={{ marginTop: spacing.lg, marginRight: 80 }}>
        <Text style={[typography.callout, { color: fg, opacity: 0.9, flexShrink: 1 }]} numberOfLines={2}>
          {tomorrow ? `${t.home.tomorrow} · ${label(tomorrow)}` : t.home.nothingTomorrow}
        </Text>
      </View>
    </Pressable>
  );
}

/** Prossime scadenze (7 giorni), senza card né divisori: righe semplici (dec. 131). */
function Deadlines({ items }: { items: DemoAgendaItem[] }) {
  const { colors, typography, spacing, radius } = useTheme();
  const tint = colors.tints.activity;
  return (
    <View style={{ gap: spacing.sm, marginTop: spacing.xl }}>
      <Text accessibilityRole="header" style={[typography.title1, { color: colors.accent }]}>
        {t.home.deadlines}
      </Text>
      {items.length === 0 ? (
        <Text style={[typography.body, { color: colors.textSecondary }]}>{t.home.emptyDeadlines}</Text>
      ) : (
        <View>
          {items.map((d) => (
            <Fragment key={d.id}>
              <Pressable
                onPress={() => {
                  tap();
                  router.navigate('/attivita');
                }}
                accessibilityRole="button"
                accessibilityLabel={`${d.title}, ${d.meta ?? ''}, ${t.home.inDays(d.dayOffset)}`}
                style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, opacity: pressed ? 0.6 : 1 })}
              >
                <View style={{ width: 36, height: 36, borderRadius: radius.md, backgroundColor: tint.bg, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={d.meta === 'Verifica' ? 'document-text-outline' : 'checkbox-outline'} size={18} color={tint.fg} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.headline, { color: colors.text }]} numberOfLines={1}>
                    {d.title}
                  </Text>
                  {!!d.meta && <Text style={[typography.caption, { color: colors.textSecondary }]}>{d.meta}</Text>}
                </View>
                <Text style={[typography.callout, { color: d.dayOffset <= 1 ? colors.danger : colors.textSecondary }]}>{t.home.inDays(d.dayOffset)}</Text>
              </Pressable>
            </Fragment>
          ))}
        </View>
      )}
    </View>
  );
}

/** I tuoi appunti (dec. 183): gli ultimi 4 quaderni usati, con le stesse copertine e scritte della pagina Appunti. */
function RecentBooks() {
  const { colors, typography, spacing } = useTheme();
  const sheets = useSheets();
  const subjects = useSubjects();
  const looks = useSubjectLooks();
  const [w, setW] = useState(0);
  const books = sortBooks(
    subjects.map((s, i) => {
      const list = sheetsOf(sheets, s);
      return { subject: s, label: s, look: subjectLook(looks, s, i), count: list.length, lastEdit: Math.max(0, ...list.map((x) => x.at)) };
    }),
    'recent',
  ).slice(0, 4);
  // Due per riga come in Appunti; su iPad e in orizzontale quattro.
  const gap = spacing.md;
  const cols = w >= 700 ? 4 : 2;
  const bw = w > 0 ? (w - gap * (cols - 1)) / cols : 0;
  const bh = Math.round(bw / COVER_RATIO);
  const open = (name: string) => router.push({ pathname: '/quaderno/[name]', params: { name } });
  return (
    <View style={{ gap: spacing.md, marginTop: spacing.xl }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text accessibilityRole="header" style={[typography.title1, { color: colors.accent, flex: 1 }]}>
          {t.home.notes}
        </Text>
        <Pressable onPress={() => router.navigate('/attivita')} accessibilityRole="link" hitSlop={8} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
          <Text style={[typography.callout, { color: colors.accent, fontWeight: '600' }]}>{t.home.seeAll}</Text>
        </Pressable>
      </View>
      {books.length === 0 ? (
        <Text style={[typography.body, { color: colors.textSecondary }]}>{t.home.emptyNotes}</Text>
      ) : (
        <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: gap, rowGap: spacing.lg }}>
          {bw > 0 &&
            books.map((bk) => (
              <CoverCard
                key={bk.subject}
                width={bw}
                height={bh}
                label={bk.label}
                caption={bk.count ? t.activitiesHub.sheetCount(bk.count) : t.activitiesHub.emptyBook}
                onOpen={() => open(bk.subject)}
                onMenu={() => open(bk.subject)}
              >
                <NotebookCover look={bk.look} name={bk.label} width={bw} height={bh} />
              </CoverCard>
            ))}
        </View>
      )}
    </View>
  );
}

/** La tua classe: grande miniatura con i compagni e poche informazioni; porta alla pagina della classe. */
function ClassTile({ klass }: { klass: DemoClass }) {
  const { colors, typography, spacing, radius } = useTheme();
  // Due file di avatar sfalsate, come una foto di classe.
  const rows = [klass.members.slice(0, 4), klass.members.slice(4, 8)];
  return (
    <View style={{ gap: spacing.md, marginTop: spacing.xl }}>
      <Text accessibilityRole="header" style={[typography.title1, { color: colors.accent }]}>
        {t.home.yourClass}
      </Text>
      <Pressable
        onPress={() => {
          tap();
          router.push(`/classe/${klass.id}`);
        }}
        accessibilityRole="button"
        accessibilityLabel={`${klass.name}, ${t.home.classPeople(klass.students, klass.teachers)}`}
        style={({ pressed }) => ({
          borderRadius: radius.xxl,
          backgroundColor: colors.surface,
          boxShadow: colors.shadowRaised,
          overflow: 'hidden',
          transform: [{ scale: pressed ? 0.98 : 1 }],
        })}
      >
        <LinearGradient colors={colors.brandGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ height: 170, justifyContent: 'center', alignItems: 'center', gap: -10 }}>
          {rows.map((row, r) => (
            <View key={r} style={{ flexDirection: 'row', marginLeft: r === 1 ? 44 : 0 }}>
              {row.map((initials, i) => (
                <View
                  key={initials}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    marginLeft: i === 0 ? 0 : -12,
                    backgroundColor: covers[(r * 4 + i) % covers.length].color,
                    borderWidth: 3,
                    borderColor: 'rgba(255,255,255,0.95)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={[typography.headline, { color: '#FFFFFF' }]}>{initials}</Text>
                </View>
              ))}
            </View>
          ))}
          {klass.news > 0 && (
            <View style={{ position: 'absolute', top: spacing.md, right: spacing.md, paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: 999, backgroundColor: '#FFFFFF' }}>
              <Text style={[typography.caption, { color: colors.feature, fontWeight: '700' }]}>{t.home.classNews(klass.news)}</Text>
            </View>
          )}
        </LinearGradient>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg }}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={[typography.title2, { color: colors.text }]} numberOfLines={1}>
              {klass.name}
            </Text>
            <Text style={[typography.caption, { color: colors.textSecondary }]} numberOfLines={1}>
              {klass.detail} · {t.home.classPeople(klass.students, klass.teachers)}
            </Text>
          </View>
          <Icon name="chevron-forward" size={20} color={colors.textTertiary} />
        </View>
      </Pressable>
    </View>
  );
}

// Scorrendo a destra/sinistra si cambia scheda (dec. 140); verso destra resta il menu laterale.
registerTabScreen('home', HomeScreen);
export default function Home() {
  return (
    <TabSwipe name="home" noPrev>
      <HomeScreen />
    </TabSwipe>
  );
}
