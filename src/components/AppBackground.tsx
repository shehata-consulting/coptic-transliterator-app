import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, Ellipse, RadialGradient, Stop } from 'react-native-svg';

import { theme } from '@/lib/theme';

// Ambient glow layer: one radial gradient per glow, drawn once behind the
// screen. RadialGradient stops need an rgb color + opacity split (rgba strings
// don't animate opacity consistently across svg renderers).
const GLOWS = [
  { id: 'glowBlue', color: '#3878ff', opacity: 0.28, cx: '18%', cy: '4%', rx: '55%', ry: '26%' },
  { id: 'glowViolet', color: '#8b5cf6', opacity: 0.22, cx: '92%', cy: '22%', rx: '48%', ry: '30%' },
  { id: 'glowTeal', color: '#0d9488', opacity: 0.14, cx: '50%', cy: '100%', rx: '55%', ry: '28%' },
];

/** Full-screen Lumen backdrop: gradient base + fixed ambient glows.
 *  Wrap every render state in this so the theme never jumps. */
export function AppBackground({ children }: { children: ReactNode }) {
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[theme.bg.base, theme.bg.mid, theme.bg.end]}
        locations={[0, 0.55, 1]}
        start={{ x: 0.4, y: 0 }}
        end={{ x: 0.6, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* explicit 100% size: on web an unsized <svg> defaults to 300x150 */}
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill} pointerEvents="none">
        <Defs>
          {GLOWS.map((g) => (
            <RadialGradient key={g.id} id={g.id} cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={g.color} stopOpacity={g.opacity} />
              <Stop offset="1" stopColor={g.color} stopOpacity={0} />
            </RadialGradient>
          ))}
        </Defs>
        {GLOWS.map((g) => (
          <Ellipse key={g.id} cx={g.cx} cy={g.cy} rx={g.rx} ry={g.ry} fill={`url(#${g.id})`} />
        ))}
      </Svg>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg.base },
});
