import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import { ColorValue, StyleSheet } from 'react-native';

import { Icon, type IconName } from '@/components/Icon';
import { colors, theme } from '@/lib/theme';

const icon = (name: IconName) =>
  function TabIcon({ focused, color }: { focused: boolean; color: ColorValue }) {
    // The navigator's tint colors are set below as plain strings.
    return <Icon name={name} size={21} color={color as string} strokeWidth={focused ? 2.4 : 2} />;
  };

export default function TabsLayout() {
  // Safe-area handling is the navigator's: with viewport-fit=cover exposing
  // env(safe-area-inset-bottom) (see +html.tsx), the tab bar pads itself on
  // every platform. Don't add the inset manually — it double-counts and
  // squeezes the labels out of view.
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // Frosted glass bar: translucent tint over a BlurView background.
        tabBarStyle: { backgroundColor: 'rgba(19,28,51,0.75)', borderTopColor: theme.glass.border },
        tabBarBackground: () => (
          <BlurView intensity={theme.glass.blurIntensity} tint="dark" style={StyleSheet.absoluteFill} />
        ),
        // The tab item is a fixed-height flex column (icon + label). Icon + label
        // + padding just exceed it, so the label (flex-shrink:1) collapses below
        // its line box and overflow:hidden clips the glyph bottoms — visible on
        // iOS Safari (standalone PWA). flexShrink:0 keeps the full line box.
        tabBarLabelStyle: { fontSize: 11, lineHeight: 14, flexShrink: 0 },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textDim,
      }}>
      <Tabs.Screen name="index" options={{ title: 'Transliterate', tabBarIcon: icon('type') }} />
      <Tabs.Screen name="library" options={{ title: 'Library', tabBarIcon: icon('book-open') }} />
      <Tabs.Screen name="guide" options={{ title: 'Guide', tabBarIcon: icon('volume-2') }} />
    </Tabs>
  );
}
