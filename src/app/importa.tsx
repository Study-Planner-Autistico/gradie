import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { Icon, IMPORT_ICON } from '../components/icons';
import { Button, type IconName } from '../components/ui';
import { t } from '../i18n';
import { useSubjects } from '../state/subjects';
import { createNote, type ImportKind, type ImportSource } from '../state/whiteboard';
import { useTheme } from '../theme';

const KINDS: ImportKind[] = ['pdf', 'word', 'ppt', 'youtube'];

/** Tipi accettati per ogni file, con le estensioni per controllare quello scelto. */
const FILES: Record<Exclude<ImportKind, 'youtube'>, { mime: string[]; ext: string[] }> = {
  pdf: { mime: ['application/pdf'], ext: ['pdf'] },
  word: { mime: ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'], ext: ['doc', 'docx'] },
  ppt: { mime: ['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'], ext: ['ppt', 'pptx'] },
};

/** Link di un video: youtube.com/watch?v=…, youtu.be/…, /shorts/, /live/, /embed/. */
const YOUTUBE = /^(https?:\/\/)?(www\.|m\.|music\.)?(youtube\.com\/(watch\?(.*&)?v=|shorts\/|live\/|embed\/)|youtu\.be\/)[\w-]{11}/i;

type Step =
  | { k: 'choose' }
  | { k: 'link'; url: string }
  | { k: 'loading' }
  | { k: 'ok'; source: ImportSource }
  | { k: 'err'; message: string; kind: ImportKind }
  | { k: 'subject'; source: ImportSource };

/** Importa un PDF, un Word, un PowerPoint o un video di YouTube in una materia (dec. 176). Pannello in basso, alto quanto serve. */
export default function Importa() {
  const { colors, typography, spacing, radius } = useTheme();
  const subjects = useSubjects();
  const { height } = useWindowDimensions();
  const [step, setStep] = useState<Step>({ k: 'choose' });

  const pickFile = async (kind: Exclude<ImportKind, 'youtube'>) => {
    const fail = () => setStep({ k: 'err', message: t.importer.errWrongFile(t.importer.kinds[kind]), kind });
    const res = await DocumentPicker.getDocumentAsync({ type: FILES[kind].mime, copyToCacheDirectory: true });
    if (res.canceled) return setStep({ k: 'choose' });
    const file = res.assets[0];
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!FILES[kind].ext.includes(ext) || file.size === 0) return fail();
    setStep({ k: 'ok', source: { kind, uri: file.uri, name: file.name.replace(/\.[^.]+$/, '') } });
  };

  const checkLink = async (raw: string) => {
    const url = raw.trim();
    if (!YOUTUBE.test(url)) return setStep({ k: 'err', message: t.importer.errLink, kind: 'youtube' });
    setStep({ k: 'loading' });
    // YouTube conferma che il video esiste e ne dà il titolo, che diventa il nome del foglio.
    try {
      const r = await fetch(`https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(url.startsWith('http') ? url : `https://${url}`)}`);
      if (!r.ok) throw new Error(String(r.status));
      const { title } = (await r.json()) as { title?: string };
      setStep({ k: 'ok', source: { kind: 'youtube', uri: url.startsWith('http') ? url : `https://${url}`, name: title || t.importer.kinds.youtube } });
    } catch {
      setStep({ k: 'err', message: t.importer.errVideo, kind: 'youtube' });
    }
  };

  const choose = (kind: ImportKind) => (kind === 'youtube' ? setStep({ k: 'link', url: '' }) : pickFile(kind));

  const add = (source: ImportSource, subject: string) => {
    createNote({ title: source.name.slice(0, 60), cover: null, paper: { template: 'blank', color: '#FFFFFF', dark: false, size: 'a4', landscape: false }, subject, source });
    router.back();
    router.push({ pathname: '/quaderno/[name]', params: { name: subject } });
  };

  const title = (s: string) => <Text style={[typography.title2, { color: colors.text, textAlign: 'center' }]} accessibilityRole="header">{s}</Text>;
  const body = (s: string) => <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center' }]}>{s}</Text>;
  const badge = (icon: IconName, fg: string, bg: string) => (
    <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' }}>
      <Icon name={icon} size={38} color={fg} />
    </View>
  );
  const row = (icon: IconName, label: string, onPress: () => void, tint = colors.text) => (
    <Pressable
      key={label}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 56, paddingHorizontal: spacing.lg, borderRadius: radius.xl, backgroundColor: pressed ? colors.neutralPressed : colors.surfaceMuted })}
    >
      <Icon name={icon} size={24} color={tint} />
      <Text style={[typography.headline, { color: colors.text, flex: 1 }]}>{label}</Text>
      <Icon name="chevron-forward" size={20} color={colors.textTertiary} />
    </Pressable>
  );
  const buttons = (left: { title: string; onPress: () => void }, right: { title: string; onPress: () => void; icon?: IconName }) => (
    <View style={{ flexDirection: 'row', gap: spacing.md }}>
      <View style={{ flex: 1 }}>
        <Button title={left.title} onPress={left.onPress} />
      </View>
      <View style={{ flex: 1 }}>
        <Button title={right.title} onPress={right.onPress} appearance="ink" iconAfter={right.icon} />
      </View>
    </View>
  );

  return (
    <View style={{ backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.bg, padding: spacing.xl, paddingTop: spacing.xxxl, gap: spacing.lg }}>
      {step.k === 'choose' && (
        <>
          {title(t.importer.title)}
          <View style={{ gap: spacing.sm }}>{KINDS.map((k) => row(IMPORT_ICON[k], t.importer.kinds[k], () => choose(k), k === 'youtube' ? colors.dangerIcon : colors.text))}</View>
        </>
      )}

      {step.k === 'link' && (
        <>
          {badge('logo-youtube', colors.dangerIcon, colors.dangerBg)}
          {title(t.importer.linkLabel)}
          <TextInput
            value={step.url}
            onChangeText={(url) => setStep({ k: 'link', url })}
            onSubmitEditing={() => checkLink(step.url)}
            placeholder={t.importer.linkPlaceholder}
            placeholderTextColor={colors.textTertiary}
            accessibilityLabel={t.importer.linkLabel}
            autoFocus
            multiline={false}
            numberOfLines={1}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            returnKeyType="go"
            style={[typography.body, { color: colors.text, height: 48, paddingHorizontal: spacing.lg, borderRadius: radius.xl, backgroundColor: colors.surfaceMuted }]}
          />
          {buttons({ title: t.importer.close, onPress: () => setStep({ k: 'choose' }) }, { title: t.importer.linkGo, onPress: () => checkLink(step.url) })}
        </>
      )}

      {step.k === 'loading' && (
        <View style={{ alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl }} accessibilityLiveRegion="polite">
          <ActivityIndicator size="large" color={colors.textSecondary} />
          {body(t.importer.loading)}
        </View>
      )}

      {step.k === 'ok' && (
        <>
          {badge('checkmark-circle', colors.successIcon, colors.successBg)}
          {title(t.importer.okTitle)}
          {body(t.importer.okBody(step.source.name))}
          {buttons({ title: t.importer.close, onPress: () => router.back() }, { title: t.importer.next, onPress: () => setStep({ k: 'subject', source: step.source }) })}
        </>
      )}

      {step.k === 'err' && (
        <>
          {badge('warning', colors.warningIcon, colors.warningBg)}
          {title(t.importer.errTitle)}
          {body(step.message)}
          {buttons({ title: t.importer.close, onPress: () => router.back() }, { title: t.importer.retry, onPress: () => choose(step.kind) })}
        </>
      )}

      {step.k === 'subject' && (
        <>
          {title(t.importer.subjectTitle)}
          {/* Con tante materie l'elenco scorre invece di uscire dal pannello. */}
          <ScrollView style={{ maxHeight: height * 0.6 }} contentContainerStyle={{ gap: spacing.sm }}>
            {subjects.map((s) => row('book', s, () => add(step.source, s)))}
          </ScrollView>
        </>
      )}
    </View>
  );
}
