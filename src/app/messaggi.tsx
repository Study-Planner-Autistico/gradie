import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import Animated, { LinearTransition, SlideInDown, SlideOutDown, ZoomIn, ZoomOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedStar } from '../components/AnimatedStar';
import { ActionSheet, type SheetAction } from '../components/ActionSheet';
import { nameOf, PersonAvatar, shortWhen, Ticks } from '../components/chat';
import { confirm } from '../components/dialogs';
import { tap } from '../components/haptics';
import { Icon, type IconName } from '../components/icons';
import { NativeMenu } from '../components/NativeMenu';
import type { NativeMenuItem } from '../components/NativeMenu.types';
import { EmptyState } from '../components/ui';
import { t } from '../i18n';
import { ASSISTANT, deleteThread, lastOf, markRead, markUnread, threadFor, toggleArchived, toggleImportant, toggleMuted, useThreads, type Thread } from '../state/messages';
import { useTheme } from '../theme';

/**
 * Messaggi (dec. 189), dall'aereo in alto a destra della Home, come i Direct di Instagram.
 * Un solo elenco di chat (richieste e importanti comprese) su un foglio bianco col titolo Chat (dec. 211).
 */
export default function Messaggi() {
  const { colors, typography, spacing, radius, layout } = useTheme();
  const insets = useSafeAreaInsets();
  const T = t.messages;
  const threads = useThreads();
  const [query, setQuery] = useState('');
  // Archiviati (dec. 190): bottone accanto alla ricerca; le chat archiviate escono dall'elenco.
  const [archived, setArchived] = useState(false);
  const [menu, setMenu] = useState<Thread | null>(null);
  const [more, setMore] = useState(false);
  // Seleziona (dec. 213): null = elenco normale; altrimenti gli id delle chat scelte.
  const [selected, setSelected] = useState<string[] | null>(null);

  const archivedCount = threads.filter((x) => x.archived).length;

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return threads
      .filter((x) => !!x.archived === archived)
      .filter((x) => x.messages.length > 0 || x.personId === ASSISTANT)
      .filter((x) => !q || nameOf(x.personId).toLowerCase().includes(q) || x.messages.some((m) => m.text?.toLowerCase().includes(q)))
      .sort((a, b) => (lastOf(b)?.at ?? 0) - (lastOf(a)?.at ?? 0));
  }, [threads, query, archived]);

  const open = (personId: string) => {
    tap();
    router.push({ pathname: '/chat/[id]', params: { id: threadFor(personId) } });
  };
  const done = () => setSelected(null);
  const pick = (id: string) => setSelected((s) => (s ? (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]) : s));
  const n = selected?.length ?? 0;
  const bulk = (fn: (id: string) => void) => {
    tap();
    selected?.forEach(fn);
    done();
  };

  // Voci dei tre puntini: menu a tendina nativo su iOS, foglio dal basso altrove (dec. 213).
  const items: (NativeMenuItem & { icon: IconName })[] = [
    { label: T.select, systemImage: 'checkmark.circle', icon: 'checkmark-circle', onPress: () => setSelected([]) },
    ...(!archived
      ? [{ label: archivedCount ? `${T.archivedTitle} (${archivedCount})` : T.archivedTitle, systemImage: 'archivebox' as const, icon: 'archive' as const, onPress: () => (setArchived(true), setQuery('')) }]
      : []),
    ...(threads.some((x) => x.unread > 0) ? [{ label: T.markAllRead, systemImage: 'envelope.open' as const, icon: 'mail-open-outline' as const, onPress: () => threads.forEach((x) => x.unread > 0 && markRead(x.id)) }] : []),
  ];

  const iconBtn = ({ pressed }: { pressed: boolean }) => ({ width: layout.iconButton, height: layout.iconButton, alignItems: 'center' as const, justifyContent: 'center' as const, opacity: pressed ? 0.6 : 1 });

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface, paddingTop: insets.top }}>
      {/* Sotto la Dynamic Island e la barra di stato, su iPhone e iPad (dec. 190). */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, minHeight: 52, marginTop: spacing.xs }}>
        {selected ? (
          <Pressable onPress={done} accessibilityRole="button" accessibilityLabel={T.endSelect} style={iconBtn}>
            <Icon name="close" size={26} color={colors.text} />
          </Pressable>
        ) : (
          <Pressable onPress={() => (archived ? setArchived(false) : router.back())} accessibilityRole="button" accessibilityLabel={T.back} style={iconBtn}>
            <Icon name="chevron-back" size={26} color={colors.text} />
          </Pressable>
        )}
        <Text accessible={!!selected || archived} accessibilityRole="header" style={[typography.headline, { flex: 1, textAlign: 'center', color: colors.text }]}>
          {/* Niente "Messaggi" in alto: il titolo è Chat (dec. 216). */}
          {selected ? T.selectedCount(n) : archived ? T.archivedTitle : ''}
        </Text>
        {selected ? (
          <View style={{ width: layout.iconButton }} />
        ) : Platform.OS === 'ios' ? (
          <NativeMenu
            label={T.more}
            items={items}
            icon={
              <View style={{ width: layout.iconButton, height: layout.iconButton, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="ellipsis-horizontal" size={24} color={colors.text} />
              </View>
            }
          />
        ) : (
          <Pressable
            onPress={() => {
              tap();
              setMore(true);
            }}
            accessibilityRole="button"
            accessibilityLabel={T.more}
            style={iconBtn}
          >
            <Icon name="ellipsis-horizontal" size={24} color={colors.text} />
          </Pressable>
        )}
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.xl, gap: spacing.md }} keyboardShouldPersistTaps="handled">
        <Text accessibilityRole="header" style={[typography.title1, { color: colors.heading, paddingTop: spacing.sm }]}>
          {T.chats}
        </Text>
        {/* Ricerca sotto Chat, sempre visibile (dec. 216). */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, height: 44, paddingHorizontal: spacing.md, borderRadius: radius.lg, backgroundColor: colors.surfaceMuted, borderWidth: 2, borderColor: colors.border }}>
            <Icon name="search-outline" size={18} color={colors.textTertiary} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={T.search}
              placeholderTextColor={colors.textTertiary}
              accessibilityLabel={T.search}
              // lineHeight 24 del body spinge il testo sotto la lente su iOS (dec. 213).
              style={[typography.body, { flex: 1, height: '100%', lineHeight: 20, color: colors.text, padding: 0 }]}
            />
          </View>

        <View style={{ marginHorizontal: -spacing.xl, paddingBottom: insets.bottom + spacing.giant }}>
          {shown.length === 0 ? (
            <View style={{ paddingHorizontal: spacing.xl }}>
              <EmptyState icon={archived ? 'archive' : 'chatbubbles-outline'} message={query ? T.noResults : archived ? T.emptyArchived : T.empty} />
            </View>
          ) : (
            shown.map((th) => (
              <ThreadCard
                key={th.id}
                thread={th}
                selected={selected ? selected.includes(th.id) : undefined}
                onPress={() => (selected ? pick(th.id) : open(th.personId))}
                onLongPress={() => {
                  tap();
                  if (!selected) setMenu(th);
                }}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Azioni sulle chat scelte (dec. 213). */}
      {selected && (
        <Animated.View entering={SlideInDown.duration(220)} exiting={SlideOutDown.duration(180)} style={{ flexDirection: 'row', justifyContent: 'space-around', paddingTop: spacing.sm, paddingBottom: insets.bottom + spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface }}>
          {(
            [
              { icon: 'mail-open-outline', label: T.markReadMany, onPress: () => bulk(markRead) },
              { icon: 'archive', label: archived ? T.unarchive : T.archive, onPress: () => bulk(toggleArchived) },
              { icon: 'trash-outline', label: T.delete, danger: true, onPress: () => confirm(T.deleteManyTitle(n), T.delete, () => bulk(deleteThread), T.deleteBody) },
            ] as const
          ).map((a) => (
            <Pressable
              key={a.label}
              onPress={a.onPress}
              disabled={!n}
              accessibilityRole="button"
              accessibilityState={{ disabled: !n }}
              style={({ pressed }) => ({ alignItems: 'center', gap: spacing.xxs, minWidth: 88, paddingVertical: spacing.xs, opacity: !n ? 0.35 : pressed ? 0.6 : 1 })}
            >
              <Icon name={a.icon} size={24} color={'danger' in a ? colors.dangerIcon : colors.text} />
              <Text style={[typography.caption, { color: 'danger' in a ? colors.danger : colors.text }]}>{a.label}</Text>
            </Pressable>
          ))}
        </Animated.View>
      )}

      {/* Tenendo premuta una chat (dec. 190). */}
      <ActionSheet
        visible={!!menu}
        onClose={() => setMenu(null)}
        header={
          menu && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.xl, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: spacing.xs }}>
              <PersonAvatar personId={menu.personId} size={40} />
              <Text style={[typography.headline, { color: colors.text }]}>{nameOf(menu.personId)}</Text>
            </View>
          )
        }
        actions={
          menu
            ? [
                menu.unread > 0
                  ? { icon: 'mail-open-outline', label: T.markRead, onPress: () => markRead(menu.id) }
                  : { icon: 'mail', label: T.markUnread, onPress: () => markUnread(menu.id) },
                { icon: menu.muted ? 'bell' : 'bell-off', label: menu.muted ? T.unmute : T.mute, onPress: () => toggleMuted(menu.id) },
                { icon: 'star', label: menu.important ? T.unmarkImportant : T.markImportant, onPress: () => toggleImportant(menu.id) },
                { icon: 'archive', label: menu.archived ? T.unarchive : T.archive, onPress: () => toggleArchived(menu.id) },
              ]
            : []
        }
      />

      {/* Tre puntini fuori da iOS (dec. 212, 213). */}
      <ActionSheet visible={more} onClose={() => setMore(false)} actions={items.map((it): SheetAction => ({ icon: it.icon, label: it.label, onPress: it.onPress }))} />
    </View>
  );
}

function ThreadCard({ thread, selected, onPress, onLongPress }: { thread: Thread; selected?: boolean; onPress: () => void; onLongPress: () => void }) {
  const { colors, typography, spacing } = useTheme();
  const T = t.messages;
  const last = lastOf(thread);
  const name = nameOf(thread.personId);
  const role = thread.personId === ASSISTANT ? T.assistant : thread.request ? T.request : T.friend;
  const preview = !last
    ? ''
    : last.image
      ? T.photo
      : last.video
        ? T.video
        : last.file
          ? `${T.file}: ${last.file.name}`
          : last.note
            ? `${T.notes}: ${last.note.title}`
            : last.audio
              ? T.voice(`${Math.round(last.audio.seconds)}″`)
              : (last.text ?? '');
  const unread = thread.unread > 0;
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={350}
      accessibilityRole="button"
      accessibilityHint={selected === undefined ? T.longPressHint : undefined}
      accessibilityState={selected === undefined ? undefined : { selected }}
      accessibilityActions={[{ name: 'longpress', label: T.more }]}
      onAccessibilityAction={(e) => e.nativeEvent.actionName === 'longpress' && onLongPress()}
      accessibilityLabel={[name, role, thread.muted && T.mutedLabel, preview, unread && T.unreadA11y(thread.unread)].filter(Boolean).join(', ')}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        backgroundColor: pressed ? colors.surfaceMuted : 'transparent',
      })}
    >
      {/* Entrando in Seleziona il cerchio cresce e la riga scivola a destra (dec. 215); con Riduci movimento Reanimated salta l'animazione. */}
      {selected !== undefined && (
        <Animated.View entering={ZoomIn.duration(200)} exiting={ZoomOut.duration(150)}>
          {selected ? <Icon name="checkmark-circle" size={26} color={colors.accent} /> : <View style={{ width: 24, height: 24, margin: 1, borderRadius: 12, borderWidth: 2, borderColor: colors.border }} />}
        </Animated.View>
      )}
      <Animated.View layout={LinearTransition.duration(200)}>
        <PersonAvatar personId={thread.personId} size={56} dot />
      </Animated.View>
      <Animated.View layout={LinearTransition.duration(200)} style={{ flex: 1, gap: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm }}>
          {/* Importante: stella piena a sinistra del nome (dec. 222). */}
          {thread.important && <AnimatedStar active size={14} color={colors.gold} />}
          <Text style={[typography.headline, { color: colors.text }]} numberOfLines={1}>
            {name}
          </Text>
          <Text style={[typography.caption, { color: colors.textTertiary }]}>{role}</Text>
          {thread.muted && <Icon name="bell-off" size={14} color={colors.textTertiary} />}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          {last?.from === 'me' && thread.personId !== ASSISTANT && <Ticks status={last.status} />}
          <Text style={[typography.callout, { flex: 1, color: unread ? colors.text : colors.textSecondary, fontWeight: unread ? '600' : '400' }]} numberOfLines={1}>
            {last?.from === 'me' ? T.you : ''}
            {preview}
          </Text>
        </View>
      </Animated.View>
      {/* A destra: non letti sopra, data sotto (dec. 209). */}
      <View style={{ alignItems: 'flex-end', gap: spacing.xs }}>
        {unread && (
          <View style={{ minWidth: 22, height: 22, paddingHorizontal: 6, borderRadius: 11, backgroundColor: thread.muted ? colors.textTertiary : colors.accent, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={[typography.caption, { color: colors.onAccent, fontWeight: '700' }]}>{thread.unread}</Text>
          </View>
        )}
        <Text style={[typography.caption, { color: unread ? colors.accent : colors.textTertiary }]}>{last ? shortWhen(last.at) : ''}</Text>
      </View>
    </Pressable>
  );
}
