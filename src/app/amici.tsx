import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { FriendAvatar } from '../components/FriendAvatar';
import { success, tap } from '../components/haptics';
import { Icon } from '../components/icons';
import { Segmented } from '../components/onboarding';
import { EmptyState } from '../components/ui';
import { t } from '../i18n';
import { acceptRequest, cancelRequest, declineRequest, friendsOf, incomingOf, outgoingOf, useFriends, type Person } from '../state/friends';
import { useTheme } from '../theme';

/**
 * Amici e richieste (dec. 187): si apre da Profilo > Amici ("Vedi tutti" o "Richieste di amicizia").
 * Amici: tutti, con la ricerca; un tocco apre il profilo. Richieste: ricevute (accetta / rifiuta) e inviate (annulla).
 */
export default function Amici() {
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const { colors, typography, spacing, radius } = useTheme();
  const T = t.profile.hub;
  const state = useFriends();
  const friends = friendsOf(state);
  const incoming = incomingOf(state);
  const outgoing = outgoingOf(state);
  const tabs = [T.friendsTab(friends.length), T.requestsTab(incoming.length)];
  const [current, setCurrent] = useState(tab === 'requests' ? 1 : 0);
  const [query, setQuery] = useState('');
  const shown = friends.filter((f) => f.name.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <ScrollView
      style={{ backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.bg }}
      contentContainerStyle={{ padding: spacing.xl, paddingTop: spacing.xxxl, gap: spacing.xl, paddingBottom: spacing.giant }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text accessibilityRole="header" style={[typography.title1, { flex: 1, color: colors.heading }]}>
          {t.profile.friends}
        </Text>
        <Pressable
          onPress={() => {
            tap();
            router.push('/aggiungi-amico');
          }}
          accessibilityRole="button"
          accessibilityLabel={T.add}
          style={({ pressed }) => ({ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.selected, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : 1 })}
        >
          <Icon name="person-add-outline" size={22} color={colors.selectedText} />
        </Pressable>
      </View>
      <Segmented options={tabs} value={tabs[current]} onChange={(v) => setCurrent(tabs.indexOf(v))} />

      {current === 0 ? (
        <>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, height: 44, paddingHorizontal: spacing.md, borderRadius: radius.lg, backgroundColor: colors.surfaceMuted }}>
            <Icon name="search-outline" size={18} color={colors.textTertiary} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={T.search}
              placeholderTextColor={colors.textTertiary}
              accessibilityLabel={T.search}
              style={[typography.body, { flex: 1, color: colors.text, padding: 0 }]}
            />
          </View>
          {shown.length === 0 ? (
            <EmptyState icon="people-outline" message={T.noFriends} />
          ) : (
            <View style={{ borderRadius: radius.xl, backgroundColor: colors.surface, overflow: 'hidden' }}>
              {shown.map((f, i) => (
                <PersonRow
                  key={f.id}
                  person={f}
                  first={i === 0}
                  onPress={() => router.push({ pathname: '/amico/[id]', params: { id: f.id } })}
                  trailing={<Icon name="chevron-forward" size={18} color={colors.textTertiary} />}
                />
              ))}
            </View>
          )}
        </>
      ) : incoming.length === 0 && outgoing.length === 0 ? (
        <EmptyState icon="people-outline" message={T.noRequests} />
      ) : (
        <>
          {incoming.length > 0 && (
            <Group title={T.received}>
              {incoming.map((p, i) => (
                <PersonRow
                  key={p.id}
                  person={p}
                  first={i === 0}
                  trailing={
                    <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                      <Small label={T.decline} onPress={() => declineRequest(p.id)} />
                      <Small
                        label={T.accept}
                        primary
                        onPress={() => {
                          success();
                          acceptRequest(p.id);
                        }}
                      />
                    </View>
                  }
                />
              ))}
            </Group>
          )}
          {outgoing.length > 0 && (
            <Group title={T.sentTitle}>
              {outgoing.map((p, i) => (
                <PersonRow key={p.id} person={p} first={i === 0} detail={T.waiting} trailing={<Small label={T.cancel} onPress={() => cancelRequest(p.id)} />} />
              ))}
            </Group>
          )}
        </>
      )}
    </ScrollView>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  const { colors, typography, spacing, radius } = useTheme();
  return (
    <View style={{ gap: spacing.sm }}>
      <Text accessibilityRole="header" style={[typography.label, { color: colors.textTertiary, paddingHorizontal: spacing.sm }]}>
        {title}
      </Text>
      <View style={{ borderRadius: radius.xl, backgroundColor: colors.surface, overflow: 'hidden' }}>{children}</View>
    </View>
  );
}

function PersonRow({ person, first, detail, trailing, onPress }: { person: Person; first: boolean; detail?: string; trailing?: React.ReactNode; onPress?: () => void }) {
  const { colors, typography, spacing } = useTheme();
  return (
    <Pressable
      onPress={
        onPress &&
        (() => {
          tap();
          onPress();
        })
      }
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={onPress ? t.profile.openFriend(person.name) : undefined}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        minHeight: 64,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderTopWidth: first ? 0 : 1,
        borderTopColor: colors.border,
        backgroundColor: pressed ? colors.surfaceMuted : 'transparent',
      })}
    >
      <FriendAvatar person={person} size={44} />
      <View style={{ flex: 1 }}>
        <Text style={[typography.headline, { color: colors.text }]} numberOfLines={1}>
          {person.name}
        </Text>
        <Text style={[typography.caption, { color: colors.textTertiary }]}>{detail ? `#${person.code} · ${detail}` : `#${person.code}`}</Text>
      </View>
      {trailing}
    </Pressable>
  );
}

function Small({ label, primary, onPress }: { label: string; primary?: boolean; onPress: () => void }) {
  const { colors, typography, spacing, radius } = useTheme();
  return (
    <Pressable
      onPress={() => {
        tap();
        onPress();
      }}
      accessibilityRole="button"
      style={({ pressed }) => ({
        minHeight: 36,
        paddingHorizontal: spacing.md,
        borderRadius: radius.pill,
        justifyContent: 'center',
        backgroundColor: primary ? (pressed ? colors.accentPressed : colors.accent) : pressed ? colors.neutralPressed : colors.surfaceMuted,
      })}
    >
      <Text style={[typography.callout, { fontWeight: '600', color: primary ? colors.onAccent : colors.textSecondary }]}>{label}</Text>
    </Pressable>
  );
}
