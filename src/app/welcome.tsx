import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton, type IconName } from '../components/ui';
import { t } from '../i18n';
import { useTheme } from '../theme';

// Icone in orbita: stile proprio (Ionicons), non gli asset 3D del riferimento.
const ORBIT: { icon: IconName; ring: 0 | 1 | 2; angle: number }[] = [
  { icon: 'book', ring: 0, angle: -40 },
  { icon: 'calculator', ring: 1, angle: 110 },
  { icon: 'school', ring: 2, angle: -70 },
  { icon: 'globe-outline', ring: 2, angle: 190 },
  { icon: 'flask', ring: 1, angle: -150 },
  { icon: 'pencil', ring: 2, angle: 40 },
];
const RINGS = [70, 115, 160];

/** Welcome (DESIGN.md §7). */
export default function Welcome() {
  const { colors, typography, spacing } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.hero}>
        {RINGS.map((r) => (
          <View
            key={r}
            style={[styles.ring, { width: r * 2, height: r * 2, borderRadius: r, borderColor: colors.border }]}
          />
        ))}
        <View style={[styles.core, { backgroundColor: colors.surface }]}>
          <Ionicons name="planet" size={40} color={colors.primary} />
        </View>
        {ORBIT.map((o, i) => {
          const r = RINGS[o.ring];
          const rad = (o.angle * Math.PI) / 180;
          return (
            <View
              key={i}
              style={[
                styles.satellite,
                {
                  backgroundColor: colors.surface,
                  shadowColor: colors.shadow,
                  transform: [{ translateX: Math.cos(rad) * r }, { translateY: Math.sin(rad) * r }],
                },
              ]}
            >
              <Ionicons name={o.icon} size={20} color={i % 2 ? colors.accentWarm : colors.primary} />
            </View>
          );
        })}
      </View>

      <View style={{ padding: spacing.lg, gap: spacing.xxl }}>
        <View style={{ alignItems: 'center', gap: spacing.sm }}>
          <Text style={[typography.headline, { color: colors.textSecondary }]}>{t.appName}</Text>
          <Text style={[typography.display, { color: colors.text, textAlign: 'center' }]}>{t.welcome.claim}</Text>
        </View>
        <PrimaryButton title={t.welcome.start} onPress={() => router.replace('/home')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', borderWidth: 1 },
  core: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
  satellite: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
});
