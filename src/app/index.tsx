import { Redirect } from 'expo-router';

/**
 * Onboarding disattivato per ora (dec. 130): l'app si apre direttamente sulla Home.
 * Il flusso resta in src/app/onboarding.tsx e si apre ancora da /onboarding; per riattivarlo
 * basta tornare a `<Redirect href="/onboarding" />`.
 */
export default function Index() {
  return <Redirect href="/home" />;
}
