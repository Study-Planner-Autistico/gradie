import { PlaceholderScreen } from '../../components/ui';
import { t } from '../../i18n';
import { registerTabScreen, TabSwipe } from '../../components/TabSwipe';

function CommunityScreen() {
  return <PlaceholderScreen title={t.tabs.community} icon="people-outline" />;
}

// Scorrendo a destra/sinistra si cambia scheda (dec. 140).
registerTabScreen('community', CommunityScreen);
export default function Community() {
  return (
    <TabSwipe name="community">
      <CommunityScreen />
    </TabSwipe>
  );
}
