import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Share, Text, View } from 'react-native';
import { Avatar } from '../components/avatar/Avatar';
import { AvatarPlaceholder } from '../components/avatar/Placeholder';
import { success, tap } from '../components/haptics';
import { ProfileQr } from '../components/ProfileQr';
import { t } from '../i18n';
import { myTag, profileLink, useProfile } from '../state/profile';
import { useTheme } from '../theme';
import { Icon, type IconName } from '../components/icons';

/** Codice QR del profilo (dec. 136), come la card di Duolingo: nome, codice, QR con l'avatar e due azioni. */
export default function QrModal() {
  const { colors, typography, spacing, radius, layout } = useTheme();
  const profile = useProfile();
  const avatar = profile.avatar;
  const [copied, setCopied] = useState(false);
  const name = `${profile.firstName} ${profile.lastName}`;

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: spacing.xxl }}>
      <Pressable style={{ position: 'absolute', inset: 0, backgroundColor: colors.blanket }} onPress={() => router.back()} accessibilityLabel={t.qr.close} />

      <View accessibilityViewIsModal style={{ backgroundColor: colors.surfaceOverlay, borderRadius: radius.xxl, padding: spacing.xxl, gap: spacing.xl, alignItems: 'center', maxWidth: 420, width: '100%', alignSelf: 'center' }}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={t.qr.close}
          style={({ pressed }) => ({ position: 'absolute', left: spacing.md, top: spacing.md, width: layout.iconButton, height: layout.iconButton, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : 1 })}
        >
          <Icon name="close" size={28} color={colors.text} />
        </Pressable>

        <View style={{ alignItems: 'center', gap: spacing.xxs, paddingHorizontal: layout.iconButton }}>
          <Text accessibilityRole="header" style={[typography.title2, { color: colors.text }]} numberOfLines={1}>
            {name}
          </Text>
          <Text style={[typography.callout, { color: colors.textTertiary }]}>{myTag}</Text>
        </View>

        <View style={{ borderRadius: radius.xl, overflow: 'hidden' }}>
          <ProfileQr
            value={profileLink}
            size={240}
            accessibilityLabel={t.qr.image(name)}
            center={
              avatar ? (
                <Avatar config={avatar} size={58} shape="square" />
              ) : (
                <View style={{ flex: 1, backgroundColor: colors.selected, alignItems: 'center', justifyContent: 'flex-end' }}>
                  <AvatarPlaceholder size={52} />
                </View>
              )
            }
          />
        </View>

        <Text style={[typography.title1, { color: colors.accent }]}>{t.appName}</Text>

        <View style={{ flexDirection: 'row', gap: spacing.xxl }}>
          <Action
            icon="share-outline"
            label={t.qr.share}
            onPress={() => {
              tap();
              Share.share({ message: t.qr.shareMessage(profileLink) }).catch(() => {});
            }}
          />
          <Action
            icon={copied ? 'checkmark' : 'link-outline'}
            label={copied ? t.qr.copied : t.qr.copy}
            onPress={async () => {
              await Clipboard.setStringAsync(profileLink);
              success();
              setCopied(true);
            }}
          />
        </View>
      </View>
    </View>
  );
}

/** Azione quadrata con l'etichetta sotto, come "Share link" / "Copy link". */
function Action({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) {
  const { colors, typography, spacing, radius } = useTheme();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={({ pressed }) => ({ alignItems: 'center', gap: spacing.sm, opacity: pressed ? 0.6 : 1 })}>
      <View style={{ width: 72, height: 72, borderRadius: radius.xxl, borderWidth: 2, borderBottomWidth: 4, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={28} color={colors.text} />
      </View>
      <Text style={[typography.callout, { color: colors.textSecondary }]}>{label}</Text>
    </Pressable>
  );
}
