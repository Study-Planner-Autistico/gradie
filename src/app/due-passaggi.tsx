import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { confirm } from '../components/dialogs';
import { success } from '../components/haptics';
import { CodeInput } from '../components/onboarding';
import { ProfileQr } from '../components/ProfileQr';
import { SheetPage } from '../components/settings';
import { Button, Checkbox, SectionMessage } from '../components/ui';
import { demoRecoveryCodes, demoTotpSecret, demoUser } from '../data/demo';
import { t } from '../i18n';
import { updateSettings, useSettings } from '../state/settings';
import { useTheme } from '../theme';

/**
 * Verifica in due passaggi (dec. 56, 138), stessi passi dell'onboarding dei docenti: QR per l'app di autenticazione,
 * codice a 6 cifre, codici di recupero. Il QR è reale (otpauth); il codice non si verifica finché non c'è il server.
 */
export default function DuePassaggi() {
  const { spacing } = useTheme();
  const { twoFactor } = useSettings();
  const [phase, setPhase] = useState<'scan' | 'codes'>('scan');
  const [code, setCode] = useState('');
  const [saved, setSaved] = useState(false);

  if (twoFactor) {
    return (
      <SheetPage title={t.account.twoFactor}>
        <View style={{ paddingHorizontal: spacing.xxl, gap: spacing.xl }}>
          <SectionMessage appearance="success" title={t.account.on}>
            {t.account.twoFactorOnBody}
          </SectionMessage>
          <RecoveryCodes />
          <Button
            title={t.account.turnOff}
            appearance="danger"
            onPress={() =>
              confirm(t.account.turnOffConfirm, t.account.turnOff, () => {
                updateSettings({ twoFactor: false });
                router.back();
              }, t.account.turnOffDetail)
            }
          />
        </View>
      </SheetPage>
    );
  }

  if (phase === 'scan') {
    const uri = `otpauth://totp/${encodeURIComponent(`${t.appName}:${demoUser.email}`)}?secret=${demoTotpSecret}&issuer=${encodeURIComponent(t.appName)}`;
    return (
      <SheetPage title={t.account.twoFactor}>
        <View style={{ paddingHorizontal: spacing.xxl, gap: spacing.xl }}>
          <Step n={1} text={t.onb.totp.step1} />
          <View style={{ alignItems: 'center', gap: spacing.sm }}>
            <ProfileQr value={uri} size={200} accessibilityLabel={t.onb.totp.step1} />
            <Hint text={t.onb.totp.manual} />
            <Key text={demoTotpSecret.replace(/(.{4})/g, '$1 ').trim()} />
          </View>
          <Step n={2} text={t.onb.totp.step2} />
          <CodeInput
            value={code}
            label={t.onb.verify.label}
            onChange={(v) => {
              setCode(v);
              if (v.length === 6) {
                success();
                setTimeout(() => setPhase('codes'), 250);
              }
            }}
          />
        </View>
      </SheetPage>
    );
  }

  return (
    <SheetPage title={t.onb.totp.codesTitle}>
      <View style={{ paddingHorizontal: spacing.xxl, gap: spacing.xl }}>
        <Hint text={t.onb.totp.codesBody} />
        <RecoveryCodes />
        <Checkbox checked={saved} onChange={setSaved} label={t.onb.totp.saved} />
        <Button
          title={t.account.turnOn}
          appearance="primary"
          disabled={!saved}
          onPress={() => {
            success();
            updateSettings({ twoFactor: true });
            router.back();
          }}
        />
      </View>
    </SheetPage>
  );
}

function RecoveryCodes() {
  const { colors, typography, spacing, radius } = useTheme();
  const [copied, setCopied] = useState(false);
  return (
    <View style={{ gap: spacing.md }}>
      <Text style={[typography.headline, { color: colors.text }]}>{t.account.recoveryCodes}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {demoRecoveryCodes.map((c) => (
          <View key={c} style={{ width: '48%', paddingVertical: spacing.sm, borderRadius: radius.md, backgroundColor: colors.surfaceMuted, alignItems: 'center' }}>
            <Text selectable style={[typography.time, { color: colors.text, letterSpacing: 1 }]}>
              {c}
            </Text>
          </View>
        ))}
      </View>
      <Button
        title={copied ? t.onb.totp.copied : t.onb.totp.copy}
        iconBefore={copied ? 'checkmark' : 'copy-outline'}
        onPress={async () => {
          await Clipboard.setStringAsync(demoRecoveryCodes.join('\n'));
          success();
          setCopied(true);
        }}
      />
    </View>
  );
}

function Step({ n, text }: { n: number; text: string }) {
  const { colors, typography } = useTheme();
  return <Text style={[typography.callout, { color: colors.text }]}>{`${n}. ${text}`}</Text>;
}

function Hint({ text }: { text: string }) {
  const { colors, typography } = useTheme();
  return <Text style={[typography.caption, { color: colors.textTertiary }]}>{text}</Text>;
}

function Key({ text }: { text: string }) {
  const { colors, typography } = useTheme();
  return (
    <Text selectable style={[typography.time, { color: colors.text, letterSpacing: 1 }]}>
      {text}
    </Text>
  );
}
