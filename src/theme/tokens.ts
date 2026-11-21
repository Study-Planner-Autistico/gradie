// Design tokens — fonte di verità: DESIGN.md. Non usare valori hardcoded nei componenti.
import type { TextStyle } from 'react-native';

const shared = {
  onPrimary: '#FFFFFF',
  onPrimaryMuted: 'rgba(255,255,255,0.75)',
  pill: '#FFFFFF',
  pillText: '#0A84FF',
  onPill: '#1C1F26',
  accentWarm: '#FFB020',
  success: '#34C759',
  danger: '#FF3B30',
  neutralBadge: 'rgba(0,0,0,0.25)',
};

export const lightColors = {
  ...shared,
  bg: '#F2F3F5',
  surface: '#FFFFFF',
  surfaceMuted: '#F7F8FA',
  border: '#E3E5E8',
  text: '#1C1F26',
  textSecondary: '#8A8F98',
  textTertiary: '#B4B8BF',
  primary: '#0A84FF',
  primaryPressed: '#0070E0',
  primaryDeep: '#2B5BB8',
  tabBar: 'rgba(255,255,255,0.95)',
  tabInactive: '#0A84FF',
  shadow: 'rgba(16,24,40,0.06)',
};

export type ColorTokens = typeof lightColors;

export const darkColors: ColorTokens = {
  ...shared,
  bg: '#0E1014',
  surface: '#181B21',
  surfaceMuted: '#20242B',
  border: '#2A2E36',
  text: '#F2F3F5',
  textSecondary: '#9AA0AA',
  textTertiary: '#5E636C',
  primary: '#3395FF',
  primaryPressed: '#1F86F5',
  primaryDeep: '#24457F',
  tabBar: 'rgba(24,27,33,0.95)',
  tabInactive: '#9AA0AA',
  shadow: 'rgba(0,0,0,0.3)',
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 } as const;

export const radius = { sm: 8, md: 14, lg: 24, xl: 28, pill: 999 } as const;

export const typography = {
  display: { fontSize: 30, lineHeight: 36, fontWeight: '800' },
  title1: { fontSize: 24, lineHeight: 30, fontWeight: '700' },
  title2: { fontSize: 20, lineHeight: 26, fontWeight: '700' },
  headline: { fontSize: 17, lineHeight: 22, fontWeight: '600' },
  body: { fontSize: 15, lineHeight: 20, fontWeight: '400' },
  callout: { fontSize: 14, lineHeight: 19, fontWeight: '500' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' },
  micro: { fontSize: 10, lineHeight: 13, fontWeight: '600' },
} satisfies Record<string, TextStyle>;

export const layout = {
  tabBarHeight: 68,
  tabBarMargin: 12,
  iconButton: 44,
  dayCell: 36,
  headerAvatar: 48,
} as const;

export const motion = { press: 150, transition: 250 } as const;
