import { router } from 'expo-router';
import { Platform, Text, View } from 'react-native';
import { Avatar, DEFAULT_AVATAR, type AvatarConfig } from '../components/avatar/Avatar';
import { AvatarPlaceholder } from '../components/avatar/Placeholder';
import { Button } from '../components/ui';
import { t } from '../i18n';
import { avatarPalette, useTheme } from '../theme';

// Due esempi decorativi ai lati della sagoma, come nel foglio di Duolingo.
const left: AvatarConfig = { ...DEFAULT_AVATAR, skin: avatarPalette.skin[5], hair: 'womanLong', hairColor: avatarPalette.hair[5], mouth: 'laugh', eyes: 'smile', eyebrow: 'upWoman', shirtColor: avatarPalette.shirt[5], bg: avatarPalette.bg[4] };
const right: AvatarConfig = { ...DEFAULT_AVATAR, skin: avatarPalette.skin[2], hair: 'thick', hairColor: avatarPalette.hair[1], glasses: 'square', shirt: 'polo', shirtColor: avatarPalette.shirt[3], bg: avatarPalette.bg[3] };

/** Invito a creare l'avatar (dec. 136): si apre toccando la sagoma nel Profilo. */
export default function AvatarIntro() {
  const { colors, typography, spacing, radius } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.bg, padding: spacing.xxl, paddingTop: spacing.xxxl, gap: spacing.xxxl }}>
      <Text accessibilityRole="header" style={[typography.title1, { color: colors.heading, textAlign: 'center' }]}>
        {t.avatar.introTitle}
      </Text>

      <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.lg }}>
        <Avatar config={left} size={96} />
        <View style={{ width: 140, height: 140, borderRadius: radius.pill, backgroundColor: colors.selected, alignItems: 'center', justifyContent: 'flex-end', overflow: 'hidden' }}>
          <AvatarPlaceholder size={120} />
        </View>
        <Avatar config={right} size={96} />
      </View>

      <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center' }]}>{t.avatar.introBody}</Text>

      <View style={{ gap: spacing.sm }}>
        <Button title={t.avatar.start} appearance="primary" onPress={() => router.replace('/avatar')} />
        <Button title={t.avatar.later} appearance="subtle" onPress={() => router.back()} />
      </View>
    </View>
  );
}
