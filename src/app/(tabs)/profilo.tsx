import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '../../components/avatar/Avatar';
import { AvatarPlaceholder } from '../../components/avatar/Placeholder';
import { tap } from '../../components/haptics';
import { Mascot } from '../../components/Mascot';
import { Coin } from '../../components/Coin';
import { useCoins } from '../../state/coins';
import { Flag } from '../../components/Flag';
import { Button, Chip } from '../../components/ui';
import { demoCountries, demoMe } from '../../data/demo';
import { formatAvg, useGradeBook } from '../../state/grades';
import { friendsOf, useFriends } from '../../state/friends';
import { locale, t } from '../../i18n';
import { missingSteps, myTag, useProfile, type InterestId, type ProfileState } from '../../state/profile';
import { avatarPalette, useTheme } from '../../theme';
import { registerTabScreen, TabSwipe } from '../../components/TabSwipe';
import { useTabScroll } from '../../state/tabScroll';
import { Icon } from '../../components/icons';

const countryName = (code: string) => {
  const c = demoCountries.find((x) => x.code === code);
  return c ? (locale.startsWith('it') ? c.it : c.en) : code;
};

/**
 * Profilo (dec. 133), ispirato a Duolingo: in alto nome e impostazioni su un fondo colorato con l'avatar
 * (sagoma da completare finché non si crea l'avatar); sotto iscrizione e codice, bandiera modificabile, seguiti e follower,
 * card "Completa il profilo", panoramica (media voti solo per te, bio, interessi) e amici.
 * Niente streak, punti o classifiche (dec. 57).
 */
function ProfiloScreen() {
  const { colors, layout, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const profile = useProfile();
  const steps = missingSteps(profile);
  const tabScroll = useTabScroll();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ paddingBottom: layout.tabBarClearance }}
      onScroll={(e) => tabScroll.record(e.nativeEvent.contentOffset.y)}
      scrollEventThrottle={16}
      contentOffset={tabScroll.contentOffset}
      ref={tabScroll.ref}
    >
      <Header topInset={insets.top} avatar={profile.avatar} name={`${profile.firstName} ${profile.lastName}`} />

      <View style={{ paddingHorizontal: spacing.xxl, paddingTop: spacing.xxxl, gap: spacing.xxxl }}>
        <MetaAndStats country={profile.country} isPrivate={profile.isPrivate} />
        {steps > 0 && <CompleteCard steps={steps} />}
        <Overview bio={profile.bio} interests={profile.interests as InterestId[]} />
        <Friends />
      </View>
    </ScrollView>
  );
}

/**
 * Fascia colorata con nome, ingranaggio e avatar (come Duolingo). Con l'avatar prende il suo colore e il testo
 * resta scuro su quei pastello; senza, la sagoma tratteggiata apre l'invito a crearlo.
 */
function Header({ topInset, avatar, name }: { topInset: number; avatar: ProfileState['avatar']; name: string }) {
  const { colors, typography, spacing, layout } = useTheme();
  const bg = avatar ? avatar.bg : colors.selected;
  const fg = avatar ? avatarPalette.ink : colors.text;
  const coins = useCoins();
  return (
    <View style={{ backgroundColor: bg, paddingTop: topInset + spacing.md }}>
      {/* Il colore continua sopra: tirando giù la pagina (rimbalzo di iOS) non compare lo sfondo grigio. */}
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: '100%', height: 1000, backgroundColor: bg }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xxl }}>
        <Text accessibilityRole="header" style={[typography.title1, { color: fg, flex: 1 }]} numberOfLines={1}>
          {name}
        </Text>
        {/* Monete (dec. 193): piccola moneta col saldo, accanto alle impostazioni. */}
        <View
          accessible
          accessibilityLabel={t.profile.coins(coins)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, height: 34, paddingLeft: 6, paddingRight: 12, marginRight: 4, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.7)' }}
        >
          <Coin size={22} />
          <Text style={[typography.headline, { color: fg, fontVariant: ['tabular-nums'] }]}>{coins}</Text>
        </View>
        <Pressable
          onPress={() => {
            tap();
            router.push('/impostazioni');
          }}
          accessibilityRole="button"
          accessibilityLabel={t.profile.settingsTitle}
          style={({ pressed }) => ({ width: layout.iconButton, height: layout.iconButton, alignItems: 'center', justifyContent: 'center', marginRight: -10, opacity: pressed ? 0.6 : 1 })}
        >
          <Icon name="settings" size={26} color={fg} />
        </Pressable>
      </View>

      <Pressable
        onPress={() => {
          tap();
          router.push(avatar ? '/avatar' : '/avatar-intro');
        }}
        accessibilityRole="button"
        accessibilityLabel={avatar ? t.profile.editAvatar : t.profile.createAvatar}
        style={({ pressed }) => ({ alignItems: 'center', marginTop: avatar ? spacing.md : spacing.xxxl, overflow: 'hidden', opacity: pressed ? 0.85 : 1 })}
      >
        {avatar ? <Avatar config={avatar} size={200} shape="square" background={false} /> : <AvatarPlaceholder size={160} />}
      </Pressable>
    </View>
  );
}

/** "Su Gradie dal 2026 · #1234", poi bandiera modificabile, seguiti e follower e il QR del profilo. */
function MetaAndStats({ country, isPrivate }: { country: string; isPrivate: boolean }) {
  const { colors, typography, spacing, radius, layout } = useTheme();
  return (
    <View style={{ gap: spacing.xl }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm }}>
        <Text style={[typography.label, { color: colors.textTertiary }]}>
          {t.profile.joined(demoMe.joinedYear)} · {myTag}
        </Text>
        {isPrivate && <Chip variant="muted" icon="lock-closed" label={t.profile.private} />}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
        <Pressable
          onPress={() => {
            tap();
            router.push('/bandiera');
          }}
          accessibilityRole="button"
          accessibilityLabel={`${t.profile.country}: ${countryName(country)}`}
          style={({ pressed }) => ({ flex: 1, gap: spacing.xxs, opacity: pressed ? 0.6 : 1 })}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, height: 28 }}>
            <Flag code={country} width={39} />
            <Icon name="chevron-down" size={14} color={colors.textTertiary} />
          </View>
          <Text style={[typography.body, { color: colors.textTertiary }]} numberOfLines={1}>
            {countryName(country)}
          </Text>
        </Pressable>
        <Stat value={demoMe.following} label={t.profile.followingLabel} />
        <Stat value={demoMe.followers} label={t.profile.followersLabel} />
        <Pressable
          onPress={() => {
            tap();
            router.push('/qr');
          }}
          accessibilityRole="button"
          accessibilityLabel={t.profile.qr}
          style={({ pressed }) => ({
            width: layout.button,
            height: layout.button,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.5 : 1,
          })}
        >
          {/* Solo l'icona, senza riquadro (dec. 174). */}
          <Icon name="qr-code-outline" size={28} color={colors.text} />
        </Pressable>
      </View>
    </View>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  const { colors, typography, spacing } = useTheme();
  return (
    <View style={{ flex: 1, gap: spacing.xxs }}>
      <Text style={[typography.stat, { color: colors.text, height: 28 }]}>{value}</Text>
      <Text style={[typography.body, { color: colors.textTertiary }]}>{label}</Text>
    </View>
  );
}

/** Card "Completa il profilo!" con la mascotte; sparisce quando non manca più niente. */
function CompleteCard({ steps }: { steps: number }) {
  const { colors, typography, spacing, radius } = useTheme();
  return (
    <View style={{ backgroundColor: colors.selected, borderRadius: radius.xl, padding: spacing.xl, gap: spacing.xl, overflow: 'hidden' }}>
      <View style={{ position: 'absolute', right: -4, top: 10 }}>
        <Mascot size={100} mood="happy" />
      </View>
      {/* Alta quanto la mascotte: il pulsante parte sotto il logo e non lo copre (dec. 203, si vedeva su iPad). */}
      <View style={{ marginRight: 96, gap: spacing.sm, minHeight: 80 }}>
        <Text style={[typography.title2, { color: colors.text }]}>{t.profile.complete}</Text>
        <Text style={[typography.label, { color: colors.textTertiary }]}>{t.profile.stepsLeft(steps)}</Text>
      </View>
      <Button title={t.profile.completeCta} appearance="primary" fullWidth onPress={() => router.push('/modifica-profilo')} />
    </View>
  );
}

/** Panoramica: media voti (solo per te, dec. 36-37), bio e pochi interessi. */
function Overview({ bio, interests }: { bio: string; interests: InterestId[] }) {
  const { colors, typography, spacing } = useTheme();
  const edit = () => router.push('/modifica-profilo');
  const grades = useGradeBook();
  return (
    <View style={{ gap: spacing.lg }}>
      <Text style={[typography.label, { color: colors.textTertiary }]}>{t.profile.overview}</Text>

      {/* Un tocco apre il Registro voti, lo stesso del menu laterale (dec. 195). */}
      <Pressable
        onPress={() => {
          tap();
          router.push('/registro-voti');
        }}
        accessibilityRole="button"
        accessibilityLabel={`${formatAvg(grades.average)} ${t.profile.average}, ${t.menu.grades}`}
        style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: spacing.md, opacity: pressed ? 0.6 : 1 })}
      >
        <Icon name="chart" size={28} color={colors.accent} />
        <Text style={[typography.title2, { color: colors.text }]}>
          {formatAvg(grades.average)} <Text style={[typography.body, { color: colors.textSecondary }]}>{t.profile.average}</Text>
        </Text>
        <View style={{ flex: 1 }} />
        <Chip variant="muted" icon="lock-closed" label={t.profile.onlyYou} />
        <Icon name="chevron" size={18} color={colors.textTertiary} />
      </Pressable>

      <Pressable onPress={edit} accessibilityRole="button" accessibilityLabel={t.profile.bio} style={({ pressed }) => ({ gap: spacing.xs, opacity: pressed ? 0.6 : 1 })}>
        <Text style={[typography.headline, { color: colors.text }]}>{t.profile.bio}</Text>
        <Text style={[typography.body, { color: bio ? colors.text : colors.link }]}>{bio || t.profile.noBio}</Text>
      </Pressable>

      <Pressable onPress={edit} accessibilityRole="button" accessibilityLabel={t.profile.interests} style={({ pressed }) => ({ gap: spacing.sm, opacity: pressed ? 0.6 : 1 })}>
        <Text style={[typography.headline, { color: colors.text }]}>{t.profile.interests}</Text>
        {interests.length === 0 ? (
          <Text style={[typography.body, { color: colors.link }]}>{t.profile.noInterests}</Text>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {interests.map((id) => (
              <Chip key={id} variant="discovery" label={t.interestNames[id]} />
            ))}
          </View>
        )}
      </Pressable>
    </View>
  );
}

/**
 * Amici: avatar (per ora iniziali) con il nome; toccandone uno si apre il suo profilo (dec. 183).
 * Il + tratteggiato apre "Aggiungi un amico" (QR o codice); "Vedi tutti" e "Richieste d'amicizia" aprono l'elenco (dec. 187).
 */
function Friends() {
  const { colors, typography, spacing, radius } = useTheme();
  const state = useFriends();
  const shown = friendsOf(state);
  const pending = state.incoming.length;
  const H = t.profile.hub;
  return (
    <View style={{ gap: spacing.lg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={[typography.label, { flex: 1, color: colors.textTertiary }]}>{t.profile.friends}</Text>
        <Pressable
          onPress={() => {
            tap();
            router.push('/amici');
          }}
          accessibilityRole="button"
          hitSlop={8}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <Text style={[typography.callout, { color: colors.link, fontWeight: '600' }]}>{H.seeAll}</Text>
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -spacing.xxl }} contentContainerStyle={{ paddingHorizontal: spacing.xxl, gap: spacing.xl }}>
        {shown.map((f) => (
          <Pressable
            key={f.id}
            onPress={() => {
              tap();
              router.push({ pathname: '/amico/[id]', params: { id: f.id } });
            }}
            accessibilityRole="button"
            accessibilityLabel={t.profile.openFriend(f.name)}
            style={({ pressed }) => ({ alignItems: 'center', gap: spacing.sm, width: 72, opacity: pressed ? 0.6 : 1 })}
          >
            <View style={{ width: 68, height: 68, borderRadius: 34, backgroundColor: f.color, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={[typography.title2, { color: '#FFFFFF' }]}>{f.initials}</Text>
            </View>
            <Text style={[typography.callout, { color: colors.text }]} numberOfLines={1}>
              {f.name}
            </Text>
          </Pressable>
        ))}
        <Pressable
          onPress={() => {
            tap();
            router.push('/aggiungi-amico');
          }}
          accessibilityRole="button"
          accessibilityLabel={H.add}
          style={({ pressed }) => ({ alignItems: 'center', gap: spacing.sm, width: 72, opacity: pressed ? 0.6 : 1 })}
        >
          <View style={{ width: 68, height: 68, borderRadius: 34, borderWidth: 2, borderStyle: 'dashed', borderColor: colors.borderBold, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="add" size={30} color={colors.textSecondary} />
          </View>
        </Pressable>
      </ScrollView>
      <Pressable
        onPress={() => {
          tap();
          router.push({ pathname: '/amici', params: { tab: 'requests' } });
        }}
        accessibilityRole="button"
        accessibilityLabel={`${H.requests}, ${H.requestsCount(pending)}`}
        style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 56, paddingHorizontal: spacing.lg, borderRadius: radius.xl, backgroundColor: pressed ? colors.surfaceMuted : colors.surface })}
      >
        <Icon name="people-outline" size={22} color={colors.text} />
        <Text style={[typography.headline, { flex: 1, color: colors.text }]}>{H.requests}</Text>
        {pending > 0 ? (
          <View style={{ minWidth: 24, height: 24, paddingHorizontal: 7, borderRadius: 12, backgroundColor: colors.dangerIcon, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={[typography.caption, { color: '#FFFFFF', fontWeight: '700' }]}>{pending}</Text>
          </View>
        ) : (
          <Text style={[typography.callout, { color: colors.textTertiary }]}>{H.requestsCount(0)}</Text>
        )}
        <Icon name="chevron-forward" size={18} color={colors.textTertiary} />
      </Pressable>
    </View>
  );
}

// Scorrendo a destra/sinistra si cambia scheda (dec. 140).
registerTabScreen('profilo', ProfiloScreen);
export default function Profilo() {
  return (
    <TabSwipe name="profilo">
      <ProfiloScreen />
    </TabSwipe>
  );
}
