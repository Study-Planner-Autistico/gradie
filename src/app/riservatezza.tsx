import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { confirm, notify } from '../components/dialogs';
import { warn } from '../components/haptics';
import { leaveAccount, Row, Section, SheetPage } from '../components/settings';
import { demoUser } from '../data/demo';
import { t } from '../i18n';
import { getProfile, myTag, updateProfile, useProfile } from '../state/profile';
import { getSettings } from '../state/settings';

/** I dati dell'utente in chiaro: profilo, avatar e impostazioni (niente dispositivi né segreti). */
function exportJson() {
  const { devices: _devices, ...settings } = getSettings();
  return JSON.stringify({ exportedAt: new Date().toISOString(), email: demoUser.email, tag: myTag, profile: getProfile(), settings }, null, 2);
}

async function exportData() {
  const name = `${t.appName.toLowerCase()}-${myTag.slice(1)}.json`;
  if (Platform.OS === 'web') {
    // Sul web niente foglio Condividi: si scarica il file.
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([exportJson()], { type: 'application/json' }));
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
    return;
  }
  const file = new File(Paths.cache, name);
  file.create({ overwrite: true });
  file.write(exportJson());
  await Sharing.shareAsync(file.uri, { mimeType: 'application/json', UTI: 'public.json', dialogTitle: t.account.export });
}

/** Riservatezza e dati (dec. 15, 138): profilo privato, esportazione ed eliminazione dell'account. */
export default function Riservatezza() {
  const { isPrivate } = useProfile();
  return (
    <SheetPage title={t.account.privacy}>
      <Section first>
        <Row icon="lock" label={t.account.private} detail={t.account.privateDetail} toggle={{ value: isPrivate, onChange: (v) => updateProfile({ isPrivate: v }) }} />
        <Row
          icon="download"
          label={t.account.export}
          detail={t.account.exportDetail}
          onPress={() =>
            exportData().catch(() => {
              warn();
              notify(t.account.exportFailed);
            })
          }
        />
      </Section>

      <Section>
        <Row
          icon="trash"
          label={t.account.delete}
          detail={t.account.deleteDetail}
          danger
          onPress={() =>
            // Due conferme: l'eliminazione non si può annullare.
            confirm(t.account.deleteConfirm, t.account.deleteAction, () =>
              setTimeout(() => confirm(t.account.deleteFinal, t.account.deleteAction, leaveAccount, t.account.deleteFinalDetail), 300), t.account.deleteConfirmDetail)
          }
        />
      </Section>
    </SheetPage>
  );
}
