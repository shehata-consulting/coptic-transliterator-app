import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { theme } from '@/lib/theme';

// Public tool — no auth gate; the tabs are the whole app.
export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.bg.base },
        }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}
