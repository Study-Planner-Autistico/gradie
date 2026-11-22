import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ListGroup, ListRow } from '../../components/list';
import { Card, Chip, Screen, ScreenHeader, type IconName, IconButton, Fab } from '../../components/ui';
import { demoEnvironments, demoProfile, demoUser } from '../../data/demo';
import { t } from '../../i18n';
import { useEnvironment } from '../../state/environment';
import { useTheme, type TintName } from '../../theme';

/**
 * Profilo: in alto il profilo social (dec. 33, privato di default dec. 15),
 * sotto account e impostazioni (modulo 01 §5). DESIGN.md §6.4.
 */
export default function Profilo() {
  const { colors, typography, spacing, layout } = useTheme();
  const { active } = useEnvironment();
  const p = demoProfile;

  return (
    <View style={{ flex: 1 }}>
      <Screen>
        <ScreenHeader title={t.profile.title} right={<IconButton icon="share-outline" label={t.profile.share} />} />

        <Card style={{ gap: spacing.lg }}>
          {/* Foto grande + bottone quadrato per cambiarla */}
          <View style={styles.between}>
            <BigAvatar initials={`${demoUser.firstName[0]}${demoUser.lastName[0]}`} />
            <SquareButton icon="camera-outline" label={t.profile.changePhoto} />
          </View>

          {/* Nome + Modifica */}
          <View style={{ gap: spacing.xs }}>
            <View style={[styles.between, { alignItems: 'center' }]}>
              <Text style={[typography.display, { color: colors.text, flex: 1 }]} numberOfLines={2}>
                {demoUser.firstName} {demoUser.lastName}
              </Text>
              <SoftPill label={t.profile.edit} />
            </View>
            <View style={[styles.row, { gap: spacing.sm, flexWrap: 'wrap' }]}>
              <Text style={[typography.body, { color: colors.textSecondary }]}>
                {`${t.profile.following(p.following)} · ${t.profile.followers(p.followers)}`}
              </Text>
              <Chip variant="muted" icon="lock-closed-outline" label={t.profile.private} />
            </View>
          </View>

          {/* Interessi */}
          <View style={[styles.row, { flexWrap: 'wrap', gap: spacing.sm }]}>
            {p.interests.map((i) => (
              <InterestPill key={i.label} label={i.label} icon={i.icon} tint={i.tint} />
            ))}
            <InterestPill label={t.profile.moreInterests(p.moreInterests)} />
            <InterestPill label={t.profile.addInterest} icon="add" dashed />
          </View>

          {/* Azioni rapide */}
          <View style={{ gap: spacing.xs }}>
            <ActionRow icon="reorder-three-outline" label={t.profile.addBio} />
            <ActionRow icon="grid-outline" label={t.profile.posts} detail={t.profile.postsDetail(p.posts)} />
            <ActionRow icon="bookmark-outline" label={t.profile.saved} detail={t.profile.savedDetail(p.saved)} />
          </View>
        </Card>

        <ListGroup title={t.profile.settings}>
          <ListRow icon="person-outline" label={t.profile.myAccount} detail={t.profile.myAccountDetail} />
          <ListRow
            icon="business-outline"
            label={t.profile.environments}
            detail={`${active.name} · ${t.profile.environmentsDetail(demoEnvironments.length)}`}
            onPress={() => router.push('/ambienti')}
          />
          <ListRow icon="shield-checkmark-outline" label={t.profile.security} detail={t.profile.securityDetail} />
          <ListRow icon="options-outline" label={t.profile.preferences} detail={t.profile.preferencesDetail} />
          <ListRow icon="document-lock-outline" label={t.profile.privacy} detail={t.profile.privacyDetail} />
        </ListGroup>
      </Screen>

      <Fab icon="pencil" label={t.profile.editProfile} bottom={layout.tabBarClearance - spacing.lg} />
    </View>
  );
}

/** Foto profilo grande; senza foto mostra le iniziali sul gradiente mesh. */
function BigAvatar({ initials }: { initials: string }) {
  const { colors, typography } = useTheme();
  return (
    <View style={styles.bigAvatar}>
      <LinearGradient colors={colors.heroGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <Text style={[typography.hero, { color: colors.text }]}>{initials.toUpperCase()}</Text>
    </View>
  );
}

function SquareButton({ icon, label }: { icon: IconName; label: string }) {
  const { colors, radius } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({
        width: 60,
        height: 60,
        borderRadius: radius.lg,
        backgroundColor: colors.surfaceMuted,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ scale: pressed ? 0.95 : 1 }],
      })}
    >
      <Ionicons name={icon} size={24} color={colors.text} />
    </Pressable>
  );
}

function SoftPill({ label }: { label: string }) {
  const { colors, radius, typography } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => ({
        paddingHorizontal: 16,
        height: 36,
        borderRadius: radius.md,
        backgroundColor: colors.surfaceMuted,
        justifyContent: 'center',
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <Text style={[typography.callout, { color: colors.textSecondary, fontWeight: '600' }]}>{label}</Text>
    </Pressable>
  );
}

function InterestPill({ label, icon, tint, dashed }: { label: string; icon?: IconName; tint?: TintName; dashed?: boolean }) {
  const { colors, radius, typography, spacing } = useTheme();
  const iconColor = tint ? colors.tints[tint].fg : colors.textSecondary;
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        height: 44,
        paddingHorizontal: spacing.lg,
        borderRadius: radius.pill,
        borderWidth: 1.5,
        borderStyle: dashed ? 'dashed' : 'solid',
        borderColor: colors.border,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      {icon &&
        (tint ? (
          <View style={[styles.pillIcon, { backgroundColor: colors.tints[tint].bg }]}>
            <Ionicons name={icon} size={14} color={iconColor} />
          </View>
        ) : (
          <Ionicons name={icon} size={18} color={iconColor} />
        ))}
      <Text style={[typography.headline, { color: dashed ? colors.textSecondary : colors.text }]}>{label}</Text>
    </Pressable>
  );
}

function ActionRow({ icon, label, detail }: { icon: IconName; label: string; detail?: string }): ReactNode {
  const { colors, typography, spacing } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [styles.row, { gap: spacing.lg, paddingVertical: spacing.sm, opacity: pressed ? 0.8 : 1 }]}
    >
      <View style={[styles.actionIcon, { backgroundColor: colors.surfaceMuted }]}>
        <Ionicons name={icon} size={20} color={colors.textSecondary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[typography.headline, { color: colors.textSecondary }]}>{label}</Text>
        {detail && <Text style={[typography.caption, { color: colors.textTertiary }]}>{detail}</Text>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  bigAvatar: { width: 128, height: 128, borderRadius: 64, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  pillIcon: { width: 24, height: 24, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  actionIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
});
