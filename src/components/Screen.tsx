// Shared screen chrome: Lumen backdrop, scroll container, brand bar, glass
// cards. Simplified from the sibling apps — this is a public tool, so there
// is no auth/lock button.
import { type ComponentProps, type ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppBackground } from '@/components/AppBackground';
import { GlassCard } from '@/components/GlassCard';
import { CARD_MAX, colors, theme } from '@/lib/theme';

export function Screen({ title, children }: { title: string; children: ReactNode }) {
  // Clear the status bar in full-screen web mode; 40 was tuned for browser
  // tabs (insets 0) and stays the floor.
  const insets = useSafeAreaInsets();
  return (
    <AppBackground>
      <ScrollView
        style={s.main}
        contentContainerStyle={[s.scroll, { paddingTop: Math.max(40, insets.top + 12) }]}>
        <View style={s.topBar}>
          <Text style={s.brand}>◆ Coptic Transliterator</Text>
        </View>
        <Text style={s.screenTitle}>{title}</Text>
        {children}
      </ScrollView>
    </AppBackground>
  );
}

export function Card({
  title,
  entering,
  children,
}: {
  title?: string;
  entering?: ComponentProps<typeof GlassCard>['entering'];
  children: ReactNode;
}) {
  return (
    <GlassCard entering={entering}>
      {title ? <Text style={s.sectionHeader}>{title}</Text> : null}
      {children}
    </GlassCard>
  );
}

const s = StyleSheet.create({
  main: { flex: 1 },
  scroll: { alignItems: 'center', padding: 20, paddingTop: 40, paddingBottom: 48 },
  topBar: { width: '100%', maxWidth: CARD_MAX, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  brand: { color: theme.brand, fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
  screenTitle: { width: '100%', maxWidth: CARD_MAX, fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 16 },
  sectionHeader: { fontSize: 11, fontWeight: '700', color: colors.textDim, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 },
});
