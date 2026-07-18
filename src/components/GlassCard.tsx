import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { ComponentProps, ReactNode } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';

import { CARD_MAX, theme } from '@/lib/theme';

interface Props {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** reanimated entrance (e.g. FadeInDown), forwarded to the shell */
  entering?: ComponentProps<typeof Animated.View>['entering'];
}

// Frosted glass panel: BlurView (native blur / CSS backdrop-filter on web)
// under an rgba fill + border, so Android still reads as glass if the
// experimental blur is unavailable there. The 1px top sheen is what makes the
// glass read as lit; the baked-in layout transition smooths height changes
// (expanding asset rows) for this card and every card below it.
export function GlassCard({ children, style, entering }: Props) {
  return (
    <Animated.View entering={entering} layout={LinearTransition.duration(240)} style={[styles.shell, style]}>
      <BlurView intensity={theme.glass.blurIntensity} tint="dark" style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.18)', 'rgba(255,255,255,0)']}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.sheen}
      />
      <View style={styles.inner}>{children}</View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  shell: {
    width: '100%',
    maxWidth: CARD_MAX,
    borderRadius: theme.radius.card,
    borderWidth: 1,
    borderColor: theme.glass.border,
    backgroundColor: theme.glass.fill,
    overflow: 'hidden',
    marginBottom: 22,
  },
  sheen: { position: 'absolute', top: 0, left: 16, right: 16, height: 1 },
  inner: { padding: 22 },
});
