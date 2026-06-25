import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, Pressable, type StyleProp, type ViewStyle } from 'react-native';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Mount-entrance delay (ms) for staggered reveals. */
  delay?: number;
  /** Lift + scale on hover/press (web hover, native press). */
  interactive?: boolean;
  onPress?: () => void;
};

/**
 * A card wrapper that fades + slides in on mount and lifts on hover/press.
 * Uses the built-in Animated API (no reanimated plugin) so it's safe on web.
 */
export function PopCard({ children, style, delay = 0, interactive = false, onPress }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;
  const enterY = useRef(new Animated.Value(14)).current;
  const hover = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 420, delay, useNativeDriver: true }),
      Animated.spring(enterY, { toValue: 0, tension: 60, friction: 9, delay, useNativeDriver: true }),
    ]).start();
  }, [opacity, enterY, delay]);

  const setHover = (to: number) =>
    Animated.spring(hover, { toValue: to, tension: 120, friction: 12, useNativeDriver: true }).start();

  const liftY = hover.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });
  const scale = hover.interpolate({ inputRange: [0, 1], outputRange: [1, 1.025] });

  const animatedStyle = {
    opacity,
    transform: [{ translateY: enterY }, ...(interactive ? [{ translateY: liftY }, { scale }] : [])],
  };

  if (!interactive) {
    return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
  }

  // A single animated Pressable carries the style (so gap/padding/flex-wrap all
  // apply normally) plus the hover/press lift.
  return (
    <AnimatedPressable
      onPress={onPress}
      onHoverIn={() => setHover(1)}
      onHoverOut={() => setHover(0)}
      onPressIn={() => setHover(1)}
      onPressOut={() => setHover(0)}
      style={[style, animatedStyle]}>
      {children}
    </AnimatedPressable>
  );
}
