import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { FriendAvatar } from '../components/FriendAvatar';
import { tap } from '../components/haptics';
import { Icon } from '../components/icons';
import { Segmented } from '../components/onboarding';
import { EmptyState } from '../components/ui';
import { t } from '../i18n';
import { followersOf, followingOf, useFriends } from '../state/friends';
import { useTheme } from '../theme';

/**
 * Seguiti e Follower (dec. 229): si apre toccando i numeri in Profilo. Due schede, con la ricerca per nome o per
 * codice (#1234); un tocco apre il profilo della persona. Persone solo dimostrative: nessun backend (dec. 53).
 */
export default function Seguiti() {
  const { tipo } = useLocalSearchParams<{ tipo?: string }>();
  const { colors, typography, spacing, radius } = useTheme();
  const T = t.profile.follow;
  const state = useFriends();
  const lists = [followingOf(state), followersOf(state)];
  const tabs = [T.followingTab(lists[0].length), T.followersTab(lists[1].length)];
  const [current, setCurrent] = useState(tipo === 'followers' ? 1 : 0);
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase().replace(/^#/, '');
  const shown = lists[current].filter((p) => !q || p.name.toLowerCase().includes(q) || p.code.startsWith(q));

  return (
    <ScrollView
      style={{ backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.bg }}
      contentContainerStyle={{ padding: spacing.xl, paddingTop: spacing.xxxl, gap: spacing.xl, paddingBottom: spacing.giant }}
      keyboardShouldPersistTaps="handled"
    >
      <Text accessibilityRole="header" style={[typography.title1, { color: colors.heading }]}>
        {current === 0 ? t.profile.followingLabel : t.profile.followersLabel}
      </Text>
      <Segmented options={tabs} value={tabs[current]} onChange={(v) => setCurrent(tabs.indexOf(v))} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, height: 44, paddingHorizontal: spacing.md, borderRadius: radius.lg, backgroundColor: colors.surfaceMuted, borderWidth: 2, borderColor: colors.border }}>
        <Icon name="search-outline" size={18} color={colors.textTertiary} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={T.search}
          placeholderTextColor={colors.textTertiary}
          accessibilityLabel={T.search}
          autoCorrect={false}
          autoCapitalize="none"
          style={[typography.body, { flex: 1, color: colors.text, padding: 0 }]}
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery('')} accessibilityRole="button" accessibilityLabel={T.clear} hitSlop={10}>
            <Icon name="close-circle-outline" size={18} color={colors.textTertiary} />
          </Pressable>
        )}
      </View>
      {shown.length === 0 ? (
        <EmptyState icon="people-outline" message={q ? T.noResults : current === 0 ? T.noFollowing : T.noFollowers} />
      ) : (
        <View style={{ borderRadius: radius.xl, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.surface, overflow: 'hidden' }}>
          {shown.map((p, i) => (
            <Pressable
              key={p.id}
              onPress={() => {
                tap();
                router.push({ pathname: '/amico/[id]', params: { id: p.id } });
              }}
              accessibilityRole="button"
              accessibilityLabel={t.profile.openFriend(p.name)}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.md,
                minHeight: 64,
                paddingHorizontal: spacing.lg,
                paddingVertical: spacing.sm,
                borderTopWidth: i === 0 ? 0 : 2,
                borderTopColor: colors.border,
                backgroundColor: pressed ? colors.surfaceMuted : 'transparent',
              })}
            >
              <FriendAvatar person={p} size={44} />
              <View style={{ flex: 1 }}>
                <Text style={[typography.headline, { color: colors.text }]} numberOfLines={1}>
                  {p.name}
                </Text>
                <Text style={[typography.caption, { color: colors.textTertiary }]}>#{p.code}</Text>
              </View>
              <Icon name="chevron-forward" size={18} color={colors.borderBold} />
            </Pressable>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
