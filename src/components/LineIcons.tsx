/**
 * Icone a tratto arrotondato per il menu laterale (dec. 128). Tracciati da Lucide (lucide.dev, licenza ISC),
 * la stessa famiglia delle icone animate di Animate UI, così hanno lo stesso stile.
 */
import Svg, { Circle, Path } from 'react-native-svg';

export type LineIconName = 'folder' | 'chart' | 'users' | 'settings' | 'school';

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
