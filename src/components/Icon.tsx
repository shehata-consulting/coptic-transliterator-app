// Hand-rolled stroke icon set (Feather path data, MIT) — same react-native-svg
// approach as the charts, so there's no icon font to load on web and every
// glyph tints crisply via `color` (unlike the emoji they replaced).
import Svg, { Path } from 'react-native-svg';

const PATHS = {
  'bar-chart': ['M18 20V10', 'M12 20V4', 'M6 20v-6'],
  tag: [
    'M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.83z',
    'M7 7h.01',
  ],
  'dollar-sign': ['M12 1v22', 'M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6'],
  'file-text': [
    'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z',
    'M14 2v6h6',
    'M16 13H8',
    'M16 17H8',
    'M10 9H8',
  ],
  lock: [
    'M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z',
    'M7 11V7a5 5 0 0 1 10 0v4',
  ],
  'alert-triangle': [
    'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z',
    'M12 9v4',
    'M12 17h.01',
  ],
  package: [
    'M16.5 9.4L7.5 4.21',
    'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z',
    'M3.27 6.96L12 12.01l8.73-5.05',
    'M12 22.08V12',
  ],
  plus: ['M12 5v14', 'M5 12h14'],
  x: ['M18 6L6 18', 'M6 6l12 12'],
  type: ['M4 7V4h16v3', 'M9 20h6', 'M12 4v16'],
  'book-open': [
    'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z',
    'M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z',
  ],
  'volume-2': [
    'M11 5L6 9H2v6h4l5 4V5z',
    'M19.07 4.93a10 10 0 0 1 0 14.14',
    'M15.54 8.46a5 5 0 0 1 0 7.07',
  ],
  copy: [
    'M11 9h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2z',
    'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1',
  ],
  check: ['M20 6L9 17l-5-5'],
  delete: [
    'M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z',
    'M18 9l-6 6',
    'M12 9l6 6',
  ],
  'chevron-down': ['M6 9l6 6 6-6'],
  'chevron-right': ['M9 18l6-6-6-6'],
} as const;

export type IconName = keyof typeof PATHS;

interface Props {
  name: IconName;
  color: string;
  size?: number;
  strokeWidth?: number;
}

export function Icon({ name, color, size = 18, strokeWidth = 2 }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {PATHS[name].map((d) => (
        <Path
          key={d}
          d={d}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </Svg>
  );
}
