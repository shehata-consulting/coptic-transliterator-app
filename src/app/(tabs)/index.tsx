import { useMemo, useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Icon } from '@/components/Icon';
import { Interlinear } from '@/components/Interlinear';
import { PressableScale } from '@/components/PressableScale';
import { Card, Screen } from '@/components/Screen';
import { ALPHABET } from '@/lib/alphabet';
import { translitWithWarnings } from '@/lib/translit';
import { CARD_MAX, colors } from '@/lib/theme';

const VIEWS = ['Latin', 'Interlinear'] as const;
type ViewMode = (typeof VIEWS)[number];

const SAMPLE = 'Ϫⲉ Ⲡⲉⲛⲓⲱⲧ ⲉⲧϧⲉⲛ ⲛⲓⲫⲏⲟⲩⲓ…';

export default function TransliterateScreen() {
  const [input, setInput] = useState('');
  const [view, setView] = useState<ViewMode>('Latin');
  const [showPalette, setShowPalette] = useState(false);
  const [copied, setCopied] = useState(false);

  // Live transliteration — the engine is instant, no button needed.
  const { result, unmapped } = useMemo(() => translitWithWarnings(input), [input]);

  const copy = () => {
    // Web-only convenience (PWA-first); native gets selectable text below.
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <Screen title="Transliterate">
      <Card title="Coptic text" entering={FadeInDown.duration(400)}>
        <TextInput
          style={s.input}
          value={input}
          onChangeText={setInput}
          placeholder={SAMPLE}
          placeholderTextColor={colors.textDim}
          multiline
          autoCorrect={false}
          autoCapitalize="none"
        />
        <View style={s.inputActions}>
          <PressableScale
            onPress={() => setShowPalette((v) => !v)}
            style={[s.chip, showPalette && s.chipActive]}>
            <Text style={[s.chipLabel, showPalette && { color: colors.accent }]}>
              ⲁⲃⲅ keyboard
            </Text>
          </PressableScale>
          {input.length > 0 && (
            <PressableScale onPress={() => setInput('')} style={s.chip}>
              <Text style={s.chipLabel}>Clear</Text>
            </PressableScale>
          )}
        </View>

        {showPalette && (
          <Animated.View entering={FadeInDown.duration(250)} style={s.palette}>
            {ALPHABET.map((l) => (
              <PressableScale
                key={l.coptic}
                onPress={() => setInput((t) => t + l.coptic)}
                style={s.key}
                accessibilityLabel={l.name}>
                <Text style={s.keyGlyph}>{l.coptic}</Text>
              </PressableScale>
            ))}
            <PressableScale
              onPress={() => setInput((t) => t + '̀')}
              style={s.key}
              accessibilityLabel="Jinkim">
              <Text style={s.keyGlyph}>◌̀</Text>
            </PressableScale>
            <PressableScale
              onPress={() => setInput((t) => t + ' ')}
              style={[s.key, s.keyWide]}
              accessibilityLabel="Space">
              <Text style={s.keyLabel}>space</Text>
            </PressableScale>
            <PressableScale
              onPress={() => setInput((t) => [...t].slice(0, -1).join(''))}
              style={[s.key, s.keyWide]}
              accessibilityLabel="Backspace">
              <Icon name="delete" size={16} color={colors.textMid} />
            </PressableScale>
          </Animated.View>
        )}
      </Card>

      <Card title="Transliteration" entering={FadeInDown.duration(400).delay(80)}>
        <View style={s.viewRow}>
          {VIEWS.map((v) => {
            const active = view === v;
            return (
              <PressableScale key={v} onPress={() => setView(v)} style={[s.chip, active && s.chipActive]}>
                <Text style={[s.chipLabel, active && { color: colors.accent }]}>{v}</Text>
              </PressableScale>
            );
          })}
          {Platform.OS === 'web' && result.length > 0 && (
            <PressableScale onPress={copy} style={[s.chip, s.copyChip]}>
              <Icon name={copied ? 'check' : 'copy'} size={13} color={copied ? colors.greenSoft : colors.textMid} />
              <Text style={[s.chipLabel, copied && { color: colors.greenSoft }]}>
                {copied ? 'Copied' : 'Copy'}
              </Text>
            </PressableScale>
          )}
        </View>

        {unmapped.length > 0 && (
          <View style={s.warn}>
            <Icon name="alert-triangle" size={13} color={colors.amber} />
            <Text style={s.warnText}>No mapping for: {[...unmapped].join(' ')} — passed through unchanged.</Text>
          </View>
        )}

        {result.length === 0 ? (
          <Text style={s.empty}>
            Type or paste Coptic above — the transliteration appears instantly, even offline.
          </Text>
        ) : view === 'Latin' ? (
          <Text style={s.output} selectable>
            {result}
          </Text>
        ) : (
          <Interlinear source={input} latin={result} />
        )}
      </Card>
    </Screen>
  );
}

const s = StyleSheet.create({
  input: { width: '100%', minHeight: 96, backgroundColor: colors.inputBg, color: colors.text, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.inputBorder, fontSize: 18, textAlignVertical: 'top' },
  inputActions: { flexDirection: 'row', gap: 8, marginTop: 10 },

  chip: { paddingVertical: 5, paddingHorizontal: 12, borderRadius: 999, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder },
  chipActive: { borderColor: colors.accent, backgroundColor: colors.accent + '1a' },
  chipLabel: { fontSize: 12, fontWeight: '600', color: colors.textDim },
  copyChip: { flexDirection: 'row', alignItems: 'center', gap: 5, marginLeft: 'auto' },

  palette: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12, maxWidth: CARD_MAX },
  key: { width: 40, height: 40, borderRadius: 10, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.cardBorder, alignItems: 'center', justifyContent: 'center' },
  keyWide: { width: 66 },
  keyGlyph: { fontSize: 18, color: colors.text },
  keyLabel: { fontSize: 11, fontWeight: '600', color: colors.textMid },

  viewRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, width: '100%' },

  warn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.amber + '14', borderColor: colors.amber + '55', borderWidth: 1, borderRadius: 10, paddingVertical: 6, paddingHorizontal: 10, marginBottom: 10 },
  warnText: { flex: 1, fontSize: 12, color: colors.amber },

  empty: { fontSize: 13, color: colors.textDim, lineHeight: 19 },
  output: { fontSize: 17, color: colors.text, lineHeight: 26 },
});
