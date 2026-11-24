import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { Avatar } from '../components/avatar/Avatar';
import { AvatarPlaceholder } from '../components/avatar/Placeholder';
import { confirm, notify } from '../components/dialogs';
import { success, tap, warn } from '../components/haptics';
import { leaveAccount, Row, Section, SheetPage } from '../components/settings';
import { demoUser } from '../data/demo';
import { t } from '../i18n';
import { useProfile } from '../state/profile';
import { authenticate, biometricKind, updateSettings, useSettings } from '../state/settings';
import { useTheme } from '../theme';
import { Icon } from '../components/icons';

/**
 * Impostazioni (dall'ingranaggio del Profilo, dec. 133, 137, 138), sul modello dello screen di riferimento:
 * avatar con la matita, voci dell'account (ognuna apre la sua pagina) e quelle dell'app con interruttori e valori.
 * L'ambiente si cambia dal menu della Home (dec. 124), non da qui.
 */
export default function Impostazioni() {
  const { colors, typography, spacing } = useTheme();
  const profile = useProfile();
  const settings = useSettings();
  const [bio, setBio] = useState<'face' | 'fingerprint' | null>(null);

  useEffect(() => {
    biometricKind().then(setBio).catch(() => setBio(null));
  }, []);

  const toggleBiometric = async (on: boolean) => {
    if (!on) return updateSettings({ biometricLock: false });
    if (!(await biometricKind())) {
      warn();
      return notify(t.settings.biometricUnavailableTitle, t.settings.biometricUnavailable);
    }
    if (await authenticate(t.settings.enablePrompt, t.settings.cancel)) {
      success();
      updateSettings({ biometricLock: true });
    }
  };

  return (
    <SheetPage title={t.profile.settingsTitle}>
      <View style={{ alignItems: 'center', paddingBottom: spacing.md, gap: spacing.md }}>
        <Pressable
          onPress={() => {
            tap();
            router.push(profile.avatar ? '/avatar' : '/avatar-intro');
          }}
          accessibilityRole="button"
          accessibilityLabel={profile.avatar ? t.settings.editAvatar : t.profile.createAvatar}
          style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
        >
          {profile.avatar ? (
            <Avatar config={profile.avatar} size={112} />
          ) : (
            <View style={{ width: 112, height: 112, borderRadius: 56, backgroundColor: colors.selected, alignItems: 'center', justifyContent: 'flex-end', overflow: 'hidden' }}>
              <AvatarPlaceholder size={96} />
            </View>
          )}
          <View style={{ position: 'absolute', right: -2, bottom: 4, width: 36, height: 36, borderRadius: 18, backgroundColor: colors.accent, borderWidth: 3, borderColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="pencil" size={16} color={colors.onAccent} />
          </View>
        </Pressable>
        <View style={{ alignItems: 'center', gap: spacing.xxs }}>
          <Text style={[typography.title2, { color: colors.text }]}>
            {profile.firstName} {profile.lastName}
          </Text>
          <Text style={[typography.body, { color: colors.textTertiary }]}>{demoUser.email}</Text>
        </View>
      </View>

      <Section title={t.settings.account}>
        <Row icon="user" label={t.profile.myAccount} detail={t.profile.myAccountDetail} onPress={() => router.push('/dati')} />
        <Row icon="shield" label={t.profile.security} detail={t.profile.securityDetail} onPress={() => router.push('/sicurezza')} />
        <Row icon="lock" label={t.profile.privacy} detail={t.profile.privacyDetail} onPress={() => router.push('/riservatezza')} />
      </Section>

      <Section title={t.settings.app}>
        <Row icon="bell" label={t.settings.push} detail={t.settings.pushDetail} toggle={{ value: settings.push, onChange: (v) => updateSettings({ push: v }) }} />
        {Platform.OS !== 'web' && (
          <Row
            icon={bio === 'fingerprint' ? 'fingerprint' : 'faceId'}
            label={bio === 'fingerprint' ? t.settings.biometric.fingerprint : Platform.OS === 'ios' ? t.settings.biometric.face : t.settings.biometric.generic}
            detail={t.settings.biometricDetail}
            toggle={{ value: settings.biometricLock, onChange: toggleBiometric }}
          />
        )}
        <Row icon="languages" label={t.settings.language} value={t.settings.languages[settings.language]} onPress={() => router.push('/scegli?cosa=lingua')} />
        <Row icon="moon" label={t.settings.appearance} value={t.settings.themes[settings.theme]} onPress={() => router.push('/scegli?cosa=aspetto')} />
        <Row icon="book" label={t.settings.plainCovers} detail={t.settings.plainCoversDetail} toggle={{ value: settings.plainCovers, onChange: (v) => updateSettings({ plainCovers: v }) }} />
      </Section>

      {/* "Esci" staccato dal resto solo dallo spazio, senza titolo e in rosso, come nello screen di riferimento (dec. 139). */}
      <Section>
        <Row icon="logout" label={t.account.signOut} danger onPress={() => confirm(t.account.signOutConfirm, t.account.signOut, leaveAccount, t.account.signOutDetail)} />
      </Section>
    </SheetPage>
  );
}
