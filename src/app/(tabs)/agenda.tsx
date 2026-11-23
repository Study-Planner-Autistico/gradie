import { useState } from 'react';
import { Text, View } from 'react-native';
import { addDays, EventRow, isoWeek, WeekStrip } from '../../components/agenda';
import { ListGroup, ListRow } from '../../components/list';
import { Card, Chip, EmptyState, Screen, ScreenHeader, IconButton } from '../../components/ui';
import { demoAgenda } from '../../data/demo';
import { locale, t } from '../../i18n';
import { useEnvironment } from '../../state/environment';
import { useTheme } from '../../theme';
import { registerTabScreen, TabSwipe } from '../../components/TabSwipe';

function dayOffset(d: Date) {
  const a = new Date();
  a.setHours(0, 0, 0, 0);
  const b = new Date(d);
  b.setHours(0, 0, 0, 0);
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

/** Agenda (modulo 02 §5 AG-01). Viste giorno/settimana/mese rinviate (dec. 95). */
function AgendaScreen() {
  const { colors, typography, spacing } = useTheme();
  const { active } = useEnvironment();
  const [selected, setSelected] = useState(new Date());
  const items = demoAgenda.filter((i) => i.dayOffset === dayOffset(selected));
  const month = selected.toLocaleDateString(locale, { month: 'long', year: 'numeric' });

  return (
    <Screen>
      <ScreenHeader
        title={t.agenda.title}
        subtitle={active.name}
        right={<IconButton icon="add" label={t.agenda.add} />}
      />

      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <Text style={[typography.title2, { color: colors.text, textTransform: 'capitalize' }]}>{month}</Text>
          <Chip variant="muted" label={t.agenda.week(isoWeek(selected))} />
        </View>
        <WeekStrip
          selected={selected}
          onSelect={setSelected}
          hasItems={(d) => demoAgenda.some((i) => i.dayOffset === dayOffset(d))}
        />
      </Card>

      <Card>
        <Text style={[typography.headline, { color: colors.text, textTransform: 'capitalize' }]}>
          {selected.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })}
        </Text>
        {items.length === 0 ? (
          <EmptyState icon="sunny-outline" message={t.agenda.empty} />
        ) : (
          <View style={{ gap: spacing.sm }}>
            {items.map((item) => (
              <EventRow key={item.id} item={item} />
            ))}
          </View>
        )}
        <Text style={[typography.caption, { color: colors.textTertiary }]}>{t.demo}</Text>
      </Card>

      <ListGroup>
        <ListRow
          icon="calendar-number-outline"
          label={t.agenda.yearCalendar}
          detail={t.agenda.yearCalendarDetail}
          onPress={() => setSelected(addDays(new Date(), 4))}
        />
      </ListGroup>
    </Screen>
  );
}

// Scorrendo a destra/sinistra si cambia scheda (dec. 140).
registerTabScreen('agenda', AgendaScreen);
export default function Agenda() {
  return (
    <TabSwipe name="agenda">
      <AgendaScreen />
    </TabSwipe>
  );
}
