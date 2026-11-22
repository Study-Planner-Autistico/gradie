import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Chip, Screen, ScreenHeader, SectionHeader, type IconName } from '../../components/ui';
import { BoardPreview } from '../../components/whiteboard/BoardPreview';
import { demoNotes, type DemoNote } from '../../data/demo';
import { locale, t } from '../../i18n';
import { useEnvironment } from '../../state/environment';
import { useBoards, usePages, type BoardItem } from '../../state/whiteboard';
import { useTheme } from '../../theme';

type QuickAction = { key: keyof typeof t.activitiesHub.actions; icon: IconName; brand?: boolean; opensBoard?: boolean };

/** Azioni rapide (dec. 109). Appunti e lavagna aprono una nuova pagina (dec. 110); le altre sono da definire. */
const ACTIONS: QuickAction[] = [
  { key: 'takeNotes', icon: 'create-outline', opensBoard: true },
  { key: 'importFile', icon: 'download-outline' },
  { key: 'youtube', icon: 'logo-youtube', brand: true },
  { key: 'whiteboard', icon: 'grid-outline', opensBoard: true },
];

/** Attività: azioni rapide e note (dec. 109, modifica dec. 25). */
export default function Attivita() {
  const { colors, spacing } = useTheme();
  const { active } = useEnvironment();
  const pages = usePages();
  const itemsOf = useBoards();
  // Pagine nuove con contenuto, dalla più recente, poi le note dimostrative.
  const created: DemoNote[] = pages
    .filter((p) => !demoNotes.some((n) => n.id === p.id))
    .map((p) => ({ id: p.id, title: t.whiteboard.untitled, subject: '', edited: editedLabel(p.edited), tint: 'lesson' }));
  const notes = [...created, ...demoNotes];
  const rows: DemoNote[][] = [];
  for (let i = 0; i < notes.length; i += 2) rows.push(notes.slice(i, i + 2));

  return (
    <Screen>
      <ScreenHeader title={t.tabs.activities} subtitle={active.name} />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginHorizontal: -spacing.lg }}
        contentContainerStyle={{ gap: spacing.sm, paddingHorizontal: spacing.lg }}
      >
        {ACTIONS.map((a) => (
          <ActionButton
            key={a.key}
            icon={a.icon}
            label={t.activitiesHub.actions[a.key]}
            iconColor={a.brand ? colors.danger : colors.textSecondary}
            onPress={a.opensBoard ? () => router.push(`/lavagna/new-${Date.now().toString(36)}`) : undefined}
          />
        ))}
      </ScrollView>

      <View style={{ marginTop: spacing.md }}>
        <SectionHeader title={t.activitiesHub.notes} />
      </View>
      <View style={{ gap: spacing.md }}>
        {rows.map((row) => (
          <View key={row[0].id} style={{ flexDirection: 'row', gap: spacing.md }}>
            {row.map((n) => (
              <NoteCard key={n.id} note={n} items={itemsOf(n.id)} />
            ))}
            {row.length === 1 && <View style={{ flex: 1 }} />}
          </View>
        ))}
      </View>
      <View style={{ alignItems: 'flex-start' }}>
        <Chip label={t.demo} variant="muted" />
      </View>
    </Screen>
  );
}

function ActionButton({ icon, label, iconColor, onPress }: { icon: IconName; label: string; iconColor: string; onPress?: () => void }) {
  const { colors, typography, radius, spacing } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        height: 40,
        paddingHorizontal: spacing.lg,
        borderRadius: radius.sm,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <Ionicons name={icon} size={17} color={iconColor} />
      <Text style={[typography.callout, { color: colors.text }]}>{label}</Text>
    </Pressable>
  );
}

/** Scheda nota: anteprima stilizzata della pagina + titolo. */
function NoteCard({ note, items }: { note: DemoNote; items: BoardItem[] }) {
  const { colors, typography, radius, spacing } = useTheme();
  const tint = colors.tints[note.tint];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={note.title}
      onPress={() => router.push(`/lavagna/${note.id}`)}
      style={({ pressed }) => ({
        flex: 1,
        borderRadius: radius.lg,
        backgroundColor: colors.surface,
        overflow: 'hidden',
        shadowColor: colors.shadow,
        shadowOpacity: 1,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 2 },
        opacity: pressed ? 0.8 : 1,
      })}
    >
      {items.length > 0 ? (
        // Anteprima reale della lavagna.
        <View style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>
          <BoardPreview items={items} height={120} />
        </View>
      ) : (
        <View
          style={{
            height: 120,
            backgroundColor: tint.bg,
            padding: spacing.md,
            gap: 6,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <Text style={[typography.caption, { color: tint.fg }]} numberOfLines={1}>
            {note.subject}
          </Text>
          {[0.9, 0.75, 0.85, 0.6, 0.7].map((w, i) => (
            <View key={i} style={{ height: 4, width: `${w * 100}%`, borderRadius: 2, backgroundColor: tint.fg, opacity: 0.25 }} />
          ))}
        </View>
      )}
      <View style={{ padding: spacing.md, gap: 2 }}>
        <Text style={[typography.headline, { color: colors.text }]} numberOfLines={2}>
          {note.title}
        </Text>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>{note.edited}</Text>
      </View>
    </Pressable>
  );
}

/** "Oggi, 09:12" per le pagine create in questa sessione. */
function editedLabel(at: number) {
  return `${t.home.today}, ${new Date(at).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}`;
}
