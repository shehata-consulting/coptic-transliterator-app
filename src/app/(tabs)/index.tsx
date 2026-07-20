import { useMemo, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { aiTransliterate } from '@/lib/ai';
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

  // AI enhancement is on-demand (button) so nothing burns Gemini free-tier
  // quota unasked. The result carries the input it was computed for; editing
  // the input invalidates it by derivation — no effects, no stale flashes.
  const [aiState, setAiState] = useState<{
    status: 'loading' | 'done' | 'failed';
    text: string | null;
    forInput: string;
  } | null>(null);
  const ai =
    aiState && aiState.forInput === input
      ? aiState
      : ({ status: 'idle', text: null } as const);

  const enhance = async () => {
    const snapshot = input;
    setAiState({ status: 'loading', text: null, forInput: snapshot });
    const out = await aiTransliterate(snapshot);
    setAiState((cur) =>
      cur?.status === 'loading' && cur.forInput === snapshot
        ? out
          ? { status: 'done', text: out, forInput: snapshot }
          : { status: 'failed', text: null, forInput: snapshot }
        : cur
    );
  };

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
          <>
            {ai.status === 'done' && ai.text !== null && (
              <View style={s.aiBlock}>
                <Text style={s.aiLabel}>✨ AI-enhanced</Text>
                <Text style={s.output} selectable>
                  {ai.text}
                </Text>
              </View>
            )}
            {ai.status === 'done' && <Text style={s.subLabel}>Rule-based</Text>}
            <Text style={s.output} selectable>
              {result}
            </Text>
          </>
        ) : (
          <Interlinear source={input} latin={result} />
        )}

        {result.length > 0 && view === 'Latin' && (
          <View style={s.aiRow}>
            {ai.status === 'loading' ? (
              <View style={s.aiStatus}>
                <ActivityIndicator size="small" color={colors.accent} />
                <Text style={s.aiStatusText}>Asking Gemini…</Text>
              </View>
            ) : ai.status === 'idle' ? (
              <PressableScale onPress={enhance} style={[s.chip, s.aiChip]}>
                <Text style={[s.chipLabel, { color: colors.accent }]}>✨ Enhance with AI</Text>
              </PressableScale>
            ) : ai.status === 'failed' ? (
              <Text style={s.aiStatusText}>
                AI unavailable right now — the rule-based result above is complete.
              </Text>
            ) : null}
          </View>
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

  aiBlock: { borderLeftWidth: 2, borderLeftColor: colors.accent + '88', paddingLeft: 12, marginBottom: 14 },
  aiLabel: { fontSize: 11, fontWeight: '700', color: colors.accent, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 },
  subLabel: { fontSize: 11, fontWeight: '700', color: colors.textDim, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 },
  aiRow: { marginTop: 14 },
  aiChip: { alignSelf: 'flex-start', borderColor: colors.accent + '66' },
  aiStatus: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  aiStatusText: { fontSize: 12, color: colors.textDim },
});
