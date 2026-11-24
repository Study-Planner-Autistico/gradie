import Slider from '@react-native-community/slider';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/ui';
import { LINE_GAP, PaperThumb } from '../components/whiteboard/Paper';
import { t } from '../i18n';
import { demoNotes } from '../data/demo';
import { createNote, getNoteMeta, saveNoteMeta, type PageSize, type PaperTemplate } from '../state/whiteboard';
import { paperColors, useTheme } from '../theme';
import { Icon } from '../components/icons';

/** Carte con la grandezza regolabile (dec. 171), poi tutte le altre. */
const SIZED: PaperTemplate[] = ['lined', 'grid'];
const OTHERS: PaperTemplate[] = ['blank', 'margin', 'cornell', 'dots', 'music'];
const SIZES: PageSize[] = ['a4', 'letter'];
/** Distanza delle righe / lato dei quadri, in punti del foglio (28 = righe normali, 16 = quadretti piccoli). */
const GAP = { lined: { min: 16, max: 44 }, grid: { min: 12, max: 40 } } as const;
// Le vecchie carte a misura fissa diventano righe o quadri con la loro misura.
const LEGACY: Partial<Record<PaperTemplate, [PaperTemplate, number]>> = { narrow: ['lined', 20], wide: ['lined', 38], smallGrid: ['grid', 16] };

/** Nuovo foglio di un quaderno (dec. 112, 143, con `?subject=`) o modifica di un foglio (dec. 113, con `?id=`): nome e carta. */
export default function NuovaNota() {
  const { colors, typography, spacing, radius } = useTheme();
  const { id, subject: subjectParam } = useLocalSearchParams<{ id?: string; subject?: string }>();
  const editing = !!id;
  const meta = id ? getNoteMeta(id) : undefined;
  const demo = id ? demoNotes.find((n) => n.id === id) : undefined;
  // Il foglio resta nel suo quaderno: la materia non si cambia da qui.
  const subject = meta?.subject ?? demo?.subject ?? subjectParam ?? '';
  const [title, setTitle] = useState(meta?.title ?? demo?.title ?? '');
  const startTemplate = meta?.paper.template ?? (editing ? 'blank' : 'lined');
  const legacy = LEGACY[startTemplate];
  const [template, setTemplate] = useState<PaperTemplate>(legacy?.[0] ?? startTemplate);
  const [gap, setGap] = useState(legacy?.[1] ?? meta?.paper.gap ?? LINE_GAP);
  const [paperId, setPaperId] = useState<string>(paperColors.find((p) => p.color === meta?.paper.color)?.id ?? paperColors[0].id);
  const [size, setSize] = useState<PageSize>(meta?.paper.size ?? 'a4');
  const [landscape, setLandscape] = useState(meta?.paper.landscape ?? false);

  const paper = paperColors.find((p) => p.id === paperId) ?? paperColors[0];
  const range = template === 'lined' || template === 'grid' ? GAP[template] : null;

  const pick = (tp: PaperTemplate) => {
    setTemplate(tp);
    const r = tp === 'lined' || tp === 'grid' ? GAP[tp] : null;
    if (r) setGap((g) => Math.min(r.max, Math.max(r.min, g)));
  };

  const create = () => {
    const data = {
      title: title.trim() || t.newNote.defaultTitle,
      // La copertina non si sceglie più da qui (dec. 171): un foglio che l'aveva la tiene.
      cover: meta ? meta.cover : (demo?.cover ?? null),
      paper: { template, color: paper.color, dark: paper.dark, size, landscape, ...(range ? { gap } : {}) },
      subject,
    };
    if (id) {
      saveNoteMeta(id, data);
      router.back();
      return;
    }
    router.replace(`/lavagna/${createNote(data)}`);
  };

  const ring = (on: boolean) => ({ borderWidth: 2, borderColor: on ? colors.accent : 'transparent', borderRadius: radius.sm, padding: 3 });
  const thumb = (tp: PaperTemplate) => (
    <Pressable key={tp} onPress={() => pick(tp)} accessibilityRole="button" accessibilityLabel={t.newNote.templates[tp]} accessibilityState={{ selected: template === tp }} style={{ alignItems: 'center', gap: 4 }}>
      <View style={ring(template === tp)}>
        <PaperThumb template={tp} gap={tp === template ? gap : undefined} color={paper.color} dark={paper.dark} width={70} height={96} />
      </View>
      <Text style={[typography.caption, { color: colors.textSecondary }]}>{t.newNote.templates[tp]}</Text>
    </Pressable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.bg }}>
      {/* Come Modifica profilo: niente barra in alto, il nome del foglio fa da titolo, staccato dal bordo. */}
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.xxl, gap: spacing.xl }}>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder={t.newNote.defaultTitle}
          placeholderTextColor={colors.textTertiary}
          accessibilityLabel={t.newNote.name}
          maxLength={40}
          style={[typography.title1, { color: colors.text, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border }]}
        />

        <View style={{ gap: spacing.sm }}>
          <Label>{t.newNote.paper}</Label>
          <View style={{ flexDirection: 'row', gap: spacing.md }}>{SIZED.map(thumb)}</View>
          {range && (
            <View style={{ gap: spacing.xs }}>
              <Text style={[typography.body, { color: colors.textSecondary }]}>{template === 'grid' ? t.newNote.gridGap : t.newNote.lineGap}</Text>
              <Slider
                value={gap}
                onValueChange={setGap}
                minimumValue={range.min}
                maximumValue={range.max}
                step={2}
                minimumTrackTintColor={colors.accent}
                accessibilityLabel={template === 'grid' ? t.newNote.gridGap : t.newNote.lineGap}
              />
            </View>
          )}
        </View>

        <View style={{ gap: spacing.sm }}>
          <Label>{t.newNote.others}</Label>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.md }}>
            {OTHERS.map(thumb)}
          </ScrollView>
        </View>

        <View style={{ gap: spacing.sm }}>
          <Label>{t.newNote.background}</Label>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {paperColors.map((p) => (
              <Pressable
                key={p.id}
                onPress={() => setPaperId(p.id)}
                accessibilityRole="button"
                accessibilityLabel={t.newNote.colors[p.id]}
                accessibilityState={{ selected: paperId === p.id }}
                style={{ width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: paperId === p.id ? colors.accent : 'transparent' }}
              >
                <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: p.color, borderWidth: 1, borderColor: colors.border }} />
              </Pressable>
            ))}
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <Text style={[typography.body, { color: colors.text, flex: 1 }]}>{t.newNote.size}</Text>
          <Segmented options={SIZES.map((s) => ({ key: s, label: t.newNote.sizes[s] }))} value={size} onChange={(v) => setSize(v as PageSize)} />
          <Segmented
            options={[
              { key: 'portrait', icon: 'phone-portrait-outline', label: t.newNote.portrait },
              { key: 'landscape', icon: 'phone-landscape-outline', label: t.newNote.landscape },
            ]}
            value={landscape ? 'landscape' : 'portrait'}
            onChange={(v) => setLandscape(v === 'landscape')}
          />
        </View>
      </ScrollView>

      {/* Pulsante in basso (dec. 116). */}
      <SafeAreaView edges={['bottom']} style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.md }}>
        <Button title={editing ? t.newNote.save : t.newNote.create} appearance="primary" onPress={create} />
      </SafeAreaView>
    </View>
  );
}

function Label({ children }: { children: ReactNode }) {
  const { colors, typography } = useTheme();
  return <Text style={[typography.headline, { color: colors.text }]}>{children}</Text>;
}

function Segmented({
  options,
  value,
  onChange,
}: {
  options: { key: string; label: string; icon?: 'phone-portrait-outline' | 'phone-landscape-outline' }[];
  value: string;
  onChange: (k: string) => void;
}) {
  const { colors, typography, radius } = useTheme();
  return (
    <View style={{ flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.sm, padding: 2 }}>
      {options.map((o) => (
        <Pressable
          key={o.key}
          onPress={() => onChange(o.key)}
          accessibilityRole="button"
          accessibilityLabel={o.label}
          accessibilityState={{ selected: value === o.key }}
          style={{ minWidth: 44, height: 32, paddingHorizontal: 8, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm - 2, backgroundColor: value === o.key ? colors.accent : 'transparent' }}
        >
          {o.icon ? (
            <Icon name={o.icon} size={18} color={value === o.key ? colors.onAccent : colors.text} />
          ) : (
            <Text style={[typography.callout, { color: value === o.key ? colors.onAccent : colors.text }]}>{o.label}</Text>
          )}
        </Pressable>
      ))}
    </View>
  );
}
