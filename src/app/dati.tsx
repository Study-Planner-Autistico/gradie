import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { success, warn } from '../components/haptics';
import { SheetPage } from '../components/settings';
import { Button, TextField } from '../components/ui';
import { demoUser } from '../data/demo';
import { t } from '../i18n';
import { updateProfile, useProfile } from '../state/profile';
import { useTheme } from '../theme';

/** I miei dati (dec. 138): nome e cognome modificabili; l'email si vede ma non si cambia senza verifica via posta. */
export default function Dati() {
  const { spacing } = useTheme();
  const profile = useProfile();
  const [first, setFirst] = useState(profile.firstName);
  const [last, setLast] = useState(profile.lastName);
  const [tried, setTried] = useState(false);
  const missing = !first.trim() || !last.trim();

  return (
    <SheetPage title={t.account.data}>
      <View style={{ paddingHorizontal: spacing.xxl, gap: spacing.xl }}>
        <TextField
          label={t.account.firstName}
          value={first}
          onChangeText={setFirst}
          autoComplete="given-name"
          textContentType="givenName"
          error={tried && !first.trim() ? t.account.nameRequired : undefined}
        />
        <TextField
          label={t.account.lastName}
          value={last}
          onChangeText={setLast}
          autoComplete="family-name"
          textContentType="familyName"
          error={tried && !last.trim() ? t.account.nameRequired : undefined}
        />
        <TextField label={t.account.email} value={demoUser.email} editable={false} helper={t.account.emailHint} style={{ opacity: 0.7 }} />
        <Button
          title={t.account.save}
          appearance="primary"
          onPress={() => {
            setTried(true);
            if (missing) return warn();
            success();
            updateProfile({ firstName: first.trim(), lastName: last.trim() });
            router.back();
          }}
        />
      </View>
    </SheetPage>
  );
}
