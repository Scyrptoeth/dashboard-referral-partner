import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Toaster } from 'sonner';
import { createSupabaseAdminClient, getCurrentUserAndProfile } from '@/lib/supabase-server';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, profile } = await getCurrentUserAndProfile();
  if (!user) redirect('/login');
  if (!profile) redirect('/login?error=Profil%20Kamu%20tidak%20ditemukan%20atau%20terjadi%20gangguan%20koneksi.');

  const isDeveloper = profile?.role === 'developer';
  const supabaseAdmin = createSupabaseAdminClient();

  // Fetch unread feedback count if developer
  let unreadCount = 0;
  if (isDeveloper) {
    const { count } = await supabaseAdmin
      .from('feedback')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false);
    unreadCount = count || 0;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-72 md:border-r border-[#E8E8E4] p-8 md:p-12 flex flex-col">
        <div className="mb-16">
          <Link href="/dashboard" className="font-serif text-xl tracking-tight text-[#1C1C1A]">
            Persiapantubel.
          </Link>
        </div>

        <nav className="flex-1 flex flex-col gap-6">
          <Link href="/dashboard" className="text-sm font-medium text-[#1C1C1A] hover:text-[#738276] transition-colors">
            Ringkasan
          </Link>

          {isDeveloper && (
            <>
              <Link href="/dashboard/developer/partners" className="text-sm text-[#4A4A48] hover:text-[#1C1C1A] transition-colors">
                Kelola Mitra
              </Link>
              <Link href="/dashboard/developer/referrals" className="text-sm text-[#4A4A48] hover:text-[#1C1C1A] transition-colors">
                Data Rujukan
              </Link>
              <Link href="/dashboard/developer/feedback" className="text-sm text-[#4A4A48] hover:text-[#1C1C1A] transition-colors flex items-center justify-between group">
                Kotak Masuk
                {unreadCount > 0 && (
                  <span className="flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-[#B94A48] text-white rounded-full group-hover:scale-110 transition-transform">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            </>
          )}

          <Link href="/dashboard/payouts" className="text-sm text-[#4A4A48] hover:text-[#1C1C1A] transition-colors">
            Pencairan Dana
          </Link>

          <Link href="/dashboard/archive" className="text-sm text-[#4A4A48] hover:text-[#1C1C1A] transition-colors">
            Arsip Rujukan
          </Link>

          {!isDeveloper && (
            <Link href="/dashboard/feedback" className="text-sm text-[#4A4A48] hover:text-[#1C1C1A] transition-colors">
              Umpan Balik
            </Link>
          )}

          <Link href="/dashboard/settings" className="text-sm text-[#4A4A48] hover:text-[#1C1C1A] transition-colors">
            Pengaturan
          </Link>
        </nav>

        <div className="pt-12 mt-12 border-t border-[#E8E8E4]">
          <div className="mb-6">
            <p className="text-sm font-medium text-[#1C1C1A]">{profile?.full_name}</p>
            <p className="text-xs text-[#738276] capitalize mt-1">{profile?.role}</p>
          </div>
          
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="text-sm text-[#B94A48] hover:opacity-80 transition-opacity"
            >
              Keluar Akun
            </button>
          </form>
        </div>
      </aside>

      {/* Main Area */}
      <main className="min-w-0 flex-1 overflow-auto bg-[#FDFDFB]">
        <Toaster richColors position="top-right" />
        <div className="w-full p-6 md:p-10 xl:p-12 2xl:p-16">
          {children}
        </div>
      </main>
    </div>
  );
}
