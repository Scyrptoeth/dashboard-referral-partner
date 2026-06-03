import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Masuk Akun | Persiapantubel',
  description: 'Masuk ke dashboard partner referral Persiapantubel.',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
