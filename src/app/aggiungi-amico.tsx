import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { FriendAvatar } from '../components/FriendAvatar';
import { success, tap, warn } from '../components/haptics';
import { Icon, type IconName } from '../components/icons';
import { Button } from '../components/ui';
import { t } from '../i18n';
import { sendRequest, type RequestResult } from '../state/friends';
import { myTag } from '../state/profile';
import { useTheme } from '../theme';

type Mode = 'scan' | 'code';

/**
 * Aggiungi un amico (dec. 187): si apre dal + in Profilo > Amici. Due modi: inquadrare il QR del suo profilo
 * o scrivere il suo codice (le 4 cifre dopo #). In tutti e due i casi parte la richiesta d'amicizia.
 */
export default function AggiungiAmico() {
  const { colors, typography, spacing } = useTheme();
  const T = t.profile.hub;
  const [mode, setMode] = useState<Mode | null>(null);
  const [result, setResult] = useState<RequestResult | null>(null);

  const send = (raw: string) => {
    const r = sendRequest(raw);
    if (r.kind === 'sent' || r.kind === 'accepted') success();
    else warn();
    setResult(r);
  };

  return (
    <ScrollView
      style={{ backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.bg }}
      contentContainerStyle={{ padding: spacing.xxl, paddingTop: spacing.xxxl, gap: spacing.xl, paddingBottom: spacing.giant }}
      keyboardShouldPersistTaps="handled"
    >
      <Text accessibilityRole="header" style={[typography.title1, { color: colors.text, textAlign: 'center' }]}>
        {T.add}
      </Text>
      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <Choice icon="qr-code-scan" label={T.scan} selected={mode === 'scan'} onPress={() => (setMode('scan'), setResult(null))} />
        <Choice icon="keyboard-outline" label={T.enterCode} selected={mode === 'code'} onPress={() => (setMode('code'), setResult(null))} />
      </View>

      {mode === 'scan' && <Scanner onScanned={send} result={result} onAgain={() => setResult(null)} />}
      {mode === 'code' && <CodeEntry onSend={send} onEdit={() => setResult(null)} />}
      {result && <ResultCard result={result} />}

      {/* Il proprio codice, da dare a chi vuole aggiungerti. */}
      <Pressable
        onPress={() => {
          tap();
          router.push('/qr');
        }}
        accessibilityRole="button"
        style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, minHeight: 44, opacity: pressed ? 0.6 : 1 })}
      >
        <Icon name="qr-code-outline" size={18} color={colors.link} />
        <Text style={[typography.callout, { color: colors.textSecondary }]}>{T.yourCode(myTag)}</Text>
        <Text style={[typography.callout, { color: colors.link, fontWeight: '600' }]}>{T.showMyQr}</Text>
      </Pressable>
    </ScrollView>
  );
}

function Choice({ icon, label, selected, onPress }: { icon: IconName; label: string; selected: boolean; onPress: () => void }) {
  const { colors, typography, spacing, radius } = useTheme();
  return (
    <Pressable
      onPress={() => {
        tap();
        onPress();
      }}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={({ pressed }) => ({
        flex: 1,
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: spacing.xl,
        borderRadius: radius.xl,
        borderWidth: 2,
        borderColor: selected ? colors.accent : 'transparent',
        backgroundColor: selected ? colors.selected : colors.surface,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: selected ? colors.accent : colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={28} color={selected ? colors.onAccent : colors.text} />
      </View>
      <Text style={[typography.headline, { color: selected ? colors.selectedText : colors.text }]}>{label}</Text>
    </Pressable>
  );
}

/** Fotocamera che legge il QR del profilo (gradie://u/1234); si ferma al primo codice letto. */
function Scanner({ onScanned, result, onAgain }: { onScanned: (data: string) => void; result: RequestResult | null; onAgain: () => void }) {
  const { colors, typography, spacing, radius } = useTheme();
  const T = t.profile.hub;
  const [permission, requestPermission] = useCameraPermissions();
  const busy = useRef(false);
  if (Platform.OS === 'web') return <Note text={T.cameraWeb} />;
  if (!permission) return null;
  if (!permission.granted)
    return (
      <View style={{ gap: spacing.md }}>
        <Note text={T.cameraNeeded} />
        <Button title={T.allowCamera} appearance="primary" iconBefore="camera" onPress={requestPermission} />
      </View>
    );
  return (
    <View style={{ gap: spacing.md, alignItems: 'center' }}>
      <View style={{ width: 260, height: 260, borderRadius: radius.xxl, overflow: 'hidden', backgroundColor: '#000' }}>
        {!result && (
          <CameraView
            style={{ flex: 1 }}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={({ data }) => {
              if (busy.current) return;
              busy.current = true;
              onScanned(data);
            }}
          />
        )}
      </View>
      {result ? (
        <Button
          title={T.scanAgain}
          iconBefore="qr-code-scan"
          onPress={() => {
            busy.current = false;
            onAgain();
          }}
        />
      ) : (
        <Text style={[typography.callout, { color: colors.textSecondary, textAlign: 'center' }]}>{T.scanHint}</Text>
      )}
    </View>
  );
}

/** Il codice dell'amico: 4 cifre, con il # già scritto. */
function CodeEntry({ onSend, onEdit }: { onSend: (code: string) => void; onEdit: () => void }) {
  const { colors, typography, spacing, radius } = useTheme();
  const T = t.profile.hub;
  const [code, setCode] = useState('');
  const ready = code.length === 4;
  return (
    <View style={{ gap: spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, height: 72, borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderInput }}>
        <Text style={[typography.display, { color: colors.textTertiary }]}>#</Text>
        <TextInput
          value={code}
          onChangeText={(v) => {
            setCode(v.replace(/\D/g, '').slice(0, 4));
            onEdit();
          }}
          autoFocus
          keyboardType="number-pad"
          maxLength={4}
          placeholder="0000"
          placeholderTextColor={colors.textDisabled}
          accessibilityLabel={T.codeLabel}
          returnKeyType="send"
          onSubmitEditing={() => ready && onSend(code)}
          style={[typography.display, { color: colors.text, letterSpacing: 8, minWidth: 140, padding: 0 }]}
        />
      </View>
      <Text style={[typography.caption, { color: colors.textTertiary, textAlign: 'center' }]}>{T.codeHint}</Text>
      <Button title={T.send} appearance="primary" iconBefore="person-add-outline" disabled={!ready} onPress={() => onSend(code)} />
    </View>
  );
}

function ResultCard({ result }: { result: RequestResult }) {
  const { colors, typography, spacing, radius } = useTheme();
  const R = t.profile.hub.result;
  const ok = result.kind === 'sent' || result.kind === 'accepted';
  const message = 'person' in result ? R[result.kind](result.person.name) : R[result.kind];
  return (
    <View
      accessibilityLiveRegion="polite"
      style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, borderRadius: radius.xl, backgroundColor: ok ? colors.successBg : colors.warningBg }}
    >
      {'person' in result ? (
        <FriendAvatar person={result.person} size={44} />
      ) : (
        <Icon name="alert-circle" size={28} color={colors.warningIcon} />
      )}
      <Text style={[typography.headline, { flex: 1, color: ok ? colors.success : colors.warning }]}>{message}</Text>
      {ok && <Icon name="checkmark-circle" size={24} color={colors.successIcon} />}
    </View>
  );
}

function Note({ text }: { text: string }) {
  const { colors, typography, spacing, radius } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: spacing.md, padding: spacing.lg, borderRadius: radius.xl, backgroundColor: colors.informationBg }}>
      <Icon name="information-circle" size={22} color={colors.information} />
      <Text style={[typography.callout, { flex: 1, color: colors.information }]}>{text}</Text>
    </View>
  );
}
