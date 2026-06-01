import { ReactNode } from 'react';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  const isDeveloper = profile?.role === 'developer';

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
            </>
          )}

          <Link href="/dashboard/payouts" className="text-sm text-[#4A4A48] hover:text-[#1C1C1A] transition-colors">
            Pencairan Dana
          </Link>

          {!isDeveloper && (
            <Link href="/dashboard/feedback" className="text-sm text-[#4A4A48] hover:text-[#1C1C1A] transition-colors">
              Umpan Balik
            </Link>
          )}
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
      <main className="flex-1 overflow-auto bg-[#FDFDFB]">
        <div className="p-8 md:p-16 max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
