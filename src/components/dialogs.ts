import { Alert, Platform } from 'react-native';
import { t } from '../i18n';

/** Conferma prima di un'azione irreversibile; sul web Alert non mostra pulsanti, quindi usa confirm del browser. */
export function confirm(message: string, action: string, onYes: () => void, detail?: string) {
  if (Platform.OS === 'web') {
    if (globalThis.confirm?.(detail ? `${message}\n\n${detail}` : message)) onYes();
    return;
  }
  Alert.alert(message, detail, [
    { text: t.manage.cancel, style: 'cancel' },
    { text: action, style: 'destructive', onPress: onYes },
  ]);
}

export function notify(message: string, detail?: string) {
  if (Platform.OS === 'web') globalThis.alert?.(detail ? `${message}\n\n${detail}` : message);
  else Alert.alert(message, detail);
}
