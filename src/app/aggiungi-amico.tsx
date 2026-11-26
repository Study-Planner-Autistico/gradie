import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Linking, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [noCamera, setNoCamera] = useState(false);

  // "Inquadra QR" apre subito la fotocamera a tutto schermo (dec. 188): prima chiede il permesso, se serve.
  const openScanner = async () => {
    setMode('scan');
    setResult(null);
    setNoCamera(false);
    try {
      const p = permission?.granted ? permission : await requestPermission();
      if (p.granted) setScanning(true);
    } catch {
      setNoCamera(true);
    }
  };

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
      <Text accessibilityRole="header" style={[typography.title1, { color: colors.accent, textAlign: 'center' }]}>
        {T.add}
      </Text>
      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <Choice icon="qr-code-scan" label={T.scan} selected={mode === 'scan'} onPress={openScanner} />
        <Choice icon="keyboard-outline" label={T.enterCode} selected={mode === 'code'} onPress={() => (setMode('code'), setResult(null))} />
      </View>

      {mode === 'scan' && !scanning && (
        <ScanStatus
          denied={!!permission && !permission.granted}
          canAskAgain={permission?.canAskAgain ?? true}
          noCamera={noCamera}
          scanned={!!result}
          onOpen={openScanner}
        />
      )}
      <Scanner
        visible={scanning}
        onClose={() => setScanning(false)}
        onUnavailable={() => {
          setScanning(false);
          setNoCamera(true);
        }}
        onScanned={(data) => {
          setScanning(false);
          send(data);
        }}
      />
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

/** Sotto le due scelte, quando la fotocamera è chiusa: riaprirla, oppure perché non si apre. */
function ScanStatus({ denied, canAskAgain, noCamera, scanned, onOpen }: { denied: boolean; canAskAgain: boolean; noCamera: boolean; scanned: boolean; onOpen: () => void }) {
  const { spacing } = useTheme();
  const T = t.profile.hub;
  if (noCamera) return <Note text={T.cameraUnavailable} />;
  if (denied)
    return (
      <View style={{ gap: spacing.md }}>
        <Note text={canAskAgain ? T.cameraNeeded : T.cameraDenied} />
        {canAskAgain || Platform.OS === 'web' ? (
          <Button title={T.allowCamera} appearance="primary" iconBefore="camera" onPress={onOpen} />
        ) : (
          <Button title={T.openSettings} appearance="primary" iconBefore="settings" onPress={() => Linking.openSettings()} />
        )}
      </View>
    );
  return <Button title={scanned ? T.scanAgain : T.scan} appearance={scanned ? 'default' : 'primary'} iconBefore="qr-code-scan" onPress={onOpen} />;
}

/**
 * Fotocamera a tutto schermo che legge il QR del profilo (gradie://u/1234), come l'app Fotocamera (dec. 188):
 * un riquadro al centro dove mettere il codice; al primo QR letto si chiude e parte la richiesta.
 */
function Scanner({ visible, onClose, onScanned, onUnavailable }: { visible: boolean; onClose: () => void; onScanned: (data: string) => void; onUnavailable: () => void }) {
  const { typography, spacing, layout } = useTheme();
  const T = t.profile.hub;
  const insets = useSafeAreaInsets();
  const busy = useRef(false);
  const [torch, setTorch] = useState(false);
  const box = 250;
  const veil = 'rgba(0,0,0,0.55)';
  const round = (pressed: boolean) => ({ width: layout.iconButton + 4, height: layout.iconButton + 4, borderRadius: 30, backgroundColor: pressed ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.2)', alignItems: 'center' as const, justifyContent: 'center' as const });
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent
      onShow={() => {
        busy.current = false;
        setTorch(false);
      }}
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        {visible && (
          <CameraView
            style={{ position: 'absolute', inset: 0 }}
            facing="back"
            enableTorch={torch}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onMountError={onUnavailable}
            onBarcodeScanned={({ data }) => {
              if (busy.current) return;
              busy.current = true;
              success();
              onScanned(data);
            }}
          />
        )}
        {/* Velo scuro intorno al riquadro, con gli angoli bianchi. */}
        <View pointerEvents="none" style={{ position: 'absolute', inset: 0 }}>
          <View style={{ flex: 1, backgroundColor: veil }} />
          <View style={{ flexDirection: 'row', height: box }}>
            <View style={{ flex: 1, backgroundColor: veil }} />
            <View style={{ width: box, height: box }}>
              {(['tl', 'tr', 'bl', 'br'] as const).map((c) => (
                <View
                  key={c}
                  style={{
                    position: 'absolute',
                    width: 44,
                    height: 44,
                    borderColor: '#FFFFFF',
                    borderTopWidth: c[0] === 't' ? 5 : 0,
                    borderBottomWidth: c[0] === 'b' ? 5 : 0,
                    borderLeftWidth: c[1] === 'l' ? 5 : 0,
                    borderRightWidth: c[1] === 'r' ? 5 : 0,
                    borderTopLeftRadius: c === 'tl' ? 22 : 0,
                    borderTopRightRadius: c === 'tr' ? 22 : 0,
                    borderBottomLeftRadius: c === 'bl' ? 22 : 0,
                    borderBottomRightRadius: c === 'br' ? 22 : 0,
                    top: c[0] === 't' ? 0 : undefined,
                    bottom: c[0] === 'b' ? 0 : undefined,
                    left: c[1] === 'l' ? 0 : undefined,
                    right: c[1] === 'r' ? 0 : undefined,
                  }}
                />
              ))}
            </View>
            <View style={{ flex: 1, backgroundColor: veil }} />
          </View>
          <View style={{ flex: 1, backgroundColor: veil, alignItems: 'center', paddingTop: spacing.xxl, paddingHorizontal: spacing.xxl }}>
            <Text style={[typography.headline, { color: '#FFFFFF', textAlign: 'center' }]}>{T.scanHint}</Text>
          </View>
        </View>
        <View style={{ position: 'absolute', top: insets.top + spacing.md, left: spacing.lg, right: spacing.lg, flexDirection: 'row', alignItems: 'center' }}>
          <Pressable
            onPress={() => {
              tap();
              onClose();
            }}
            accessibilityRole="button"
            accessibilityLabel={T.closeScanner}
            style={({ pressed }) => round(pressed)}
          >
            <Icon name="close" size={26} color="#FFFFFF" />
          </Pressable>
          <Text style={[typography.headline, { flex: 1, color: '#FFFFFF', textAlign: 'center' }]}>{T.scan}</Text>
          {Platform.OS !== 'web' ? (
            <Pressable
              onPress={() => {
                tap();
                setTorch((v) => !v);
              }}
              accessibilityRole="switch"
              accessibilityState={{ checked: torch }}
              accessibilityLabel={T.torch}
              style={({ pressed }) => ({ ...round(pressed), backgroundColor: torch ? '#FFFFFF' : round(pressed).backgroundColor })}
            >
              <Icon name="flashlight" size={24} color={torch ? '#000000' : '#FFFFFF'} />
            </Pressable>
          ) : (
            <View style={{ width: layout.iconButton + 4 }} />
          )}
        </View>
      </View>
    </Modal>
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
