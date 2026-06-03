import { redirect } from 'next/navigation';
import { getCurrentUserAndProfile } from '@/lib/supabase-server';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | Persiapantubel',
  description: 'Ringkasan performa dan referral partner Persiapantubel.',
};

export default async function DashboardPage() {
  const { user, profile } = await getCurrentUserAndProfile();

  if (!user) {
    redirect('/login');
  }

  if (!profile) {
    redirect('/login?error=Profil%20Kamu%20tidak%20ditemukan%20atau%20terjadi%20gangguan%20koneksi.');
  }

  if (profile?.role === 'developer') {
    redirect('/dashboard/developer');
  } else {
    redirect('/dashboard/partner');
  }
}
