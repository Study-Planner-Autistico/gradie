import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { notify } from '../components/dialogs';
import { success, warn } from '../components/haptics';
import { SheetPage } from '../components/settings';
import { Button, TextField } from '../components/ui';
import { t } from '../i18n';
import { useTheme } from '../theme';

const MIN = 8; // stesso requisito segnaposto dell'onboarding (DESIGN.md §11.7)

/** Cambio password (dec. 138). Senza server la password attuale non si può verificare: si controlla solo la nuova. */
export default function Password() {
  const { colors, typography, spacing } = useTheme();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [repeat, setRepeat] = useState('');
  const [tried, setTried] = useState(false);

  const nextError = next.length < MIN ? t.account.pwdRule : next === current ? t.account.pwdSame : undefined;
  const repeatError = repeat !== next ? t.account.pwdMismatch : undefined;
  const valid = current.length > 0 && !nextError && !repeatError;

  return (
    <SheetPage title={t.account.changePassword}>
      <View style={{ paddingHorizontal: spacing.xxl, gap: spacing.xl }}>
        <TextField
          label={t.account.currentPassword}
          value={current}
          onChangeText={setCurrent}
          secureTextEntry
          autoComplete="current-password"
          textContentType="password"
          error={tried && !current ? t.account.currentRequired : undefined}
        />
        <TextField
          label={t.account.newPassword}
          value={next}
          onChangeText={setNext}
          secureTextEntry
          autoComplete="new-password"
          textContentType="newPassword"
          helper={t.account.pwdRule}
          error={tried || next.length > 0 ? nextError : undefined}
        />
        <TextField
          label={t.account.repeatPassword}
          value={repeat}
          onChangeText={setRepeat}
          secureTextEntry
          autoComplete="new-password"
          textContentType="newPassword"
          error={(tried || repeat.length > 0) && repeatError ? repeatError : undefined}
        />
        <Text style={[typography.caption, { color: colors.textTertiary }]}>{t.account.demoNote}</Text>
        <Button
          title={t.account.save}
          appearance="primary"
          onPress={() => {
            setTried(true);
            if (!valid) return warn();
            success();
            router.back();
            notify(t.account.pwdChanged);
          }}
        />
      </View>
    </SheetPage>
  );
}
