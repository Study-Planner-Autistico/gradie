import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { tap } from '../components/haptics';
import { Button, TextField } from '../components/ui';
import { t } from '../i18n';
import { INTEREST_IDS, MAX_BIO, MAX_INTERESTS, updateProfile, useProfile, type InterestId } from '../state/profile';
import { useTheme } from '../theme';

/** Modifica profilo (dec. 133): bio breve e pochi interessi. L'avatar arriverà più avanti. */
export default function ModificaProfilo() {
  const { colors, typography, spacing, radius } = useTheme();
  const profile = useProfile();
  const [bio, setBio] = useState(profile.bio);
  const [picked, setPicked] = useState<string[]>(profile.interests);

  const toggle = (id: InterestId) => {
    tap();
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length >= MAX_INTERESTS ? p : [...p, id]));
  };

  return (
    <ScrollView
      style={{ backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.bg }}
      contentContainerStyle={{ padding: spacing.lg, paddingTop: spacing.xxl, gap: spacing.xl }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[typography.title1, { color: colors.text }]}>{t.profile.editProfile}</Text>

      <TextField
        label={t.profile.bio}
        value={bio}
        onChangeText={(v) => setBio(v.slice(0, MAX_BIO))}
        placeholder={t.profile.bioPlaceholder}
        multiline
        maxLength={MAX_BIO}
        helper={t.profile.bioHelper(bio.length, MAX_BIO)}
        style={{ minHeight: 96, paddingTop: spacing.md, textAlignVertical: 'top' }}
      />

      <View style={{ gap: spacing.sm }}>
        <Text style={[typography.overline, { color: colors.textSecondary }]}>{t.profile.interests}</Text>
        <Text style={[typography.caption, { color: colors.textTertiary }]}>{t.profile.interestsHelper(MAX_INTERESTS)}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {INTEREST_IDS.map((id) => {
            const on = picked.includes(id);
            const full = !on && picked.length >= MAX_INTERESTS;
            return (
              <Pressable
                key={id}
                onPress={() => toggle(id)}
                disabled={full}
                accessibilityRole="checkbox"
                accessibilityLabel={t.interestNames[id]}
                accessibilityState={{ checked: on, disabled: full }}
                style={({ pressed }) => ({
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  borderRadius: radius.pill,
                  borderWidth: on ? 2 : 1,
                  borderColor: on ? colors.accent : colors.border,
                  backgroundColor: on ? colors.selected : colors.surface,
                  opacity: full ? 0.4 : pressed ? 0.7 : 1,
                })}
              >
                <Text style={[typography.callout, { color: on ? colors.selectedText : colors.text }]}>{t.interestNames[id]}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Button
        title={t.profile.save}
        appearance="primary"
        fullWidth
        onPress={() => {
          updateProfile({ bio: bio.trim(), interests: picked });
          router.back();
        }}
      />
    </ScrollView>
  );
}
