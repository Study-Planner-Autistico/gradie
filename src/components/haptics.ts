import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const enabled = Platform.OS === 'ios' || Platform.OS === 'android';

/** Feedback leggero al tocco di bottoni e opzioni. */
export function tap() {
  if (enabled) Haptics.selectionAsync().catch(() => {});
}

/** Conferma di un passaggio completato. */
export function success() {
  if (enabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}

/** Errore di validazione. */
export function warn() {
  if (enabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
}
