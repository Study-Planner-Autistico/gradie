import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Platform, Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/ui';
import { CoverThumb, PaperThumb } from '../components/whiteboard/Paper';
import { t } from '../i18n';
import { demoNotes } from '../data/demo';
import { createNote, getNoteMeta, saveNoteMeta, type PageSize, type PaperTemplate } from '../state/whiteboard';
import { covers, paperColors, useTheme } from '../theme';

const TEMPLATES: PaperTemplate[] = ['blank', 'lined', 'narrow', 'wide', 'margin', 'cornell', 'grid', 'smallGrid', 'dots', 'music'];
const SIZES: PageSize[] = ['a4', 'letter'];

/** Nuova nota (dec. 112) o modifica di una nota esistente (dec. 113, con `?id=`): nome, copertina e carta. */
export default function NuovaNota() {
  const { colors, typography, spacing, radius } = useTheme();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const editing = !!id;
  const meta = id ? getNoteMeta(id) : undefined;
  const fallbackTitle = id ? (demoNotes.find((n) => n.id === id)?.title ?? '') : '';
  const [title, setTitle] = useState(meta?.title ?? fallbackTitle);
  const [hasCover, setHasCover] = useState(editing ? !!meta?.cover : true);
  const [tab, setTab] = useState<'cover' | 'paper'>(editing && !meta?.cover ? 'paper' : 'cover');
  const [cover, setCover] = useState<string>(covers.find((c) => c.color === meta?.cover)?.id ?? covers[0].id);
  const [template, setTemplate] = useState<PaperTemplate>(meta?.paper.template ?? (editing ? 'blank' : 'lined'));
  const [paperId, setPaperId] = useState<string>(paperColors.find((p) => p.color === meta?.paper.color)?.id ?? paperColors[0].id);
  const [size, setSize] = useState<PageSize>(meta?.paper.size ?? 'a4');
  const [landscape, setLandscape] = useState(meta?.paper.landscape ?? false);

  const paper = paperColors.find((p) => p.id === paperId) ?? paperColors[0];
  const coverColor = covers.find((c) => c.id === cover)?.color ?? covers[0].color;

  const create = () => {
    const data = {
      title: title.trim() || t.newNote.defaultTitle,
      cover: hasCover ? coverColor : null,
      paper: { template, color: paper.color, dark: paper.dark, size, landscape },
    };
    if (id) {
      saveNoteMeta(id, data);
      router.back();
      return;
    }
    router.replace(`/lavagna/${createNote(data)}`);
  };

  const ring = (on: boolean) => ({ borderWidth: 2, borderColor: on ? colors.accent : 'transparent', borderRadius: radius.sm, padding: 3 });

  return (
    <View style={{ flex: 1, backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.lg, paddingTop: spacing.xl, gap: spacing.md }}>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityRole="button" accessibilityLabel={t.a11y.close}>
          <Ionicons name="close" size={26} color={colors.text} />
        </Pressable>
        <Text style={[typography.headline, { color: colors.text, flex: 1, textAlign: 'center' }]}>{editing ? t.newNote.editTitle : t.newNote.title}</Text>
        {/* Stessa larghezza della x, per tenere il titolo al centro. */}
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingTop: 0, gap: spacing.lg }}>
        <View style={{ gap: spacing.xs }}>
          <Label>{t.newNote.name}</Label>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder={t.newNote.defaultTitle}
            placeholderTextColor={colors.textTertiary}
            style={[typography.input, { color: colors.text, backgroundColor: colors.surface, borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 0, height: 44, textAlignVertical: 'center', includeFontPadding: false }]}
          />
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={[typography.body, { color: colors.text, flex: 1 }]}>{t.newNote.cover}</Text>
          <Switch value={hasCover} onValueChange={setHasCover} trackColor={{ true: colors.success }} />
        </View>

        {/* Anteprime: copertina e carta, si tocca per scegliere cosa modificare. */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: spacing.xl }}>
          {hasCover && (
            <Pressable onPress={() => setTab('cover')} accessibilityRole="tab" accessibilityState={{ selected: tab === 'cover' }} style={{ alignItems: 'center', gap: spacing.xs }}>
              <View style={ring(tab === 'cover')}>
                <CoverThumb color={coverColor} title={title} width={70} height={96} />
              </View>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>{t.newNote.cover}</Text>
            </Pressable>
          )}
          <Pressable onPress={() => setTab('paper')} accessibilityRole="tab" accessibilityState={{ selected: tab === 'paper' || !hasCover }} style={{ alignItems: 'center', gap: spacing.xs }}>
            <View style={ring(tab === 'paper' || !hasCover)}>
              <PaperThumb template={template} color={paper.color} dark={paper.dark} width={landscape ? 96 : 70} height={landscape ? 70 : 96} />
            </View>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>{t.newNote.paper}</Text>
          </Pressable>
        </View>

        {hasCover && tab === 'cover' ? (
          <View style={{ gap: spacing.sm }}>
            <Label>{t.newNote.cover}</Label>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
              {covers.map((c, i) => (
                <Pressable key={c.id} onPress={() => setCover(c.id)} accessibilityRole="button" accessibilityLabel={`${t.newNote.classic} ${i + 1}`} accessibilityState={{ selected: cover === c.id }} style={{ alignItems: 'center', gap: 4 }}>
                  <View style={ring(cover === c.id)}>
                    <CoverThumb color={c.color} width={64} height={88} />
                    {cover === c.id && (
                      <View style={{ position: 'absolute', bottom: 8, right: 8, width: 22, height: 22, borderRadius: 11, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}>
                        <Ionicons name="checkmark" size={15} color={colors.onAccent} />
                      </View>
                    )}
                  </View>
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>{`${t.newNote.classic} ${i + 1}`}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : (
          <View style={{ gap: spacing.sm }}>
            <Label>{t.newNote.paper}</Label>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.md }}>
              {TEMPLATES.map((tp) => (
                <Pressable key={tp} onPress={() => setTemplate(tp)} accessibilityRole="button" accessibilityLabel={t.newNote.templates[tp]} accessibilityState={{ selected: template === tp }} style={{ alignItems: 'center', gap: 4 }}>
                  <View style={ring(template === tp)}>
                    <PaperThumb template={tp} color={paper.color} dark={paper.dark} width={70} height={96} />
                  </View>
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>{t.newNote.templates[tp]}</Text>
                </Pressable>
              ))}
            </ScrollView>
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
        )}

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
            <Ionicons name={o.icon} size={18} color={value === o.key ? colors.onAccent : colors.text} />
          ) : (
            <Text style={[typography.callout, { color: value === o.key ? colors.onAccent : colors.text }]}>{o.label}</Text>
          )}
        </Pressable>
      ))}
    </View>
  );
}
