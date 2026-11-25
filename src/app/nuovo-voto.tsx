import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Coin } from '../components/Coin';
import { GradeSlider } from '../components/GradeSlider';
import { success, tap } from '../components/haptics';
import { SheetPage } from '../components/settings';
import { Button } from '../components/ui';
import { showUndo } from '../components/UndoToast';
import { t } from '../i18n';
import { addCoins } from '../state/coins';
import { addGrade, coinsFor, formatGrade, MAX_GRADE, MIN_GRADE, removeGrade, type GradeKind } from '../state/grades';
import { useSubjects } from '../state/subjects';
import { useTheme } from '../theme';

/**
 * Nuovo voto (dec. 196), dal "+" del Registro voti: prima la materia, poi il voto, scritto a mano (es. 30) o scelto
 * sulla barra, con la lode solo sul 30; poi il tipo. Salvando si guadagnano monete: più alto il voto, più monete.
 */
export default function NuovoVoto() {
  const { colors, typography, spacing, radius } = useTheme();
  const T = t.grades;
  const N = T.new;
  const subjects = useSubjects();
  const params = useLocalSearchParams<{ subject?: string }>();
  const [subject, setSubject] = useState<string | undefined>(params.subject && subjects.includes(params.subject) ? params.subject : undefined);
  const [value, setValue] = useState(27);
  const [text, setText] = useState('27');
  const [lode, setLode] = useState(false);
  const [kind, setKind] = useState<GradeKind>('partial');

  const typed = Number(text);
  const valid = /^\d{1,2}$/.test(text) && typed >= MIN_GRADE && typed <= MAX_GRADE;
  const coins = coinsFor(value, lode && value === MAX_GRADE);

  const fromSlider = (v: number) => {
    setValue(v);
    setText(String(v));
    if (v !== MAX_GRADE) setLode(false);
  };
  const fromText = (s: string) => {
    const clean = s.replace(/\D/g, '').slice(0, 2);
    setText(clean);
    const n = Number(clean);
    if (clean && n >= MIN_GRADE && n <= MAX_GRADE) {
      setValue(n);
      if (n !== MAX_GRADE) setLode(false);
    }
  };

  const save = () => {
    if (!subject || !valid) return;
    const withLode = lode && value === MAX_GRADE;
    const grade = addGrade({ subject, value, lode: withLode || undefined, kind, date: new Date().toISOString().slice(0, 10) });
    addCoins(coins);
    success();
    showUndo(T.added(formatGrade(grade, T.lode), subject, coins), () => {
      removeGrade(grade.id);
      addCoins(-coins);
    });
    router.back();
  };

  const pill = (on: boolean, label: string, onPress: () => void, disabled?: boolean) => (
    <Pressable
      key={label}
      onPress={() => {
        tap();
        onPress();
      }}
      disabled={disabled}
      accessibilityRole="radio"
      accessibilityState={{ checked: on, disabled }}
      style={({ pressed }) => ({
        minHeight: 40,
        paddingHorizontal: spacing.md,
        justifyContent: 'center',
        borderRadius: radius.pill,
        backgroundColor: on ? colors.accent : colors.surfaceMuted,
        opacity: disabled ? 0.4 : pressed ? 0.7 : 1,
      })}
    >
      <Text style={[typography.callout, { color: on ? colors.onAccent : colors.text, fontWeight: '600' }]}>{label}</Text>
    </Pressable>
  );
  const label = (s: string) => <Text style={[typography.headline, { color: colors.text }]}>{s}</Text>;

  return (
    <SheetPage title={N.title}>
      <View style={{ paddingHorizontal: spacing.xxl, gap: spacing.xl }}>
        <View style={{ gap: spacing.sm }} accessibilityRole="radiogroup">
          {label(N.subject)}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>{subjects.map((s) => pill(s === subject, s, () => setSubject(s)))}</View>
        </View>

        <View style={{ gap: spacing.sm }}>
          {label(N.grade)}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.lg, borderWidth: 1, borderColor: valid ? colors.border : colors.danger }}>
              <TextInput
                value={text}
                onChangeText={fromText}
                keyboardType="number-pad"
                maxLength={2}
                selectTextOnFocus
                accessibilityLabel={N.grade}
                style={[typography.hero, { width: 72, textAlign: 'center', color: colors.text, padding: 0 }]}
              />
              <Text style={[typography.title2, { color: colors.textTertiary }]}>/30</Text>
            </View>
            {pill(lode && value === MAX_GRADE, T.lodeShort, () => setLode((x) => !x), value !== MAX_GRADE)}
          </View>
          <Text style={[typography.caption, { color: valid ? colors.textSecondary : colors.danger }]}>{valid ? N.hint : N.invalid}</Text>
          <GradeSlider value={value} onChange={fromSlider} label={N.grade} />
        </View>

        <View style={{ gap: spacing.sm }} accessibilityRole="radiogroup">
          {label(N.kind)}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {pill(kind === 'partial', T.partial, () => setKind('partial'))}
            {pill(kind === 'exam', T.exam, () => setKind('exam'))}
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: radius.lg, backgroundColor: colors.surface }}>
          <Coin size={26} />
          <Text style={[typography.body, { flex: 1, color: colors.text }]}>{N.earn(coins)}</Text>
        </View>

        <Button title={subject ? N.save : N.pickSubject} appearance="primary" disabled={!subject || !valid} onPress={save} />
      </View>
    </SheetPage>
  );
}
