/**
 * Icone a tratto arrotondato per il menu laterale (dec. 128) e le Impostazioni (dec. 139). Tracciati da Lucide (lucide.dev, licenza ISC),
 * la stessa famiglia delle icone animate di Animate UI, così hanno lo stesso stile.
 */
import Svg, { Circle, Path } from 'react-native-svg';

export type LineIconName =
  | 'folder' | 'chart' | 'users' | 'settings' | 'school'
  // Impostazioni (dec. 139)
  | 'user' | 'shield' | 'lock' | 'bell' | 'faceId' | 'fingerprint' | 'languages' | 'moon' | 'sun' | 'sunMoon'
  | 'key' | 'twoFactor' | 'smartphone' | 'tablet' | 'monitor' | 'logout' | 'download' | 'trash' | 'chevron' | 'check';

const ICONS: Record<LineIconName, { paths: string[]; circles?: { cx: number; cy: number; r: number }[] }> = {
  folder: { paths: ['M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z'] },
  chart: { paths: ['M3 3v16a2 2 0 0 0 2 2h16', 'M18 17V9', 'M13 17V5', 'M8 17v-3'] },
  users: {
    paths: ['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', 'M16 3.128a4 4 0 0 1 0 7.744', 'M22 21v-2a4 4 0 0 0-3-3.87'],
    circles: [{ cx: 9, cy: 7, r: 4 }],
  },
  settings: {
    paths: [
      'M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915',
    ],
    circles: [{ cx: 12, cy: 12, r: 3 }],
  },
  school: {
    paths: [
      'M14 21v-3a2 2 0 0 0-4 0v3',
      'M18 4.933V21',
      'm4 6 7.106-3.79a2 2 0 0 1 1.788 0L20 6',
      'm6 11-3.52 2.147a1 1 0 0 0-.48.854V19a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a1 1 0 0 0-.48-.853L18 11',
      'M6 4.933V21',
    ],
    circles: [{ cx: 12, cy: 9, r: 2 }],
  },
  // Lucide 1.78 (rettangoli e linee riscritti come tracciati).
  user: { paths: ['M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2'], circles: [{ cx: 12, cy: 7, r: 4 }] },
  shield: {
    paths: [
      'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z',
      'm9 12 2 2 4-4',
    ],
  },
  lock: { paths: ['M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z', 'M7 11V7a5 5 0 0 1 10 0v4'] },
  bell: {
    paths: ['M10.268 21a2 2 0 0 0 3.464 0', 'M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326'],
  },
  faceId: { paths: ['M3 7V5a2 2 0 0 1 2-2h2', 'M17 3h2a2 2 0 0 1 2 2v2', 'M21 17v2a2 2 0 0 1-2 2h-2', 'M7 21H5a2 2 0 0 1-2-2v-2', 'M8 14s1.5 2 4 2 4-2 4-2', 'M9 9h.01', 'M15 9h.01'] },
  fingerprint: {
    paths: [
      'M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4',
      'M14 13.12c0 2.38 0 6.38-1 8.88',
      'M17.29 21.02c.12-.6.43-2.3.5-3.02',
      'M2 12a10 10 0 0 1 18-6',
      'M2 16h.01',
      'M21.8 16c.2-2 .131-5.354 0-6',
      'M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2',
      'M8.65 22c.21-.66.45-1.32.57-2',
      'M9 6.8a6 6 0 0 1 9 5.2v2',
    ],
  },
  languages: { paths: ['m5 8 6 6', 'm4 14 6-6 2-3', 'M2 5h12', 'M7 2h1', 'm22 22-5-10-5 10', 'M14 18h6'] },
  moon: { paths: ['M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401'] },
  sun: {
    paths: ['M12 2v2', 'M12 20v2', 'm4.93 4.93 1.41 1.41', 'm17.66 17.66 1.41 1.41', 'M2 12h2', 'M20 12h2', 'm6.34 17.66-1.41 1.41', 'm19.07 4.93-1.41 1.41'],
    circles: [{ cx: 12, cy: 12, r: 4 }],
  },
  sunMoon: {
    paths: [
      'M12 2v2',
      'M14.837 16.385a6 6 0 1 1-7.223-7.222c.624-.147.97.66.715 1.248a4 4 0 0 0 5.26 5.259c.589-.255 1.396.09 1.248.715',
      'M16 12a4 4 0 0 0-4-4',
      'm19 5-1.256 1.256',
      'M20 12h2',
    ],
  },
  key: {
    paths: ['M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z'],
    circles: [{ cx: 16.5, cy: 7.5, r: 0.5 }],
  },
  twoFactor: {
    paths: [
      'M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z',
      'M8 12h.01',
      'M12 12h.01',
      'M16 12h.01',
    ],
  },
  smartphone: { paths: ['M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z', 'M12 18h.01'] },
  tablet: { paths: ['M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z', 'M12 18h.01'] },
  monitor: { paths: ['M4 3h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z', 'M8 21h8', 'M12 17v4'] },
  logout: { paths: ['m16 17 5-5-5-5', 'M21 12H9', 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4'] },
  download: { paths: ['M12 15V3', 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4', 'm7 10 5 5 5-5'] },
  trash: { paths: ['M10 11v6', 'M14 11v6', 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6', 'M3 6h18', 'M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2'] },
  chevron: { paths: ['m9 18 6-6-6-6'] },
  check: { paths: ['m16 9-5.5 5.5L8 12'], circles: [{ cx: 12, cy: 12, r: 10 }] },
};

export function LineIcon({ name, size = 22, color, strokeWidth = 2.6 }: { name: LineIconName; size?: number; color: string; strokeWidth?: number }) {
  const icon = ICONS[name];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {icon.paths.map((d) => (
        <Path key={d} d={d} />
      ))}
      {icon.circles?.map((c) => (
        <Circle key={`${c.cx}-${c.cy}`} cx={c.cx} cy={c.cy} r={c.r} />
      ))}
    </Svg>
  );
}
