import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { success, tap, warn } from '../components/haptics';
import { Mascot } from '../components/Mascot';
import {
  ChoiceSheet,
  CodeInput,
  Confetti,
  FadeUp,
  FakeQr,
  OptionCard,
  OrbitArt,
  ProgressBar,
  Segmented,
  SelectPills,
  StepTransition,
} from '../components/onboarding';
import { Button, Card, Checkbox, Chip, IconButton, SectionMessage, TextField, type IconName, type TextInputRef } from '../components/ui';
import {
  demoDegreeTypes,
  demoInstitutions,
  demoRecoveryCodes,
  demoSplits,
  demoSubjects,
  demoTracks,
} from '../data/demo';
import { t } from '../i18n';
import { setSubjects } from '../state/subjects';
import { useTheme } from '../theme';
import { Icon } from '../components/icons';

/**
 * Onboarding (modulo 01 §3 J1-J3, schermate ON-01…ON-20).
 * Un'unica route con una macchina a passi: la barra di avanzamento resta ferma e i passi scorrono.
 * Solo dati dimostrativi: nessun account viene creato davvero (dec. 53).
 */

type Step =
  | 'welcome'
  | 'method'
  | 'birth'
  | 'blocked'
  | 'creds'
  | 'verify'
  | 'name'
  | 'role'
  | 'totp'
  | 'path'
  | 'inst'
  | 'notFound'
  | 'details'
  | 'period'
  | 'subjects'
  | 'import'
  | 'secure'
  | 'summary'
  | 'done'
  | 'login'
  | 'login2fa';

type Answers = {
  method?: 'apple' | 'google' | 'email';
  day: string;
  month: string;
  year: string;
  email: string;
  password: string;
  consent: boolean;
  firstName: string;
  lastName: string;
  role?: 'student' | 'teacher';
  codesSaved: boolean;
  path?: 'superiori' | 'universita';
  institutionId?: string;
  track?: string;
  classYear?: string;
  section: string;
  course: string;
  degree?: string;
  split?: string;
  subjects: string[];
  secured: boolean;
};

const initial: Answers = {
  day: '',
  month: '',
  year: '',
  email: '',
  password: '',
  consent: false,
  firstName: '',
  lastName: '',
  codesSaved: false,
  section: '',
  course: '',
  subjects: [],
  secured: false,
};

/** Ordine dei passi in base alle risposte (J1 email, J2 Apple/Google, J3 docente). */
function flowOf(a: Answers): Step[] {
  const teacher = a.role === 'teacher';
  return [
    'method',
    'birth',
    ...(a.method === 'email' || !a.method ? (['creds', 'verify'] as Step[]) : []),
    'name',
    'role',
    ...(teacher ? (['totp'] as Step[]) : []),
    'path',
    'inst',
    ...(teacher ? [] : (['details', 'period'] as Step[])),
    'subjects',
    'import',
    ...(teacher ? [] : (['secure'] as Step[])),
    'summary',
  ];
}

function ageFrom(d: number, m: number, y: number) {
  const now = new Date();
  let age = now.getFullYear() - y;
  if (now.getMonth() + 1 < m || (now.getMonth() + 1 === m && now.getDate() < d)) age--;
  return age;
}

function schoolYear() {
  const n = new Date();
  const y = n.getMonth() >= 8 ? n.getFullYear() : n.getFullYear() - 1;
  return `${y}/${y + 1}`;
}

export default function Onboarding() {
  const { colors } = useTheme();
  const [a, setA] = useState<Answers>(initial);
  const [step, setStep] = useState<Step>('welcome');
  const [history, setHistory] = useState<Step[]>([]);
  const [dir, setDir] = useState<1 | -1>(1);
  const [returnToSummary, setReturnToSummary] = useState(false);
  const set = (p: Partial<Answers>) => setA((x) => ({ ...x, ...p }));

  const flow = useMemo(() => flowOf(a), [a]);
  const idx = flow.indexOf(step);
  const progress = idx < 0 ? null : (idx + 1) / flow.length;

  const goTo = (s: Step, d: 1 | -1 = 1) => {
    setDir(d);
    if (d === 1) setHistory((h) => [...h, step]);
    setStep(s);
  };
  /** Avanti nel flusso; dopo una modifica dal riepilogo si torna al riepilogo. */
  const next = (patch?: Partial<Answers>) => {
    const merged = patch ? { ...a, ...patch } : a;
    if (patch) setA(merged);
    const f = flowOf(merged);
    // Se cambiano ruolo o percorso, i passi successivi cambiano: si ripercorrono (le risposte restano).
    const branchChanged = !!patch && ((!!patch.role && patch.role !== a.role) || (!!patch.path && patch.path !== a.path));
    if (returnToSummary && !branchChanged) {
      setReturnToSummary(false);
      return goTo('summary');
    }
    if (branchChanged) setReturnToSummary(false);
    const i = f.indexOf(step);
    goTo(f[i + 1] ?? 'summary');
  };
  const back = () => {
    const prev = history[history.length - 1];
    if (!prev) return;
    setHistory((h) => h.slice(0, -1));
    setDir(-1);
    setStep(prev);
  };
  const editFrom = (s: Step) => {
    setReturnToSummary(true);
    goTo(s, -1);
  };

  const ctx: Ctx = { a, set, next, goTo, back, editFrom, step };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top', 'bottom', 'left', 'right']}>
      {step === 'welcome' && (
        <>
          <StatusBar style="light" />
          <LinearGradient colors={colors.brandGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
        </>
      )}
      {step !== 'welcome' && step !== 'done' && step !== 'blocked' && (
        <Header
          onBack={history.length ? back : undefined}
          progress={progress}
          right={
            step === 'secure' ? (
              <Pressable onPress={() => { tap(); next(); }} hitSlop={12} accessibilityRole="button">
                <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>{t.onb.later}</Text>
              </Pressable>
            ) : undefined
          }
        />
      )}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <StepTransition stepKey={step} direction={dir}>
          <StepView ctx={ctx} />
        </StepTransition>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type Ctx = {
  a: Answers;
  set: (p: Partial<Answers>) => void;
  next: (patch?: Partial<Answers>) => void;
  goTo: (s: Step, d?: 1 | -1) => void;
  back: () => void;
  editFrom: (s: Step) => void;
  step: Step;
};

function StepView({ ctx }: { ctx: Ctx }) {
  switch (ctx.step) {
    case 'welcome':
      return <Welcome ctx={ctx} />;
    case 'method':
      return <Method ctx={ctx} />;
    case 'birth':
      return <Birth ctx={ctx} />;
    case 'blocked':
      return <Blocked ctx={ctx} />;
    case 'creds':
      return <Creds ctx={ctx} />;
    case 'verify':
      return <Verify ctx={ctx} />;
    case 'name':
      return <Name ctx={ctx} />;
    case 'role':
      return <Role ctx={ctx} />;
    case 'totp':
      return <Totp ctx={ctx} />;
    case 'path':
      return <PathStep ctx={ctx} />;
    case 'inst':
      return <Institution ctx={ctx} />;
    case 'notFound':
      return <NotFound ctx={ctx} />;
    case 'details':
      return <Details ctx={ctx} />;
    case 'period':
      return <Period ctx={ctx} />;
    case 'subjects':
      return <Subjects ctx={ctx} />;
    case 'import':
      return <Import ctx={ctx} />;
    case 'secure':
      return <Secure ctx={ctx} />;
    case 'summary':
      return <Summary ctx={ctx} />;
    case 'done':
      return <Done ctx={ctx} />;
    case 'login':
      return <Login ctx={ctx} />;
    case 'login2fa':
      return <Login2fa />;
  }
}

// ——— Struttura comune ———

function Header({ onBack, progress, right }: { onBack?: () => void; progress: number | null; right?: ReactNode }) {
  const { spacing } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.sm, paddingRight: spacing.lg, height: 52 }}>
      <View style={{ width: 44 }}>{onBack && <IconButton icon="chevron-back" label={t.onb.back} onPress={onBack} appearance="plain" />}</View>
      {progress !== null ? <ProgressBar value={progress} /> : <View style={{ flex: 1 }} />}
      <View style={{ minWidth: 44, alignItems: 'flex-end' }}>{right}</View>
    </View>
  );
}

/** Passo standard: titolo, sottotitolo, contenuto che scorre, bottone fisso in basso. */
function StepLayout({
  title,
  subtitle,
  art,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  art?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
}) {
  const { colors, typography, spacing } = useTheme();
  return (
    <View style={{ flex: 1 }}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: spacing.xxl, paddingTop: spacing.lg, gap: spacing.xxl, flexGrow: 1 }}>
        {art && <View style={{ alignItems: 'center' }}>{art}</View>}
        <FadeUp>
          <View style={{ gap: spacing.sm }}>
            <Text style={[typography.title1, { color: colors.text }]} accessibilityRole="header">
              {title}
            </Text>
            {subtitle && <Text style={[typography.body, { color: colors.textSecondary }]}>{subtitle}</Text>}
          </View>
        </FadeUp>
        <FadeUp delay={80}>
          <View style={{ gap: spacing.lg }}>{children}</View>
        </FadeUp>
      </ScrollView>
      {footer && <View style={{ paddingHorizontal: spacing.xxl, paddingBottom: spacing.lg, paddingTop: spacing.sm, gap: spacing.sm }}>{footer}</View>}
    </View>
  );
}

/** Passo con pannello di scelta dal basso sopra l'illustrazione (ispirazione: onboarding di riferimento). */
function SheetStep({ art, title, note, children }: { art: ReactNode; title: string; note?: string; children: ReactNode }) {
  const { colors, typography, spacing } = useTheme();
  return (
    <View style={{ flex: 1, justifyContent: 'space-between' }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl }}>{art}</View>
      <ChoiceSheet>
        <Text style={[typography.title2, { color: colors.text, textAlign: 'center' }]} accessibilityRole="header">
          {title}
        </Text>
        {note && <Text style={[typography.callout, { color: colors.textTertiary, textAlign: 'center', fontWeight: '400' }]}>{note}</Text>}
        <View style={{ gap: spacing.sm, marginTop: spacing.sm }} accessibilityRole="radiogroup">
          {children}
        </View>
      </ChoiceSheet>
    </View>
  );
}

/** Scelta con breve conferma visiva prima di avanzare. */
function useAutoAdvance(cb: () => void) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);
  return () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(cb, 320);
  };
}

// ——— ON-01 Benvenuto ———

/** Momento di brand: gradiente del logo, mascotte grande, testo bianco (contrasto ≥ 5:1). */
function Welcome({ ctx }: { ctx: Ctx }) {
  const { typography, spacing } = useTheme();
  return (
    <View style={{ flex: 1, padding: spacing.xxl, justifyContent: 'space-between' }}>
      <FadeUp>
        <View style={{ alignItems: 'center', gap: spacing.sm, marginTop: spacing.xl }}>
          <Text style={[typography.title2, { color: '#FFFFFF', letterSpacing: 0.5 }]}>{t.appName}</Text>
          <Text style={[typography.display, { color: '#FFFFFF', textAlign: 'center' }]}>{t.onb.welcome.title}</Text>
        </View>
      </FadeUp>
      <View style={{ alignItems: 'center' }}>
        <Mascot size={250} mood="celebrate" accessibilityLabel={t.onb.mascot} />
      </View>
      <FadeUp delay={250}>
        <View style={{ gap: spacing.md }}>
          <Text style={[typography.body, { color: '#FFFFFF', textAlign: 'center' }]}>{t.onb.welcome.body}</Text>
          <Button title={t.onb.welcome.start} appearance="inverse" iconAfter="arrow-forward" onPress={() => ctx.goTo('method')} />
          <Button title={t.onb.welcome.haveAccount} appearance="inverseSubtle" onPress={() => ctx.goTo('login')} />
        </View>
      </FadeUp>
    </View>
  );
}

// ——— ON-04 Metodo ———

function Method({ ctx }: { ctx: Ctx }) {
  const choose = (m: Answers['method']) => {
    ctx.set({ method: m });
    ctx.goTo('birth');
  };
  return (
    <StepLayout
      title={t.onb.method.title}
      subtitle={t.onb.method.subtitle}
      art={<OrbitArt icon="person-add-outline" size={180} satellites={['logo-apple', 'logo-google', 'mail-outline', 'key-outline']} />}
    >
      <Button title={t.onb.method.apple} appearance="ink" iconBefore="logo-apple" onPress={() => choose('apple')} />
      <Button title={t.onb.method.google} appearance="default" iconBefore="logo-google" onPress={() => choose('google')} />
      <Button title={t.onb.method.email} appearance="default" iconBefore="mail-outline" onPress={() => choose('email')} />
    </StepLayout>
  );
}

// ——— ON-02 / ON-03 Data di nascita ———

function Birth({ ctx }: { ctx: Ctx }) {
  const { spacing } = useTheme();
  const { a, set } = ctx;
  const [error, setError] = useState<string>();
  const mRef = useRef<TextInputRef>(null);
  const yRef = useRef<TextInputRef>(null);
  const filled = a.day.length > 0 && a.month.length > 0 && a.year.length === 4;
  const submit = () => {
    const d = +a.day, m = +a.month, y = +a.year;
    const date = new Date(y, m - 1, d);
    if (date.getDate() !== d || date.getMonth() !== m - 1 || y < 1900) {
      warn();
      return setError(t.onb.birth.invalid);
    }
    if (date > new Date()) {
      warn();
      return setError(t.onb.birth.future);
    }
    setError(undefined);
    if (ageFrom(d, m, y) < 14) return ctx.goTo('blocked');
    ctx.next();
  };
  return (
    <StepLayout
      title={t.onb.birth.title}
      subtitle={t.onb.birth.subtitle}
      footer={<Button title={t.onb.next} appearance="primary" disabled={!filled} onPress={submit} />}
    >
      <View style={{ flexDirection: 'row', gap: spacing.md }}>
        <View style={{ flex: 1 }}>
          <TextField
            label={t.onb.birth.day}
            placeholder="GG"
            keyboardType="number-pad"
            maxLength={2}
            value={a.day}
            autoFocus
            onChangeText={(v) => {
              set({ day: v.replace(/\D/g, '') });
              if (v.length === 2) mRef.current?.focus();
            }}
          />
        </View>
        <View style={{ flex: 1 }}>
          <TextField
            ref={mRef}
            label={t.onb.birth.month}
            placeholder="MM"
            keyboardType="number-pad"
            maxLength={2}
            value={a.month}
            onChangeText={(v) => {
              set({ month: v.replace(/\D/g, '') });
              if (v.length === 2) yRef.current?.focus();
            }}
          />
        </View>
        <View style={{ flex: 1.4 }}>
          <TextField
            ref={yRef}
            label={t.onb.birth.year}
            placeholder="AAAA"
            keyboardType="number-pad"
            maxLength={4}
            value={a.year}
            onChangeText={(v) => set({ year: v.replace(/\D/g, '') })}
            error={error}
          />
        </View>
      </View>
      <SectionMessage appearance="information">{t.onb.birth.note}</SectionMessage>
    </StepLayout>
  );
}

function Blocked({ ctx }: { ctx: Ctx }) {
  const { colors, typography, spacing } = useTheme();
  return (
    <View style={{ flex: 1, padding: spacing.xxl, justifyContent: 'center', gap: spacing.xxl }}>
      <View style={{ alignItems: 'center' }}>
        <Mascot size={200} mood="sleepy" />
      </View>
      <FadeUp>
        <View style={{ gap: spacing.sm }}>
          <Text style={[typography.title1, { color: colors.text, textAlign: 'center' }]} accessibilityRole="header">
            {t.onb.blocked.title}
          </Text>
          <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center' }]}>{t.onb.blocked.body}</Text>
        </View>
      </FadeUp>
      <Button
        title={t.onb.blocked.restart}
        appearance="subtle"
        onPress={() => {
          ctx.set({ ...initial });
          ctx.goTo('welcome', -1);
        }}
      />
    </View>
  );
}

// ——— ON-05 / ON-06 Email ———

function Creds({ ctx }: { ctx: Ctx }) {
  const { colors, typography, spacing } = useTheme();
  const { a, set } = ctx;
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState(false);
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(a.email);
  const pwdOk = a.password.length >= 8;
  const ready = emailOk && pwdOk && a.consent;
  return (
    <StepLayout
      title={t.onb.creds.title}
      footer={
        <Button
          title={t.onb.creds.send}
          appearance="primary"
          disabled={!ready}
          loading={loading}
          onPress={() => {
            setLoading(true);
            setTimeout(() => ctx.next(), 700);
          }}
        />
      }
    >
      <TextField
        label={t.onb.creds.email}
        placeholder={t.onb.creds.emailPh}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="emailAddress"
        value={a.email}
        onChangeText={(v) => set({ email: v.trim() })}
        onBlur={() => setTouched(true)}
        error={touched && a.email.length > 0 && !emailOk ? t.onb.creds.invalidEmail : undefined}
      />
      <TextField
        label={t.onb.creds.password}
        secureTextEntry
        autoComplete="new-password"
        textContentType="newPassword"
        value={a.password}
        onChangeText={(v) => set({ password: v })}
      />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: -spacing.sm }}>
        <Icon name={pwdOk ? 'checkmark-circle' : 'ellipse-outline'} size={16} color={pwdOk ? colors.successIcon : colors.textTertiary} />
        <Text style={[typography.caption, { color: pwdOk ? colors.success : colors.textTertiary }]}>{t.onb.creds.pwdRule}</Text>
      </View>
      <Checkbox checked={a.consent} onChange={(v) => set({ consent: v })} label={t.onb.creds.consent} />
    </StepLayout>
  );
}

function Verify({ ctx }: { ctx: Ctx }) {
  const { colors, typography, spacing } = useTheme();
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [left, setLeft] = useState(30);
  useEffect(() => {
    if (left <= 0) return;
    const id = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [left]);
  const onChange = (v: string) => {
    setCode(v);
    setError(false);
    if (v.length === 6) {
      if (v === '000000') {
        warn();
        setError(true);
      } else {
        success();
        setTimeout(() => ctx.next(), 250);
      }
    }
  };
  return (
    <StepLayout
      title={t.onb.verify.title}
      subtitle={t.onb.verify.subtitle(ctx.a.email || 'nome@esempio.it')}
      art={<OrbitArt icon="mail-open-outline" size={170} satellites={['key-outline', 'checkmark-outline', 'time-outline', 'shield-outline']} />}
    >
      <CodeInput value={code} onChange={onChange} error={error} label={t.onb.verify.label} />
      {error && <Text style={[typography.caption, { color: colors.danger, textAlign: 'center' }]}>{t.onb.verify.wrong}</Text>}
      <Text style={[typography.caption, { color: colors.textTertiary, textAlign: 'center' }]}>{t.onb.verify.demoHint}</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: spacing.xl }}>
        <Pressable disabled={left > 0} onPress={() => { tap(); setLeft(30); }} hitSlop={8} accessibilityRole="button">
          <Text style={[typography.callout, { color: left > 0 ? colors.textTertiary : colors.link }]}>
            {left > 0 ? t.onb.verify.resendIn(left) : t.onb.verify.resend}
          </Text>
        </Pressable>
        <Pressable onPress={ctx.back} hitSlop={8} accessibilityRole="button">
          <Text style={[typography.callout, { color: colors.link }]}>{t.onb.verify.change}</Text>
        </Pressable>
      </View>
    </StepLayout>
  );
}

// ——— ON-07 Nome ———

function Name({ ctx }: { ctx: Ctx }) {
  const { a, set } = ctx;
  const fromProvider = a.method === 'apple' || a.method === 'google';
  useEffect(() => {
    if (fromProvider && !a.firstName) set({ firstName: 'Giulia', lastName: 'Rossi' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const ready = a.firstName.trim().length > 0 && a.lastName.trim().length > 0;
  return (
    <StepLayout
      title={t.onb.name.title}
      subtitle={t.onb.name.subtitle}
      footer={<Button title={t.onb.next} appearance="primary" disabled={!ready} onPress={() => ctx.next()} />}
    >
      <TextField label={t.onb.name.first} value={a.firstName} onChangeText={(v) => set({ firstName: v })} autoComplete="given-name" textContentType="givenName" autoFocus={!fromProvider} />
      <TextField label={t.onb.name.last} value={a.lastName} onChangeText={(v) => set({ lastName: v })} autoComplete="family-name" textContentType="familyName" />
      {fromProvider && <Chip variant="information" icon="checkmark-circle" label={t.onb.name.prefilled} />}
    </StepLayout>
  );
}

// ——— ON-08 Ruolo (pannello di scelta) ———

function Role({ ctx }: { ctx: Ctx }) {
  const [pick, setPick] = useState(ctx.a.role);
  const advance = useAutoAdvance(() => ctx.next({ role: pick }));
  useEffect(() => {
    if (pick && pick !== ctx.a.role) advance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pick]);
  const opts: { v: 'student' | 'teacher'; title: string; desc: string; icon: IconName }[] = [
    { v: 'student', title: t.onb.role.student, desc: t.onb.role.studentDesc, icon: 'school-outline' },
    { v: 'teacher', title: t.onb.role.teacher, desc: t.onb.role.teacherDesc, icon: 'easel-outline' },
  ];
  return (
    <SheetStep art={<OrbitArt icon={pick === 'teacher' ? 'easel-outline' : 'school-outline'} size={220} />} title={t.onb.role.title} note={t.onb.role.note}>
      {opts.map((o) => (
        <OptionCard
          key={o.v}
          title={o.title}
          desc={o.desc}
          icon={o.icon}
          selected={pick === o.v}
          onPress={() => (pick === o.v ? ctx.next({ role: o.v }) : setPick(o.v))}
        />
      ))}
    </SheetStep>
  );
}

// ——— ON-09 TOTP docente ———

function Totp({ ctx }: { ctx: Ctx }) {
  const { colors, typography, spacing, radius } = useTheme();
  const [phase, setPhase] = useState<'scan' | 'codes'>('scan');
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);
  if (phase === 'scan') {
    return (
      <StepLayout title={t.onb.totp.title} subtitle={t.onb.totp.subtitle}>
        <Text style={[typography.callout, { color: colors.text }]}>1. {t.onb.totp.step1}</Text>
        <View style={{ alignItems: 'center', gap: spacing.sm }}>
          <FakeQr />
          <Text style={[typography.caption, { color: colors.textTertiary }]}>{t.onb.totp.manual}</Text>
          <Text selectable style={[typography.time, { color: colors.text, letterSpacing: 1 }]}>
            JBSW Y3DP EHPK 3PXP
          </Text>
        </View>
        <Text style={[typography.callout, { color: colors.text }]}>2. {t.onb.totp.step2}</Text>
        <CodeInput
          value={code}
          label={t.onb.verify.label}
          onChange={(v) => {
            setCode(v);
            if (v.length === 6) {
              success();
              setTimeout(() => setPhase('codes'), 250);
            }
          }}
        />
      </StepLayout>
    );
  }
  return (
    <StepLayout
      title={t.onb.totp.codesTitle}
      subtitle={t.onb.totp.codesBody}
      footer={<Button title={t.onb.next} appearance="primary" disabled={!ctx.a.codesSaved} onPress={() => ctx.next()} />}
    >
      <Card style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
        {demoRecoveryCodes.map((c) => (
          <View key={c} style={{ width: '47%', paddingVertical: spacing.sm, borderRadius: radius.md, backgroundColor: colors.surfaceMuted, alignItems: 'center' }}>
            <Text selectable style={[typography.time, { color: colors.text, letterSpacing: 1 }]}>
              {c}
            </Text>
          </View>
        ))}
      </Card>
      <Button
        title={copied ? t.onb.totp.copied : t.onb.totp.copy}
        iconBefore={copied ? 'checkmark' : 'copy-outline'}
        onPress={async () => {
          await Clipboard.setStringAsync(demoRecoveryCodes.join('\n'));
          success();
          setCopied(true);
        }}
      />
      <Checkbox checked={ctx.a.codesSaved} onChange={(v) => ctx.set({ codesSaved: v })} label={t.onb.totp.saved} />
    </StepLayout>
  );
}

// ——— ON-10 Percorso (pannello di scelta) ———

function PathStep({ ctx }: { ctx: Ctx }) {
  const [pick, setPick] = useState(ctx.a.path);
  const advance = useAutoAdvance(() => ctx.next({ path: pick, institutionId: pick !== ctx.a.path ? undefined : ctx.a.institutionId }));
  useEffect(() => {
    if (pick && pick !== ctx.a.path) advance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pick]);
  const teacher = ctx.a.role === 'teacher';
  return (
    <SheetStep
      art={<OrbitArt icon={pick === 'universita' ? 'library-outline' : 'business-outline'} size={220} tint="official" />}
      title={teacher ? t.onb.path.titleTeacher : t.onb.path.title}
      note={t.onb.path.note}
    >
      <OptionCard title={t.onb.path.school} desc={t.onb.path.schoolDesc} icon="business-outline" selected={pick === 'superiori'} onPress={() => (pick === 'superiori' ? ctx.next() : setPick('superiori'))} />
      <OptionCard title={t.onb.path.uni} desc={t.onb.path.uniDesc} icon="library-outline" selected={pick === 'universita'} onPress={() => (pick === 'universita' ? ctx.next() : setPick('universita'))} />
    </SheetStep>
  );
}

// ——— ON-11 / ON-11b Istituto ———

function Institution({ ctx }: { ctx: Ctx }) {
  const { colors, typography, spacing, radius } = useTheme();
  const [q, setQ] = useState('');
  const [pick, setPick] = useState(ctx.a.institutionId);
  const advance = useAutoAdvance(() => ctx.next({ institutionId: pick }));
  useEffect(() => {
    if (pick && pick !== ctx.a.institutionId) advance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pick]);
  const list = demoInstitutions.filter(
    (i) => i.kind === (ctx.a.path ?? 'superiori') && `${i.name} ${i.city}`.toLowerCase().includes(q.trim().toLowerCase()),
  );
  return (
    <StepLayout title={t.onb.inst.title} subtitle={t.onb.inst.source}>
      <TextField label={t.onb.inst.search} value={q} onChangeText={setQ} placeholder="Es. Galilei, Milano" autoCorrect={false} returnKeyType="search" />
      <View style={{ gap: spacing.sm }}>
        {list.length === 0 && <Text style={[typography.callout, { color: colors.textTertiary, fontWeight: '400' }]}>{t.onb.inst.empty}</Text>}
        {list.map((i) => {
          const sel = pick === i.id;
          return (
            <Pressable
              key={i.id}
              onPress={() => {
                tap();
                if (sel) ctx.next({ institutionId: i.id });
                else setPick(i.id);
              }}
              accessibilityRole="radio"
              accessibilityState={{ selected: sel }}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.md,
                padding: spacing.md,
                borderRadius: radius.lg,
                borderWidth: sel ? 2 : 1,
                borderColor: sel ? colors.accent : colors.border,
                backgroundColor: sel ? colors.selected : pressed ? colors.surfaceMuted : colors.surface,
              })}
            >
              <View style={{ width: 36, height: 36, borderRadius: radius.lg, backgroundColor: colors.tints.official.bg, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={i.kind === 'universita' ? 'library-outline' : 'business-outline'} size={18} color={colors.tints.official.fg} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[typography.headline, { color: colors.text }]}>{i.name}</Text>
                <Text style={[typography.caption, { color: colors.textTertiary }]}>{i.city}</Text>
              </View>
              {sel && <Icon name="checkmark-circle" size={22} color={colors.accent} />}
            </Pressable>
          );
        })}
      </View>
      <Button title={t.onb.inst.notFound} appearance="subtle" iconBefore="help-circle-outline" onPress={() => ctx.goTo('notFound')} />
    </StepLayout>
  );
}

function NotFound({ ctx }: { ctx: Ctx }) {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [type, setType] = useState<string>();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const types = ['Superiori', 'Università', 'AFAM'];
  if (sent) {
    return (
      <StepLayout
        title={t.onb.notFound.sent}
        art={<OrbitArt icon="paper-plane-outline" tint="official" size={180} />}
        footer={<Button title={t.onb.notFound.retry} appearance="primary" onPress={ctx.back} />}
      >
        <SectionMessage appearance="success">{t.onb.notFound.sentBody}</SectionMessage>
      </StepLayout>
    );
  }
  return (
    <StepLayout
      title={t.onb.notFound.title}
      footer={
        <Button
          title={t.onb.notFound.send}
          appearance="primary"
          loading={loading}
          disabled={!name.trim() || !city.trim() || !type}
          onPress={() => {
            setLoading(true);
            setTimeout(() => {
              success();
              setSent(true);
            }, 600);
          }}
        />
      }
    >
      <SectionMessage appearance="warning">{t.onb.notFound.block}</SectionMessage>
      <TextField label={t.onb.notFound.name} value={name} onChangeText={setName} />
      <TextField label={t.onb.notFound.city} value={city} onChangeText={setCity} />
      <SelectPills options={types} isSelected={(o) => o === type} onToggle={setType} />
    </StepLayout>
  );
}

// ——— ON-12 Dettagli ———

function Details({ ctx }: { ctx: Ctx }) {
  const { colors, typography } = useTheme();
  const { a, set } = ctx;
  const uni = a.path === 'universita';
  const ready = uni ? !!a.course.trim() && !!a.degree && !!a.classYear : !!a.track && !!a.classYear;
  const label = (s: string) => <Text style={[typography.overline, { color: colors.textSecondary }]}>{s}</Text>;
  return (
    <StepLayout
      title={uni ? t.onb.details.titleUni : t.onb.details.titleSchool}
      footer={<Button title={t.onb.next} appearance="primary" disabled={!ready} onPress={() => ctx.next()} />}
    >
      {uni ? (
        <>
          <TextField label={t.onb.details.course} placeholder={t.onb.details.coursePh} value={a.course} onChangeText={(v) => set({ course: v })} />
          {label(t.onb.details.degree)}
          <SelectPills options={demoDegreeTypes} isSelected={(o) => o === a.degree} onToggle={(o) => set({ degree: o })} />
          {label(t.onb.details.year)}
          <Segmented options={['1', '2', '3', '4', '5', '6']} value={a.classYear} onChange={(v) => set({ classYear: v })} />
        </>
      ) : (
        <>
          {label(t.onb.details.track)}
          <SelectPills options={demoTracks} isSelected={(o) => o === a.track} onToggle={(o) => set({ track: o })} />
          {label(t.onb.details.year)}
          <Segmented options={['1', '2', '3', '4', '5']} value={a.classYear} onChange={(v) => set({ classYear: v })} />
          <TextField label={t.onb.details.section} placeholder={t.onb.details.sectionPh} value={a.section} autoCapitalize="characters" maxLength={3} onChangeText={(v) => set({ section: v })} />
        </>
      )}
    </StepLayout>
  );
}

// ——— ON-13 Periodo ———

function Period({ ctx }: { ctx: Ctx }) {
  const [pick, setPick] = useState(ctx.a.split);
  const advance = useAutoAdvance(() => ctx.next({ split: pick }));
  useEffect(() => {
    if (pick && pick !== ctx.a.split) advance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pick]);
  const opts = demoSplits[ctx.a.path ?? 'superiori'];
  return (
    <SheetStep art={<OrbitArt icon="calendar-outline" tint="activity" size={220} />} title={t.onb.period.title} note={t.onb.period.subtitle(schoolYear())}>
      {opts.map((o) => (
        <OptionCard key={o} title={o} icon="calendar-number-outline" selected={pick === o} onPress={() => (pick === o ? ctx.next() : setPick(o))} />
      ))}
    </SheetStep>
  );
}

// ——— ON-14 Materie ———

function Subjects({ ctx }: { ctx: Ctx }) {
  const { colors, typography, spacing } = useTheme();
  const { a, set } = ctx;
  const [extra, setExtra] = useState('');
  const [err, setErr] = useState<string>();
  const base = demoSubjects[a.path ?? 'superiori'];
  const options = [...base, ...a.subjects.filter((s) => !base.includes(s))];
  const toggle = (s: string) => set({ subjects: a.subjects.includes(s) ? a.subjects.filter((x) => x !== s) : [...a.subjects, s] });
  const add = () => {
    const v = extra.trim();
    if (!v) return;
    if (options.some((o) => o.toLowerCase() === v.toLowerCase())) {
      warn();
      return setErr(t.onb.subjects.dup);
    }
    setErr(undefined);
    set({ subjects: [...a.subjects, v] });
    setExtra('');
  };
  return (
    <StepLayout
      title={a.role === 'teacher' ? t.onb.subjects.titleTeacher : t.onb.subjects.title}
      subtitle={t.onb.subjects.subtitle}
      footer={<Button title={a.subjects.length ? `${t.onb.next} · ${t.onb.subjects.count(a.subjects.length)}` : t.onb.subjects.empty} appearance="primary" disabled={!a.subjects.length} onPress={() => ctx.next()} />}
    >
      <SelectPills options={options} isSelected={(o) => a.subjects.includes(o)} onToggle={toggle} />
      <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-end' }}>
        <View style={{ flex: 1 }}>
          <TextField label={t.onb.subjects.addPh} value={extra} onChangeText={setExtra} onSubmitEditing={add} returnKeyType="done" error={err} />
        </View>
        <View style={{ marginBottom: err ? 22 : 0 }}>
          <Button title={t.onb.subjects.add} iconBefore="add" fullWidth={false} onPress={add} />
        </View>
      </View>
      {a.subjects.length === 0 && <Text style={[typography.caption, { color: colors.textTertiary }]}>{t.onb.subjects.empty}</Text>}
    </StepLayout>
  );
}

// ——— ON-15 Importa (segnaposto, dec. 72 e 83) ———

function Import({ ctx }: { ctx: Ctx }) {
  return (
    <StepLayout
      title={t.onb.import.title}
      subtitle={t.onb.import.body}
      art={<OrbitArt icon="cloud-download-outline" tint="lesson" size={200} satellites={['document-text-outline', 'calendar-outline', 'stats-chart-outline', 'folder-outline']} />}
      footer={<Button title={t.onb.import.skip} appearance="primary" onPress={() => ctx.next()} />}
    >
      <Chip variant="discovery" icon="sparkles" label={t.onb.import.soon} />
    </StepLayout>
  );
}

// ——— ON-17 Proteggi l'account (studenti, dec. 79) ———

function Secure({ ctx }: { ctx: Ctx }) {
  const { colors, typography, spacing, radius } = useTheme();
  return (
    <StepLayout
      title={t.onb.secure.title}
      subtitle={t.onb.secure.body}
      footer={
        <Button
          title={t.onb.secure.enable}
          appearance="primary"
          iconBefore="shield-checkmark-outline"
          onPress={() => {
            success();
            ctx.next({ secured: true });
          }}
        />
      }
    >
      <View style={{ borderRadius: radius.xxl, backgroundColor: colors.tints.lesson.bg, padding: spacing.xxl, alignItems: 'center', gap: spacing.lg }}>
        <OrbitArt icon="shield-checkmark-outline" size={150} satellites={['mail-outline', 'phone-portrait-outline', 'key-outline', 'lock-closed-outline']} />
        <Card style={{ alignSelf: 'stretch', gap: spacing.xs }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Icon name="mail" size={16} color={colors.accent} />
            <Text style={[typography.headline, { color: colors.text }]}>{t.onb.secure.cardTitle}</Text>
          </View>
          <Text style={[typography.callout, { color: colors.textSecondary, fontWeight: '400' }]}>{t.onb.secure.cardBody}</Text>
          <Text style={[typography.metric, { color: colors.text, letterSpacing: 4 }]}>482 913</Text>
        </Card>
      </View>
    </StepLayout>
  );
}

// ——— ON-18 Riepilogo ———

function Summary({ ctx }: { ctx: Ctx }) {
  const { colors, typography, spacing } = useTheme();
  const { a } = ctx;
  const inst = demoInstitutions.find((i) => i.id === a.institutionId);
  const teacher = a.role === 'teacher';
  const details = a.path === 'universita' ? [a.course, a.degree, a.classYear && `${a.classYear}° anno`].filter(Boolean).join(' · ') : [a.track, a.classYear && `${a.classYear}ª ${a.section}`.trim()].filter(Boolean).join(' · ');
  const rows: { label: string; value: string; step: Step; badge?: boolean }[] = [
    { label: t.onb.summary.name, value: `${a.firstName} ${a.lastName}`, step: 'name' },
    { label: t.onb.summary.role, value: teacher ? t.onb.role.teacher : t.onb.role.student, step: 'role', badge: true },
    { label: t.onb.summary.institution, value: inst ? `${inst.name}, ${inst.city}` : '—', step: 'path' },
    ...(teacher
      ? []
      : [
          { label: t.onb.summary.details, value: details || '—', step: 'details' as Step },
          { label: t.onb.summary.period, value: a.split ?? '—', step: 'period' as Step },
        ]),
    { label: t.onb.summary.subjects, value: a.subjects.join(', ') || '—', step: 'subjects' },
    ...(teacher ? [] : [{ label: t.onb.summary.security, value: a.secured ? t.onb.summary.on : t.onb.summary.off, step: 'secure' as Step }]),
  ];
  return (
    <StepLayout
      title={t.onb.summary.title}
      subtitle={t.onb.summary.subtitle}
      footer={
        <Button
          title={t.onb.summary.enter}
          appearance="primary"
          iconAfter="arrow-forward"
          onPress={() => {
            success();
            ctx.goTo('done');
          }}
        />
      }
    >
      <Card style={{ gap: 0, paddingVertical: spacing.xs }}>
        {rows.map((r, i) => (
          <View key={r.label} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, borderTopWidth: i ? 1 : 0, borderTopColor: colors.border }}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={[typography.overline, { color: colors.textTertiary }]}>{r.label}</Text>
              {r.badge ? <Chip variant="information" label={r.value} /> : <Text style={[typography.callout, { color: colors.text, fontWeight: '400' }]}>{r.value}</Text>}
            </View>
            <Pressable onPress={() => { tap(); ctx.editFrom(r.step); }} hitSlop={10} accessibilityRole="button" accessibilityLabel={`${t.onb.summary.edit} ${r.label}`}>
              <Text style={[typography.callout, { color: colors.link }]}>{t.onb.summary.edit}</Text>
            </Pressable>
          </View>
        ))}
      </Card>
    </StepLayout>
  );
}

// ——— Fine ———

function Done({ ctx }: { ctx: Ctx }) {
  const { colors, typography, spacing } = useTheme();
  // Le materie scelte diventano le categorie degli Appunti (dec. 141).
  useEffect(() => setSubjects(ctx.a.subjects), [ctx.a.subjects]);
  return (
    <View style={{ flex: 1, padding: spacing.xxl, justifyContent: 'center', gap: spacing.xxl, overflow: 'hidden' }}>
      <Confetti />
      <View style={{ alignItems: 'center' }}>
        <Mascot size={240} mood="celebrate" accessibilityLabel={t.onb.mascot} />
      </View>
      <FadeUp delay={150}>
        <View style={{ gap: spacing.sm }}>
          <Text style={[typography.display, { color: colors.text, textAlign: 'center' }]} accessibilityRole="header">
            {t.onb.done.title(ctx.a.firstName || 'Giulia')}
          </Text>
          <Text style={[typography.body, { color: colors.textSecondary, textAlign: 'center' }]}>{t.onb.done.body}</Text>
        </View>
      </FadeUp>
      <FadeUp delay={400}>
        <Button title={t.onb.done.go} appearance="primary" iconAfter="arrow-forward" onPress={() => router.replace('/home')} />
      </FadeUp>
    </View>
  );
}

// ——— ON-19 / ON-20 Accesso ———

function Login({ ctx }: { ctx: Ctx }) {
  const { colors, typography, spacing } = useTheme();
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [loading, setLoading] = useState(false);
  return (
    <StepLayout
      title={t.onb.login.title}
      subtitle={t.onb.login.subtitle}
      art={<Mascot size={150} />}
      footer={
        <Button
          title={t.onb.login.submit}
          appearance="primary"
          loading={loading}
          disabled={!email || !pwd}
          onPress={() => {
            setLoading(true);
            setTimeout(() => ctx.goTo('login2fa'), 600);
          }}
        />
      }
    >
      <TextField label={t.onb.creds.email} keyboardType="email-address" autoCapitalize="none" autoComplete="email" textContentType="username" value={email} onChangeText={setEmail} />
      <TextField label={t.onb.creds.password} secureTextEntry autoComplete="current-password" textContentType="password" value={pwd} onChangeText={setPwd} />
      <Pressable hitSlop={8} accessibilityRole="link" onPress={tap}>
        <Text style={[typography.callout, { color: colors.link }]}>{t.onb.login.forgot}</Text>
      </Pressable>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
        <Text style={[typography.caption, { color: colors.textTertiary }]}>{t.onb.login.or}</Text>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
      </View>
      <Button title={t.onb.method.apple} appearance="ink" iconBefore="logo-apple" onPress={() => router.replace('/home')} />
      <Button title={t.onb.method.google} iconBefore="logo-google" onPress={() => router.replace('/home')} />
    </StepLayout>
  );
}

function Login2fa() {
  const { colors, typography } = useTheme();
  const [code, setCode] = useState('');
  return (
    <StepLayout title={t.onb.login.twofa} subtitle={t.onb.login.twofaBody} art={<OrbitArt icon="key-outline" size={170} />}>
      <CodeInput
        value={code}
        label={t.onb.verify.label}
        onChange={(v) => {
          setCode(v);
          if (v.length === 6) {
            success();
            setTimeout(() => router.replace('/home'), 250);
          }
        }}
      />
      <Pressable hitSlop={8} accessibilityRole="button" onPress={tap} style={{ alignSelf: 'center' }}>
        <Text style={[typography.callout, { color: colors.link }]}>{t.onb.login.recovery}</Text>
      </Pressable>
    </StepLayout>
  );
}
