import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Platform, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { resetProfile } from '../state/profile';
import { resetAccountSettings } from '../state/settings';
import { useTheme } from '../theme';
import { tap } from './haptics';
import { LineIcon, type LineIconName } from './LineIcons';

/** Pagina delle Impostazioni in un form sheet: titolo grande e sezioni (dec. 137). */
export function SheetPage({ title, children }: { title: string; children: ReactNode }) {
  const { colors, typography, spacing } = useTheme();
  return (
    <ScrollView
      style={{ backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.bg }}
      contentContainerStyle={{ paddingBottom: spacing.giant }}
      keyboardShouldPersistTaps="handled"
    >
      <Text accessibilityRole="header" style={[typography.display, { color: colors.text, paddingHorizontal: spacing.xxl, paddingTop: spacing.xxxl, paddingBottom: spacing.xxl }]}>
        {title}
      </Text>
      {children}
    </ScrollView>
  );
}

/** Gruppo di voci con il suo titolo (dec. 139): righe sullo sfondo della pagina, come nel menu laterale. */
export function Section({ title, children, first }: { title?: string; children: ReactNode; first?: boolean }) {
  const { colors, typography, spacing } = useTheme();
  return (
    <View style={{ marginTop: first ? 0 : spacing.xxxl, paddingHorizontal: spacing.lg }}>
      {title && (
        <Text accessibilityRole="header" style={[typography.title2, { color: colors.text, paddingHorizontal: spacing.sm, paddingBottom: spacing.sm }]}>
          {title}
        </Text>
      )}
      {children}
    </View>
  );
}

/**
 * Voce nello stile del menu laterale della Home (dec. 128, 139): icona a tratto senza riquadro, testo a 17,
 * poi interruttore, un'azione a destra oppure valore e freccia. `danger` la colora di rosso.
 */
export function Row({
  icon,
  label,
  detail,
  value,
  onPress,
  toggle,
  trailing,
  danger,
}: {
  icon: LineIconName;
  label: string;
  detail?: string;
  value?: string;
  onPress?: () => void;
  toggle?: { value: boolean; onChange: (v: boolean) => void };
  /** Al posto di valore e freccia (es. un bottone "Esci" o una spunta). */
  trailing?: ReactNode;
  /** Azione distruttiva: icona ed etichetta rosse, niente freccia. */
  danger?: boolean;
}) {
  const { colors, typography, spacing, radius } = useTheme();
  const fg = danger ? colors.danger : colors.text;
  const content = (
    <>
      <LineIcon name={icon} size={22} color={fg} />
      <View style={{ flex: 1 }}>
        <Text style={[typography.body, { fontSize: 17, color: fg }]}>{label}</Text>
        {detail && <Text style={[typography.caption, { color: colors.textTertiary }]}>{detail}</Text>}
      </View>
      {toggle ? (
        <Switch
          value={toggle.value}
          onValueChange={(v) => {
            tap();
            toggle.onChange(v);
          }}
          trackColor={{ true: colors.accent, false: colors.surfaceMuted }}
          thumbColor={colors.switchThumb}
          {...{ activeThumbColor: colors.switchThumb }}
          accessibilityLabel={label}
        />
      ) : (
        trailing ??
        (!danger && !!onPress && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
            {value && <Text style={[typography.body, { color: colors.textTertiary }]}>{value}</Text>}
            <LineIcon name="chevron" size={20} color={colors.textTertiary} />
          </View>
        ))
      )}
    </>
  );
  const rowStyle = {
    minHeight: 56,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
  };
  if (toggle || !onPress) return <View style={rowStyle}>{content}</View>;
  return (
    <Pressable
      onPress={() => {
        tap();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={value ? `${label}: ${value}` : label}
      style={({ pressed }) => [rowStyle, { backgroundColor: pressed ? colors.neutralPressed : 'transparent' }]}
    >
      {content}
    </Pressable>
  );
}

/** Uscita o eliminazione dell'account: azzera i dati locali, chiude i fogli e torna all'onboarding (accesso). */
export function leaveAccount() {
  resetProfile();
  resetAccountSettings();
  router.dismissAll();
  router.replace('/onboarding');
}
