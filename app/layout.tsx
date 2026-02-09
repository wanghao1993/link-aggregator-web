import { redirect } from 'next/navigation';
import { defaultLocale } from '@/locales';

// This layout only renders when users visit `/`
// It redirects them to the default locale
export default function RootLayout() {
  redirect(`/${defaultLocale}`);
}
