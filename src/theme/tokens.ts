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

/**
 * Inchiostri della lavagna (dec. 110). Per ogni strumento: 3 colori principali + altri colori dal "+".
 * Il primo colore della penna segue il tema: nero sul chiaro, bianco sullo scuro.
 */
export const ink = {
  pen: {
    light: ['#16161A', '#1F6FEB', '#D93025'],
    dark: ['#FFFFFF', '#3B8BFF', '#FF453A'],
    extra: ['#24894F', '#B86E00', '#8E44AD', '#E91E63', '#00A3A3', '#6B4F2A'],
  },
  pencil: {
    light: ['#2B2B2F', '#5E5E66', '#8E8E97'],
    dark: ['#E4E4E8', '#B4B4BC', '#85858E'],
    extra: ['#1A1A1D', '#45454C', '#75757E', '#A5A5AE', '#C8C8CF', '#E0E0E5'],
  },
  highlighter: {
    light: ['#FFE14D', '#7CF29A', '#FF8AD8'],
    dark: ['#FFE14D', '#7CF29A', '#FF8AD8'],
    extra: ['#7FD4FF', '#FFB86B', '#C9A2FF', '#FF7A7A'],
  },
  widths: { pen: [2, 4, 7], pencil: [1.5, 3, 5], highlighter: [12, 18, 26] },
  /** Opacità dell'evidenziatore: lascia leggere ciò che sta sotto. */
  highlighterOpacity: 0.4,
  pencilOpacity: 0.85,
  /** Canvas della lavagna: foglio chiaro o scuro secondo il tema. */
  paper: { light: '#FFFFFF', dark: '#0C0C0F' },
  sticky: '#FFF3B0',
  onSticky: '#3A3200',
  selection: '#1F6FEB',
} as const;

/** Copertine delle note (dec. 112). */
export const covers = [
  { id: 'classic1', color: '#2F5DA8' },
  { id: 'classic2', color: '#2E6B4F' },
  { id: 'classic3', color: '#C77A2E' },
  { id: 'classic4', color: '#B23A48' },
  { id: 'classic5', color: '#5B4B9A' },
  { id: 'classic6', color: '#2B2B2F' },
  { id: 'classic7', color: '#E39AB0' },
  { id: 'classic8', color: '#D9B23F' },
] as const;

/** Colori della carta (dec. 112); `dark` indica che sopra serve inchiostro chiaro. */
export const paperColors = [
  { id: 'white', color: '#FFFFFF', dark: false },
  { id: 'cream', color: '#FFF8E7', dark: false },
  { id: 'graphite', color: '#2A2A2E', dark: true },
  { id: 'black', color: '#0C0C0F', dark: true },
  { id: 'rose', color: '#F6C9CF', dark: false },
  { id: 'pink', color: '#F9D6E6', dark: false },
  { id: 'lavender', color: '#E3D9F7', dark: false },
] as const;

/** Righe e quadretti della carta, e margine rosso. */
export const paperLines = { light: 'rgba(60,90,160,0.22)', dark: 'rgba(255,255,255,0.18)', margin: 'rgba(217,61,82,0.6)', desk: { light: '#E4E4E9', dark: '#000000' } } as const;
