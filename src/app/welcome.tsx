import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Glass } from '../components/Glass';
import { PrimaryButton, type IconName } from '../components/ui';
import { t } from '../i18n';
import { useTheme } from '../theme';

// Icone in orbita: stile proprio (Ionicons outline) su satelliti in glass.
const ORBIT: { icon: IconName; ring: 0 | 1 | 2; angle: number }[] = [
  { icon: 'book-outline', ring: 0, angle: -40 },
  { icon: 'calculator-outline', ring: 1, angle: 110 },
  { icon: 'school-outline', ring: 2, angle: -70 },
  { icon: 'globe-outline', ring: 2, angle: 190 },
  { icon: 'flask-outline', ring: 1, angle: -150 },
  { icon: 'pencil-outline', ring: 2, angle: 40 },
];
const RINGS = [70, 115, 160];

/** Benvenuto (modulo 01 ON-01, DESIGN.md §2.4 e §1). */
export default function Welcome() {
  const { colors, typography, spacing } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <LinearGradient colors={colors.heroGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.hero}>
          {RINGS.map((r) => (
            <View
              key={r}
              style={[styles.ring, { width: r * 2, height: r * 2, borderRadius: r, borderColor: colors.glassBorder }]}
            />
          ))}
          <Glass style={styles.core}>
            <Ionicons name="planet-outline" size={40} color={colors.text} />
          </Glass>
          {ORBIT.map((o, i) => {
            const r = RINGS[o.ring];
            const rad = (o.angle * Math.PI) / 180;
            return (
              <View
                key={i}
                style={[styles.satelliteWrap, { transform: [{ translateX: Math.cos(rad) * r }, { translateY: Math.sin(rad) * r }] }]}
              >
                <Glass style={styles.satellite}>
                  <Ionicons name={o.icon} size={20} color={colors.text} />
                </Glass>
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
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  ring: { position: 'absolute', borderWidth: 1 },
  core: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
  satelliteWrap: { position: 'absolute' },
  satellite: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});
