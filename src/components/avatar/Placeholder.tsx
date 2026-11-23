import Svg, { Circle, Path } from 'react-native-svg';
import { useTheme } from '../../theme';

/** Sagoma generica tratteggiata con il +: il posto dell'avatar finché non lo si crea (dec. 133). */
export function AvatarPlaceholder({ size }: { size: number }) {
  const { colors } = useTheme();
  const fill = colors.accent;
  return (
    <Svg width={size} height={size} viewBox="0 0 200 200">
      <Path d="M30,200 C30,150 62,124 100,124 C138,124 170,150 170,200 Z" fill={fill} opacity={0.22} />
      <Circle cx={100} cy={72} r={42} fill={fill} opacity={0.22} />
      <Path d="M30,200 C30,150 62,124 100,124 C138,124 170,150 170,200" fill="none" stroke={fill} strokeWidth={3} strokeDasharray="8 7" strokeLinecap="round" opacity={0.7} />
      <Circle cx={100} cy={72} r={42} fill="none" stroke={fill} strokeWidth={3} strokeDasharray="8 7" strokeLinecap="round" opacity={0.7} />
      <Path d="M100,56 V88 M84,72 H116" stroke="#FFFFFF" strokeWidth={6} strokeLinecap="round" />
    </Svg>
  );
}
