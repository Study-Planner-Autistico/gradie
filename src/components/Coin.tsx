import Svg, { Circle, Path } from 'react-native-svg';

/** Moneta d'oro di Gradie (dec. 193): bordo, faccia e una stellina come quella della mascotte. */
export function Coin({ size = 22 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={11} fill="#E0A42F" />
      <Circle cx={12} cy={11.2} r={9.6} fill="#F7C55A" />
      <Circle cx={12} cy={11.2} r={7.2} fill="none" stroke="#E0A42F" strokeWidth={1.2} />
      <Path d="M12,6.6 Q12.9,10.3 16.6,11.2 Q12.9,12.1 12,15.8 Q11.1,12.1 7.4,11.2 Q11.1,10.3 12,6.6 Z" fill="#FFF3C9" />
    </Svg>
  );
}
