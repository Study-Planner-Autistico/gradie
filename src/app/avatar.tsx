import { router } from 'expo-router';
import { useRef, useState, type ReactNode } from 'react';
import { Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AVATAR_STYLES, Avatar, DEFAULT_AVATAR, type AvatarColorPart, type AvatarConfig, type AvatarStylePart, AVATAR_FRAMES } from '../components/avatar/Avatar';
import { success, tap } from '../components/haptics';
import { t } from '../i18n';
import { updateProfile, useProfile } from '../state/profile';
import { avatarPalette, useTheme } from '../theme';
import { Icon } from '../components/icons';

type Section =
  | { kind: 'color'; part: AvatarColorPart; colors: readonly string[] }
  | { kind: 'style'; part: AvatarStylePart; frame: keyof typeof AVATAR_FRAMES };

type Tab = { id: keyof typeof t.avatar.tabs; icon: (color: string) => ReactNode; sections: Section[] };

const ion = (name: 'body-outline' | 'happy-outline' | 'cut-outline' | 'glasses-outline' | 'color-palette-outline') => (color: string) => (
  <Icon name={name} size={28} color={color} />
);

/** Categorie dell'editor, come le schede di Duolingo: in ognuna prima i colori, poi le forme. */
const TABS: Tab[] = [
  {
    id: 'body',
    icon: ion('body-outline'),
    sections: [
      { kind: 'color', part: 'skin', colors: avatarPalette.skin },
      { kind: 'color', part: 'shirtColor', colors: avatarPalette.shirt },
      { kind: 'style', part: 'shirt', frame: 'full' },
    ],
  },
  {
    id: 'face',
    icon: ion('happy-outline'),
    sections: [
      { kind: 'style', part: 'eyes', frame: 'face' },
      { kind: 'style', part: 'eyebrow', frame: 'face' },
      { kind: 'style', part: 'nose', frame: 'face' },
      { kind: 'style', part: 'mouth', frame: 'face' },
      { kind: 'style', part: 'ear', frame: 'head' },
    ],
  },
  {
    id: 'hair',
    icon: ion('cut-outline'),
    sections: [
      { kind: 'color', part: 'hairColor', colors: avatarPalette.hair },
      { kind: 'style', part: 'hair', frame: 'head' },
    ],
  },
  { id: 'glasses', icon: ion('glasses-outline'), sections: [{ kind: 'style', part: 'glasses', frame: 'face' }] },
  {
    id: 'hat',
    icon: (color) => <Icon name="hat-fedora" size={28} color={color} />,
    sections: [
      { kind: 'color', part: 'hatColor', colors: avatarPalette.hat },
      { kind: 'style', part: 'hat', frame: 'head' },
    ],
  },
  { id: 'bg', icon: ion('color-palette-outline'), sections: [{ kind: 'color', part: 'bg', colors: avatarPalette.bg }] },
];

/**
 * Editor dell'avatar (dec. 136), ispirato a Duolingo: anteprima grande sullo sfondo scelto, schede con icone,
 * colori in fila e forme in griglia con l'anteprima di ogni scelta. "Fatto" si attiva solo se qualcosa cambia.
 */
export default function AvatarEditor() {
  const { colors, typography, spacing, layout } = useTheme();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const saved = useProfile().avatar;
  const start = useRef(saved ?? DEFAULT_AVATAR).current;
  const [draft, setDraft] = useState<AvatarConfig>(start);
  const [tab, setTab] = useState(0);
  const dirty = saved === null || JSON.stringify(draft) !== JSON.stringify(start);
  const previewHeight = Math.min(300, Math.round(height * 0.32));

  // I valori arrivano dalle liste di AVATAR_STYLES e avatarPalette, quindi sono validi per quella parte.
  const set = (part: keyof AvatarConfig, value: string) => {
    tap();
    setDraft((d) => ({ ...d, [part]: value }) as AvatarConfig);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <View style={{ paddingTop: insets.top, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm, height: insets.top + 56 }}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={t.avatar.close}
          style={({ pressed }) => ({ width: layout.iconButton, height: layout.iconButton, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : 1 })}
        >
          <Icon name="close" size={30} color={colors.textTertiary} />
        </Pressable>
        <Text accessibilityRole="header" style={[typography.title2, { color: colors.text, flex: 1, textAlign: 'center' }]}>
          {saved ? t.avatar.edit : t.avatar.create}
        </Text>
        <Pressable
          disabled={!dirty}
          onPress={() => {
            success();
            updateProfile({ avatar: draft });
            router.back();
          }}
          accessibilityRole="button"
          accessibilityState={{ disabled: !dirty }}
          style={({ pressed }) => ({ minWidth: layout.iconButton, height: layout.iconButton, paddingHorizontal: spacing.sm, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : 1 })}
        >
          <Text style={[typography.headline, { color: dirty ? colors.link : colors.textTertiary }]}>{t.avatar.done}</Text>
        </Pressable>
      </View>

      <View style={{ height: previewHeight, backgroundColor: draft.bg, alignItems: 'center', justifyContent: 'flex-end', overflow: 'hidden' }}>
        <Avatar config={draft} size={previewHeight} shape="square" background={false} accessibilityLabel={t.avatar.preview} />
      </View>

      <View accessibilityRole="tablist" style={{ flexDirection: 'row', borderBottomWidth: 2, borderBottomColor: colors.border }}>
        {TABS.map((tb, i) => {
          const on = i === tab;
          return (
            <Pressable
              key={tb.id}
              onPress={() => {
                tap();
                setTab(i);
              }}
              accessibilityRole="tab"
              accessibilityLabel={t.avatar.tabs[tb.id]}
              accessibilityState={{ selected: on }}
              style={({ pressed }) => ({ flex: 1, height: 60, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : 1 })}
            >
              {tb.icon(on ? colors.accent : colors.textTertiary)}
              {on && <View style={{ position: 'absolute', left: 0, right: 0, bottom: -2, height: 3, backgroundColor: colors.accent }} />}
            </Pressable>
          );
        })}
      </View>

      {/* key: cambiando scheda la lista riparte dall'alto. */}
      <ScrollView key={tab} contentContainerStyle={{ paddingVertical: spacing.xxl, paddingBottom: insets.bottom + spacing.xxxl, gap: spacing.xxxl }}>
        {TABS[tab].sections.map((s) => (
          <View key={s.part} style={{ gap: spacing.lg }}>
            <Text accessibilityRole="header" style={[typography.title2, { color: colors.text, paddingHorizontal: spacing.xxl }]}>
              {t.avatar.sections[s.part]}
            </Text>
            {s.kind === 'color' ? (
              <Swatches colors={s.colors} value={draft[s.part]} onPick={(c) => set(s.part, c)} />
            ) : (
              <StyleGrid part={s.part} frame={s.frame} draft={draft} onPick={(v) => set(s.part, v)} />
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

/** Fila di colori che scorre in orizzontale; il colore scelto ha il bordo del brand. */
function Swatches({ colors: list, value, onPick }: { colors: readonly string[]; value: string; onPick: (c: string) => void }) {
  const { colors, spacing, radius } = useTheme();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.xxl, gap: spacing.md }}>
      {list.map((c, i) => {
        const on = c === value;
        return (
          <Pressable
            key={c}
            onPress={() => onPick(c)}
            accessibilityRole="radio"
            accessibilityLabel={t.avatar.color(i + 1, list.length)}
            accessibilityState={{ checked: on }}
            style={({ pressed }) => ({
              width: 64,
              height: 64,
              borderRadius: radius.xxl,
              borderWidth: 2,
              borderBottomWidth: 4,
              borderColor: on ? colors.borderFocused : colors.border,
              backgroundColor: on ? colors.selected : colors.surface,
              alignItems: 'center',
              justifyContent: 'center',
              transform: [{ scale: pressed ? 0.96 : 1 }],
            })}
          >
            <View style={{ width: 40, height: 40, borderRadius: radius.lg, backgroundColor: c, borderWidth: 1, borderColor: colors.border }} />
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

/** Griglia a 3 colonne: ogni riquadro mostra l'avatar con quella forma, inquadrato sulla parte che cambia. */
function StyleGrid({
  part,
  frame,
  draft,
  onPick,
}: {
  part: AvatarStylePart;
  frame: keyof typeof AVATAR_FRAMES;
  draft: AvatarConfig;
  onPick: (v: string) => void;
}) {
  const { colors, spacing, radius } = useTheme();
  const { width } = useWindowDimensions();
  const gap = spacing.md;
  const tile = Math.floor((Math.min(width, 600) - spacing.xxl * 2 - gap * 2) / 3);
  const names = t.avatar.options[part] as Record<string, string>;
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap, paddingHorizontal: spacing.xxl }}>
      {AVATAR_STYLES[part].map((v) => {
        const on = draft[part] === v;
        return (
          <Pressable
            key={v}
            onPress={() => onPick(v)}
            accessibilityRole="radio"
            accessibilityLabel={names[v]}
            accessibilityState={{ checked: on }}
            style={({ pressed }) => ({
              width: tile,
              height: tile,
              borderRadius: radius.xxl,
              borderWidth: 2,
              borderBottomWidth: 4,
              borderColor: on ? colors.borderFocused : colors.border,
              backgroundColor: on ? colors.selected : colors.surface,
              alignItems: 'center',
              justifyContent: 'flex-end',
              overflow: 'hidden',
              transform: [{ scale: pressed ? 0.97 : 1 }],
            })}
          >
            <Avatar config={{ ...draft, [part]: v }} size={tile - 8} shape="square" frame={frame} background={false} />
          </Pressable>
        );
      })}
    </View>
  );
}
