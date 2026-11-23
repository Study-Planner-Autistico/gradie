import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Modal, Text, View } from 'react-native';
import { t } from '../i18n';
import { authenticate, useSettings } from '../state/settings';
import { useTheme } from '../theme';
import { Mascot } from './Mascot';
import { Button } from './ui';

/**
 * Blocco con Face ID / impronta (dec. 137): se attivo, quando l'app va in background si blocca
 * e al ritorno copre tutto finché non si sblocca. Se l'utente annulla, resta il bottone "Sblocca".
 */
export function AppLock() {
  const { colors, typography, spacing } = useTheme();
  const { biometricLock } = useSettings();
  const [locked, setLockedState] = useState(false);
  const lockedRef = useRef(false);
  const busy = useRef(false);
  const setLocked = useCallback((v: boolean) => {
    lockedRef.current = v;
    setLockedState(v);
  }, []);

  const unlock = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    try {
      if (await authenticate(t.settings.unlockPrompt, t.settings.cancel)) setLocked(false);
    } finally {
      busy.current = false;
    }
  }, [setLocked]);

  useEffect(() => {
    if (!biometricLock) return setLocked(false);
    const sub = AppState.addEventListener('change', (s) => {
      // Il prompt di Face ID manda l'app in "inactive", non in "background": si blocca solo uscendo davvero.
      if (s === 'background') setLocked(true);
      if (s === 'active' && lockedRef.current) unlock();
    });
    return () => sub.remove();
  }, [biometricLock, unlock, setLocked]);

  // Modal: si presenta sopra tutto, anche sopra sheet e schermate modali già aperte.
  return (
    <Modal visible={locked} animationType="fade" presentationStyle="fullScreen" onRequestClose={unlock}>
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl, gap: spacing.xl }}>
      <Mascot size={140} mood="sleepy" />
      <Text accessibilityRole="header" style={[typography.title1, { color: colors.text, textAlign: 'center' }]}>
        {t.settings.locked}
      </Text>
      <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center' }]}>{t.settings.lockedHint}</Text>
      <Button title={t.settings.unlock} appearance="primary" iconBefore="lock-open-outline" onPress={unlock} />
      </View>
    </Modal>
  );
}
