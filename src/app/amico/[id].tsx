import { router, useLocalSearchParams } from 'expo-router';
import { Alert, Platform, ScrollView, Text, View } from 'react-native';
import { Row, Section } from '../../components/settings';
import { t } from '../../i18n';
import { blockFriend, findPerson, setFollowing, useFriends } from '../../state/friends';
import { threadFor } from '../../state/messages';
import { useTheme } from '../../theme';

/** Profilo di un amico (dec. 183): si apre toccandolo in Profilo; messaggio, smetti di seguire, blocca. */
export default function Amico() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, typography, spacing } = useTheme();
  const friends = useFriends();
  // Anche gli amici aggiunti col codice o col QR (dec. 187).
  const f = findPerson(id);
  if (!f) return null;
  const following = !friends.unfollowed.includes(f.id);
  const T = t.profile.friend;

  const unfollow = () =>
    Alert.alert(T.unfollowTitle(f.name), T.unfollowBody, [
      { text: T.cancel, style: 'cancel' },
      { text: T.unfollow, style: 'destructive', onPress: () => setFollowing(f.id, false) },
    ]);
  const block = () =>
    Alert.alert(T.blockTitle(f.name), T.blockBody, [
      { text: T.cancel, style: 'cancel' },
      {
        text: T.block,
        style: 'destructive',
        onPress: () => {
          blockFriend(f.id);
          router.back();
        },
      },
    ]);

  return (
    <ScrollView style={{ backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.bg }} contentContainerStyle={{ paddingBottom: spacing.giant }}>
      <View style={{ alignItems: 'center', gap: spacing.sm, paddingTop: spacing.xxxl, paddingBottom: spacing.xxl }}>
        <View style={{ width: 104, height: 104, borderRadius: 52, backgroundColor: f.color, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={[typography.display, { color: '#FFFFFF' }]}>{f.initials}</Text>
        </View>
        <Text accessibilityRole="header" style={[typography.title1, { color: colors.accent }]}>
          {f.name}
        </Text>
        <Text style={[typography.callout, { color: colors.textSecondary }]}>{following ? T.mutual : T.followsYou}</Text>
      </View>
      <Section first>
        <Row icon="paper-plane-outline" label={T.message} onPress={() => router.push({ pathname: '/chat/[id]', params: { id: threadFor(f.id) } })} />
        <Row
          icon={following ? 'person-remove-outline' : 'person-add-outline'}
          label={following ? T.unfollow : T.follow}
          onPress={following ? unfollow : () => setFollowing(f.id, true)}
        />
        <Row icon="person-block-outline" label={T.block} onPress={block} danger />
      </Section>
    </ScrollView>
  );
}
