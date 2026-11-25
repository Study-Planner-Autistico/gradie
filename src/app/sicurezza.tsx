import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { AppState, Linking, Pressable, Text } from 'react-native';
import { askCalendarPermission, calendarPermission, type CalendarPermission } from '../state/deviceCalendar';
import { enableReminders, refreshReminders, useReminderPermission } from '../state/reminders';
import { confirm } from '../components/dialogs';
import { success } from '../components/haptics';
import { Row, Section, SheetPage } from '../components/settings';
import type { DemoDevice } from '../data/demo';
import { locale, t } from '../i18n';
import { updateSettings, useSettings } from '../state/settings';
import { useTheme } from '../theme';

const deviceIcon = { phone: 'smartphone', tablet: 'tablet', desktop: 'monitor' } as const;

/** Sicurezza (dec. 56, 138): password, verifica in due passaggi e dispositivi collegati. Dati dimostrativi. "Esci" sta in fondo alle Impostazioni (dec. 139). */
export default function Sicurezza() {
  const settings = useSettings();
  // Permessi (dec. 195): Calendario per importare in Agenda, Notifiche per i promemoria. Si rileggono tornando
  // dalle Impostazioni del telefono.
  const [calendar, setCalendar] = useState<CalendarPermission>('undetermined');
  const notifications = useReminderPermission();
  useFocusEffect(
    useCallback(() => {
      const read = () => {
        calendarPermission().then(setCalendar);
        refreshReminders();
      };
      read();
      const sub = AppState.addEventListener('change', (st) => st === 'active' && read());
      return () => sub.remove();
    }, []),
  );
  const P = t.account.perm;
  const tapCalendar = async () => {
    if (calendar === 'unavailable') return;
    if (calendar !== 'undetermined') return Linking.openSettings();
    setCalendar(await askCalendarPermission());
  };
  const tapNotifications = () => {
    if (notifications === 'unavailable') return;
    if (notifications === 'granted') return Linking.openSettings();
    enableReminders();
  };
  const lastSeen = (d: DemoDevice) =>
    d.lastSeen === 'now' ? t.account.activeNow : t.account.lastSeen(new Date(d.lastSeen).toLocaleDateString(locale, { day: 'numeric', month: 'long' }));

  return (
    <SheetPage title={t.account.security}>
      <Section first>
        <Row icon="key" label={t.account.changePassword} onPress={() => router.push('/password')} />
        <Row
          icon="twoFactor"
          label={t.account.twoFactor}
          value={settings.twoFactor ? t.account.on : t.account.off}
          onPress={() => router.push('/due-passaggi')}
        />
      </Section>

      <Section title={t.account.permissions}>
        <Row
          icon="calendar"
          label={t.account.calendarPerm}
          detail={t.account.calendarPermDetail}
          value={P[calendar]}
          onPress={calendar === 'unavailable' ? undefined : tapCalendar}
        />
        <Row
          icon="bell"
          label={t.account.notificationsPerm}
          detail={t.account.notificationsPermDetail}
          value={P[notifications]}
          onPress={notifications === 'unavailable' ? undefined : tapNotifications}
        />
      </Section>

      <Section title={t.account.devices}>
        {settings.devices.map((d, i) => (
          <Row
            key={d.id}
            icon={deviceIcon[d.kind]}
            label={d.name}
            detail={`${i === 0 ? t.account.thisDevice : d.place} · ${lastSeen(d)}`}
            trailing={
              i === 0 ? undefined : (
                <SignOutDevice
                  name={d.name}
                  onConfirm={() => {
                    success();
                    updateSettings({ devices: settings.devices.filter((x) => x.id !== d.id) });
                  }}
                />
              )
            }
          />
        ))}
      </Section>
    </SheetPage>
  );
}

function SignOutDevice({ name, onConfirm }: { name: string; onConfirm: () => void }) {
  const { colors, typography, spacing, layout } = useTheme();
  return (
    <Pressable
      onPress={() => confirm(t.account.signOutDeviceConfirm(name), t.account.signOutDevice, onConfirm, t.account.signOutDeviceDetail)}
      accessibilityRole="button"
      accessibilityLabel={`${t.account.signOutDevice}: ${name}`}
      style={({ pressed }) => ({ minHeight: layout.iconButton, justifyContent: 'center', paddingHorizontal: spacing.sm, opacity: pressed ? 0.6 : 1 })}
    >
      <Text style={[typography.headline, { color: colors.danger }]}>{t.account.signOutDevice}</Text>
    </Pressable>
  );
}
