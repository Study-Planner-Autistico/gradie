// Design tokens — fonte di verità: DESIGN.md (v1). Non usare valori hardcoded nei componenti.
import type { TextStyle } from 'react-native';

/** Tinte per tipo di elemento (DESIGN.md §2.3): fondo tenue + testo saturo. */
const lightTints = {
  lesson: { bg: '#E9E8FF', fg: '#5451D6' },
  appointment: { bg: '#FFE9EC', fg: '#D93D52' },
  activity: { bg: '#FFF1D9', fg: '#B86E00' },
  official: { bg: '#E2F5E9', fg: '#24894F' },
  holiday: { bg: '#EEEEF1', fg: '#6B6B76' },
};

const darkTints: typeof lightTints = {
  lesson: { bg: '#2A2950', fg: '#B3B1FF' },
  appointment: { bg: '#43242B', fg: '#FF9AA8' },
  activity: { bg: '#3D3020', fg: '#FFC46B' },
  official: { bg: '#1F3A2A', fg: '#7EDBA2' },
  holiday: { bg: '#2A2A30', fg: '#A5A5B0' },
};

export const lightColors = {
  bg: '#F2F2F4',
  surface: '#FFFFFF',
  surfaceMuted: '#F6F6F8',
  border: '#E6E6EA',
  text: '#16161A',
  textSecondary: '#8B8B96',
  textTertiary: '#B9B9C2',
  ink: '#16161A',
  onInk: '#FFFFFF',
  accent: '#6E6BF0',
  onAccent: '#FFFFFF',
  success: '#24894F',
  successBg: '#E2F5E9',
  danger: '#D93D52',
  glassFallback: 'rgba(255,255,255,0.72)',
  glassBorder: 'rgba(255,255,255,0.6)',
  shadow: 'rgba(20,20,30,0.06)',
  /** Gradiente "mesh" per le card in evidenza (DESIGN.md §2.4). */
  heroGradient: ['#C7D3FF', '#E4D8FF', '#F4F5FB'] as readonly [string, string, ...string[]],
  heroGradientOverlay: ['rgba(255,255,255,0)', 'rgba(171,196,255,0.55)'] as readonly [string, string, ...string[]],
  tints: lightTints,
};

export type ColorTokens = typeof lightColors;

export const darkColors: ColorTokens = {
  bg: '#0C0C0F',
  surface: '#17171C',
  surfaceMuted: '#1F1F26',
  border: '#2A2A33',
  text: '#F4F4F6',
  textSecondary: '#9A9AA6',
  textTertiary: '#5F5F6B',
  ink: '#F4F4F6',
  onInk: '#16161A',
  accent: '#8C89FF',
  onAccent: '#FFFFFF',
  success: '#7EDBA2',
  successBg: '#1F3A2A',
  danger: '#FF9AA8',
  glassFallback: 'rgba(30,30,36,0.72)',
  glassBorder: 'rgba(255,255,255,0.08)',
  shadow: 'rgba(0,0,0,0.4)',
  heroGradient: ['#2B2E5C', '#3A2B5C', '#17171C'] as const,
  heroGradientOverlay: ['rgba(23,23,28,0)', 'rgba(80,100,200,0.35)'] as const,
  tints: darkTints,
};

export type TintName = keyof typeof lightTints;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 } as const;

export const radius = { sm: 10, md: 16, lg: 22, xl: 28, pill: 999 } as const;

export const typography = {
  hero: { fontSize: 44, lineHeight: 48, fontWeight: '700', letterSpacing: -1 },
  display: { fontSize: 30, lineHeight: 36, fontWeight: '700', letterSpacing: -0.5 },
  title1: { fontSize: 26, lineHeight: 32, fontWeight: '700', letterSpacing: -0.4 },
  title2: { fontSize: 20, lineHeight: 26, fontWeight: '600' },
  headline: { fontSize: 17, lineHeight: 22, fontWeight: '600' },
  body: { fontSize: 15, lineHeight: 20, fontWeight: '400' },
  callout: { fontSize: 14, lineHeight: 19, fontWeight: '500' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' },
  /** Orari: cifre a larghezza fissa (DESIGN.md §3). */
  time: { fontSize: 13, lineHeight: 17, fontWeight: '500', fontVariant: ['tabular-nums'] },
} satisfies Record<string, TextStyle>;

export const layout = {
  iconButton: 44,
  smallIconButton: 32,
  avatar: 44,
  dayCell: 40,
  checkbox: 22,
  /** Spazio in fondo alle schermate con tab bar (nativa o flottante). */
  tabBarClearance: 110,
} as const;

export const motion = { press: 150, transition: 250 } as const;
