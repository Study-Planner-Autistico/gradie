import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { confirm } from '../components/dialogs';
import { SheetPage } from '../components/settings';
import { Button } from '../components/ui';
import { t } from '../i18n';
import { daysLeft, purgeNotebook, purgeSheet, purgeTrash, restoreSheet, restoreTrashedBook, TRASH_DAYS, useTrashItems, type TrashItem } from '../state/notebooks';
import { useTheme } from '../theme';
import { Icon } from '../components/icons';

/** Cestino degli Appunti (dec. 145): quaderni e fogli eliminati restano 30 giorni, poi spariscono da soli. */
export default function Cestino() {
  const { colors, typography, spacing } = useTheme();
  const items = useTrashItems();

  // Quello che è nel cestino da più di 30 giorni se ne va all'apertura.
  useEffect(() => purgeTrash(), []);

  return (
    <SheetPage title={t.trash.title}>
      <View style={{ paddingHorizontal: spacing.xxl, gap: spacing.lg, paddingBottom: spacing.lg }}>
        <Text style={[typography.body, { color: colors.textSecondary }]}>{t.trash.intro(TRASH_DAYS)}</Text>
        {items.length === 0 && (
          <View style={{ alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xxxl }}>
            <Icon name="trash-outline" size={40} color={colors.textTertiary} />
            <Text style={[typography.headline, { color: colors.textSecondary }]}>{t.trash.empty}</Text>
          </View>
        )}
        {items.map((it) => (
          <TrashRow key={it.kind === 'book' ? `b:${it.name}` : it.sheet.id} item={it} />
        ))}
        {items.length > 0 && (
          <Button
            title={t.trash.emptyAll}
            appearance="danger"
            onPress={() => confirm(t.trash.confirmEmpty, t.trash.emptyAll, () => purgeTrash(true), t.trash.forever)}
          />
        )}
      </View>
    </SheetPage>
  );
}

function TrashRow({ item }: { item: TrashItem }) {
  const { colors, typography, radius, spacing } = useTheme();
  const book = item.kind === 'book';
  const name = book ? item.name : item.sheet.title;
  const kind = book ? `${t.trash.book} · ${t.activitiesHub.sheetCount(item.count)}` : `${t.trash.sheet}${item.sheet.subject ? ` · ${item.sheet.subject}` : ''}`;
  const restore = () => (book ? restoreTrashedBook(item.name) : restoreSheet(item.sheet));
  const purge = () => confirm(t.trash.confirmPurge(name), t.trash.purge, () => (book ? purgeNotebook(item.name) : purgeSheet(item.sheet.id)), t.trash.forever);
  return (
    <View style={{ padding: spacing.md, gap: spacing.md, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
      <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
        <Icon name={book ? 'book-outline' : 'document-text-outline'} size={26} color={colors.textSecondary} />
        <View style={{ flex: 1 }}>
          <Text style={[typography.headline, { color: colors.text }]} numberOfLines={1}>
            {name}
          </Text>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>{kind}</Text>
          <Text style={[typography.caption, { color: colors.textTertiary }]}>{t.trash.daysLeft(daysLeft(item.at))}</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <SmallButton icon="arrow-undo-outline" label={t.trash.restore} onPress={restore} />
        <SmallButton icon="trash-outline" label={t.trash.purge} onPress={purge} danger />
      </View>
    </View>
  );
}

function SmallButton({ icon, label, onPress, danger }: { icon: 'arrow-undo-outline' | 'trash-outline'; label: string; onPress: () => void; danger?: boolean }) {
  const { colors, typography, radius, spacing } = useTheme();
  const fg = danger ? colors.danger : colors.text;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({
        flex: 1,
        minHeight: 44,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: pressed ? colors.surfaceMuted : colors.bg,
      })}
    >
      <Icon name={icon} size={18} color={fg} />
      <Text style={[typography.callout, { color: fg, fontWeight: '600' }]}>{label}</Text>
    </Pressable>
  );
}
