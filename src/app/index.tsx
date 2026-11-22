import { Redirect } from 'expo-router';

// Senza backend non c'è una sessione da ricordare: si parte sempre dall'onboarding (dec. 53).
export default function Index() {
  return <Redirect href="/onboarding" />;
}
