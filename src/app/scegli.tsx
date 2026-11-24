import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { Row, Section, SheetPage } from '../components/settings';
import { t, type LanguagePref } from '../i18n';
import { updateSettings, useSettings, type ThemePref } from '../state/settings';
import { useTheme } from '../theme';
import { Icon } from '../components/icons';

const themeIcon = { system: 'sunMoon', light: 'sun', dark: 'moon' } as const;

/** Scelta di lingua (dec. 46) o aspetto (dec. 48) dalle Impostazioni: si applica subito e torna indietro. */
export default function Scegli() {
  const { colors } = useTheme();
  const { cosa } = useLocalSearchParams<{ cosa: 'lingua' | 'aspetto' }>();
  const settings = useSettings();
  const isLang = cosa === 'lingua';
  const options = isLang
    ? (Object.keys(t.settings.languages) as LanguagePref[]).map((k) => ({ k, label: t.settings.languages[k], on: settings.language === k, icon: 'languages' as const }))
    : (Object.keys(t.settings.themes) as ThemePref[]).map((k) => ({ k, label: t.settings.themes[k], on: settings.theme === k, icon: themeIcon[k] }));

  return (
    <SheetPage title={isLang ? t.settings.language : t.settings.appearance}>
      <Section first>
        {options.map((o) => (
          <Row
            key={o.k}
            icon={o.icon}
            label={o.label}
            trailing={o.on ? <Icon name="check" size={22} color={colors.accent} /> : <View style={{ width: 22 }} />}
            onPress={() => {
              updateSettings(isLang ? { language: o.k as LanguagePref } : { theme: o.k as ThemePref });
              router.back();
            }}
          />
        ))}
      </Section>
    </SheetPage>
  );
}
