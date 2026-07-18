// Custom HTML shell for web (static export + dev). viewport-fit=cover makes
// iOS expose env(safe-area-inset-*) values, which the tab bar uses to clear
// the home indicator in home-screen (standalone) mode.
import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Coptic" />
        <meta name="theme-color" content="#0b1024" />
        <meta
          name="description"
          content="Transliterate Coptic text to Latin script — follow along with Coptic Orthodox services. Works offline."
        />
        {/* Served from public/ (copied into dist by expo export). The
            apple-touch-icon is what gives the iOS home-screen shortcut a real
            icon instead of a page screenshot. */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <ScrollViewStyleReset />
      </head>
      <body style={{ backgroundColor: '#0b1024' }}>{children}</body>
    </html>
  );
}
