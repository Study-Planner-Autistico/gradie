import { useEffect, useRef } from 'react';
import Animated, { Easing, useAnimatedProps, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withSequence, withTiming } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

const AnimatedPath = Animated.createAnimatedComponent(Path);
// Tracciato della stella Hugeicons (stroke rounded), lo stesso dell'icona "star".
const D =
  'M13.7276 3.44418L15.4874 6.99288C15.7274 7.48687 16.3673 7.9607 16.9073 8.05143L20.0969 8.58575C22.1367 8.92853 22.6167 10.4206 21.1468 11.8925L18.6671 14.3927C18.2471 14.8161 18.0172 15.6327 18.1471 16.2175L18.8571 19.3125C19.417 21.7623 18.1271 22.71 15.9774 21.4296L12.9877 19.6452C12.4478 19.3226 11.5579 19.3226 11.0079 19.6452L8.01827 21.4296C5.8785 22.71 4.57865 21.7522 5.13859 19.3125L5.84851 16.2175C5.97849 15.6327 5.74852 14.8161 5.32856 14.3927L2.84884 11.8925C1.389 10.4206 1.85895 8.92853 3.89872 8.58575L7.08837 8.05143C7.61831 7.9607 8.25824 7.48687 8.49821 6.99288L10.258 3.44418C11.2179 1.51861 12.7777 1.51861 13.7276 3.44418Z';
const ease = Easing.inOut(Easing.ease);

/** Stella che rimbalza (1 → 0,9 → 1,2 → 1 in 0,6 s) e si riempie quando si accende, come la "fill" di Animate UI (dec. 221). */
export function AnimatedStar({ active, size, color }: { active: boolean; size: number; color: string }) {
  const reduced = useReducedMotion();
  const scale = useSharedValue(1);
  const fill = useSharedValue(active ? 1 : 0);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) return void (first.current = false);
    if (reduced) return void (fill.value = active ? 1 : 0);
    if (active) {
      scale.value = withSequence(withTiming(0.9, { duration: 200, easing: ease }), withTiming(1.2, { duration: 200, easing: ease }), withTiming(1, { duration: 200, easing: ease }));
      fill.value = withDelay(200, withTiming(1, { duration: 300, easing: ease }));
    } else fill.value = withTiming(0, { duration: 200, easing: ease });
  }, [active, reduced, fill, scale]);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const props = useAnimatedProps(() => ({ fillOpacity: fill.value }));

  return (
    <Animated.View style={style}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <AnimatedPath d={D} fill={color} stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" animatedProps={props} />
      </Svg>
    </Animated.View>
  );
}
