import { Redirect } from 'expo-router';

// Finché onboarding/account non sono progettati, si parte dalla schermata di benvenuto.
export default function Index() {
  return <Redirect href="/welcome" />;
}
