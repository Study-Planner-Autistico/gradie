import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { nameOf, PersonAvatar, shortWhen, Ticks } from '../components/chat';
import { tap } from '../components/haptics';
import { Icon } from '../components/icons';
import { Segmented } from '../components/onboarding';
import { EmptyState } from '../components/ui';
import { t } from '../i18n';
import { friendsOf, useFriends } from '../state/friends';
import { ASSISTANT, lastOf, threadFor, useThreads, type Thread } from '../state/messages';
import { useTheme } from '../theme';

type Filter = 'all' | 'important' | 'requests';

/**
 * Messaggi (dec. 189), dall'aereo in alto a destra della Home, come i Direct di Instagram.
 * In alto tutti i contatti (un tocco apre la chat), poi i filtri Tutti / Importanti / Richieste e le conversazioni.
 */
export default function Messaggi() {
  const { colors, typography, spacing, radius, layout } = useTheme();
  const insets = useSafeAreaInsets();
  const T = t.messages;
  const threads = useThreads();
  const friends = friendsOf(useFriends());
  const [filter, setFilter] = useState<Filter>('all');
  const [searching, setSearching] = useState(false);
  const [query, setQuery] = useState('');

  const requests = threads.filter((x) => x.request);
  const labels: Record<Filter, string> = {
    all: T.filters.all,
    important: T.filters.important,
    requests: requests.length ? `${T.filters.requests} (${requests.length})` : T.filters.requests,
  };
  const order: Filter[] = ['all', 'important', 'requests'];

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return threads
      .filter((x) => (filter === 'requests' ? x.request : !x.request && (filter === 'all' || x.important)))
      .filter((x) => x.messages.length > 0 || x.personId === ASSISTANT)
      .filter((x) => !q || nameOf(x.personId).toLowerCase().includes(q) || x.messages.some((m) => m.text?.toLowerCase().includes(q)))
      .sort((a, b) => (lastOf(b)?.at ?? 0) - (lastOf(a)?.at ?? 0));
  }, [threads, filter, query]);

  const open = (personId: string) => {
    tap();
    router.push({ pathname: '/chat/[id]', params: { id: threadFor(personId) } });
  };
  const iconBtn = ({ pressed }: { pressed: boolean }) => ({ width: layout.iconButton, height: layout.iconButton, alignItems: 'center' as const, justifyContent: 'center' as const, opacity: pressed ? 0.6 : 1 });

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, minHeight: 52 }}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel={T.back} style={iconBtn}>
          <Icon name="chevron-back" size={26} color={colors.text} />
        </Pressable>
        <Text accessibilityRole="header" style={[typography.headline, { flex: 1, textAlign: 'center', color: colors.text }]}>
          {T.title}
        </Text>
        <Pressable
          onPress={() => {
            tap();
            setSearching((v) => !v);
            setQuery('');
          }}
          accessibilityRole="button"
          accessibilityLabel={T.search}
          accessibilityState={{ expanded: searching }}
          style={iconBtn}
        >
          <Icon name={searching ? 'close' : 'search-outline'} size={24} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: insets.bottom + spacing.giant, gap: spacing.lg }} keyboardShouldPersistTaps="handled">
        {searching && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, height: 44, paddingHorizontal: spacing.md, borderRadius: radius.lg, backgroundColor: colors.surfaceMuted }}>
            <Icon name="search-outline" size={18} color={colors.textTertiary} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              autoFocus
              placeholder={T.search}
              placeholderTextColor={colors.textTertiary}
              accessibilityLabel={T.search}
              style={[typography.body, { flex: 1, color: colors.text, padding: 0 }]}
            />
          </View>
        )}

        <Text accessibilityRole="header" style={[typography.title1, { color: colors.text, marginTop: spacing.sm }]}>
          {T.contacts}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -spacing.xl }} contentContainerStyle={{ paddingHorizontal: spacing.xl, gap: spacing.lg }}>
          {[ASSISTANT, ...friends.map((f) => f.id)].map((id) => (
            <Pressable key={id} onPress={() => open(id)} accessibilityRole="button" accessibilityLabel={T.openChat(nameOf(id))} style={({ pressed }) => ({ alignItems: 'center', gap: spacing.xs, width: 60, opacity: pressed ? 0.6 : 1 })}>
              <PersonAvatar personId={id} size={56} dot />
              <Text style={[typography.caption, { color: colors.textSecondary }]} numberOfLines={1}>
                {nameOf(id)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <Segmented options={order.map((f) => labels[f])} value={labels[filter]} onChange={(v) => setFilter(order[order.map((f) => labels[f]).indexOf(v)] ?? 'all')} />

        {shown.length === 0 ? (
          <EmptyState icon="chatbubbles-outline" message={query ? T.noResults : T.empty[filter]} />
        ) : (
          <View style={{ gap: spacing.sm }}>
            {shown.map((th) => (
              <ThreadCard key={th.id} thread={th} onPress={() => open(th.personId)} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function ThreadCard({ thread, onPress }: { thread: Thread; onPress: () => void }) {
  const { colors, typography, spacing, radius } = useTheme();
  const T = t.messages;
  const last = lastOf(thread);
  const name = nameOf(thread.personId);
  const role = thread.personId === ASSISTANT ? T.assistant : thread.request ? T.request : T.friend;
  const preview = !last ? '' : last.image ? T.photo : last.audio ? T.voice(`${Math.round(last.audio.seconds)}″`) : (last.text ?? '');
  const unread = thread.unread > 0;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={[name, role, preview, unread && T.unreadA11y(thread.unread)].filter(Boolean).join(', ')}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        padding: spacing.md,
        borderRadius: radius.xl,
        backgroundColor: pressed ? colors.surfaceMuted : colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
      })}
    >
      <PersonAvatar personId={thread.personId} size={48} dot />
      <View style={{ flex: 1, gap: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: spacing.sm }}>
          <Text style={[typography.headline, { color: colors.text }]} numberOfLines={1}>
            {name}
          </Text>
          <Text style={[typography.caption, { color: colors.textTertiary }]}>{role}</Text>
          {thread.important && <Icon name="star" size={14} color={colors.gold} />}
          <Text style={[typography.caption, { marginLeft: 'auto', color: unread ? colors.accent : colors.textTertiary }]}>{last ? shortWhen(last.at) : ''}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          {last?.from === 'me' && <Ticks read={last.read} />}
          <Text style={[typography.callout, { flex: 1, color: unread ? colors.text : colors.textSecondary, fontWeight: unread ? '600' : '400' }]} numberOfLines={1}>
            {last?.from === 'me' ? T.you : ''}
            {preview}
          </Text>
          {unread && (
            <View style={{ minWidth: 22, height: 22, paddingHorizontal: 6, borderRadius: 11, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={[typography.caption, { color: colors.onAccent, fontWeight: '700' }]}>{thread.unread}</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}
