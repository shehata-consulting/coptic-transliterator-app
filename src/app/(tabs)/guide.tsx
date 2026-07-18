import { StyleSheet, Text, View } from 'react-native';
import { FadeInDown } from 'react-native-reanimated';

import { Card, Screen } from '@/components/Screen';
import { ALPHABET, JINKIM } from '@/lib/alphabet';
import { colors } from '@/lib/theme';

export default function GuideScreen() {
  return (
    <Screen title="Pronunciation Guide">
      <Card title="Letter by letter" entering={FadeInDown.duration(400)}>
        <Text style={s.caption}>
          Greco-Bohairic pronunciation as used in Coptic Orthodox services. Context-sensitive
          letters show their variants.
        </Text>
        {[...ALPHABET, JINKIM].map((l) => (
          <View key={l.name} style={s.row}>
            <Text style={s.glyph}>{l.coptic}</Text>
            <View style={s.main}>
              <Text style={s.name}>{l.name}</Text>
              <Text style={s.sounds}>{l.soundsLike}</Text>
            </View>
            <Text style={s.latin}>{l.latin}</Text>
          </View>
        ))}
      </Card>
    </Screen>
  );
}

const s = StyleSheet.create({
  caption: { fontSize: 12, color: colors.textDim, lineHeight: 18, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.cardBorder, gap: 12 },
  glyph: { width: 36, fontSize: 22, color: colors.text, textAlign: 'center' },
  main: { flex: 1 },
  name: { fontSize: 14, fontWeight: '600', color: colors.textSoft },
  sounds: { fontSize: 12, color: colors.textDim, marginTop: 1 },
  latin: { fontSize: 14, fontWeight: '700', color: colors.accent, fontVariant: ['tabular-nums'] },
});
