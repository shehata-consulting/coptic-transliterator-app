import { StyleSheet, Text, View } from 'react-native';
import { FadeInDown } from 'react-native-reanimated';

import { Interlinear } from '@/components/Interlinear';
import { Card, Screen } from '@/components/Screen';
import { LIBRARY } from '@/lib/library';
import { translit } from '@/lib/translit';
import { colors } from '@/lib/theme';

export default function LibraryScreen() {
  return (
    <Screen title="Text Library">
      {LIBRARY.map((t, i) => (
        <Card key={t.title} entering={FadeInDown.duration(400).delay(i * 60)}>
          <View style={s.header}>
            <Text style={s.title}>{t.title}</Text>
            <View style={s.occasion}>
              <Text style={s.occasionText}>{t.occasion}</Text>
            </View>
          </View>
          <Text style={s.meaning}>“{t.meaning}”</Text>
          <Interlinear source={t.coptic} latin={translit(t.coptic)} />
        </Card>
      ))}
      <Text style={s.contribute}>
        Missing a hymn or response? The library is community-maintained — add it in
        texts/library.json on GitHub.
      </Text>
    </Screen>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 4 },
  title: { flex: 1, fontSize: 16, fontWeight: '700', color: colors.text },
  occasion: { borderRadius: 999, borderWidth: 1, borderColor: colors.accent + '55', backgroundColor: colors.accent + '14', paddingVertical: 3, paddingHorizontal: 10 },
  occasionText: { fontSize: 11, fontWeight: '600', color: colors.accent },
  meaning: { fontSize: 13, color: colors.textMid, fontStyle: 'italic', marginBottom: 14 },
  contribute: { fontSize: 12, color: colors.textDim, textAlign: 'center', maxWidth: 480, lineHeight: 18 },
});
