import { Text, View } from 'react-native';
import type { Person } from '../state/friends';
import { useTheme } from '../theme';

/** Avatar di un amico: per ora le iniziali su un cerchio colorato (dec. 183). */
export function FriendAvatar({ person, size = 48 }: { person: Pick<Person, 'initials' | 'color'>; size?: number }) {
  const { typography } = useTheme();
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: person.color, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={[size >= 64 ? typography.title2 : typography.headline, { color: '#FFFFFF' }]}>{person.initials}</Text>
    </View>
  );
}
