import * as Haptics from 'expo-haptics';
import { ReactNode, useRef } from 'react';
import { Pressable, StyleProp, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

interface Props {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
  haptic?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
}

// Drop-in TouchableOpacity replacement: spring-scale on press + a light haptic
// tap, instead of the old opacity fade. On pointer devices (web) it also
// scales up slightly on hover so the deployed PWA feels native, not ported.
export function PressableScale({
  onPress,
  style,
  children,
  haptic = true,
  disabled,
  accessibilityLabel,
}: Props) {
  const scale = useSharedValue(1);
  const hovered = useRef(false);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      onHoverIn={() => {
        hovered.current = true;
        // Reanimated shared values are a mutable escape hatch by design (UI-thread
        // updates outside React's render cycle) — the compiler's rule doesn't know that.
        // eslint-disable-next-line react-hooks/immutability
        scale.value = withSpring(1.02, { damping: 15, stiffness: 300 });
      }}
      onHoverOut={() => {
        hovered.current = false;
        // eslint-disable-next-line react-hooks/immutability
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      }}
      onPressIn={() => {
        // eslint-disable-next-line react-hooks/immutability
        scale.value = withSpring(0.94, { damping: 15, stiffness: 300 });
      }}
      onPressOut={() => {
        // eslint-disable-next-line react-hooks/immutability
        scale.value = withSpring(hovered.current ? 1.02 : 1, { damping: 12, stiffness: 200 });
      }}
      onPress={() => {
        if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.();
      }}>
      <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
    </Pressable>
  );
}
