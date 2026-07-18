// Interlinear rendering: each Latin word directly under its Coptic word —
// the "follow along in church" view. Wraps like text; falls back to stacked
// full lines when word counts don't align (see interlinearLines).
import { StyleSheet, Text, View } from 'react-native';

import { interlinearLines } from '@/lib/textUtils';
import { colors } from '@/lib/theme';

interface Props {
  source: string;
  latin: string;
}

export function Interlinear({ source, latin }: Props) {
  const lines = interlinearLines(source, latin);
  return (
    <View style={s.wrap}>
      {lines.map((pairs, i) =>
        pairs.length === 0 ? (
          <View key={i} style={s.spacer} />
        ) : (
          <View key={i} style={s.line}>
            {pairs.map(([src, lat], j) => (
              <View key={j} style={s.pair}>
                <Text style={s.coptic}>{src}</Text>
                <Text style={s.latin}>{lat}</Text>
              </View>
            ))}
          </View>
        )
      )}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { width: '100%' },
  line: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 14, rowGap: 10, marginBottom: 10 },
  spacer: { height: 10 },
  pair: { alignItems: 'center' },
  coptic: { fontSize: 18, color: colors.text, fontWeight: '600' },
  latin: { fontSize: 12, color: colors.accent, marginTop: 1 },
});
