import { ReactNode } from 'react';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Users, CreditCard, MessageSquare, Settings, LogOut } from 'lucide-react';

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
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
        <div className="p-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl text-blue-600">
            <span className="bg-blue-600 text-white p-1 rounded">PT</span>
            Persiapantubel
          </Link>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-all font-medium"
          >
            <LayoutDashboard size={20} />
            Beranda
          </Link>

          {isDeveloper && (
            <>
              <Link
                href="/dashboard/developer/partners"
                className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-all font-medium"
              >
                <Users size={20} />
                Manajemen Partner
              </Link>
              <Link
                href="/dashboard/developer/referrals"
                className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-all font-medium"
              >
                <Users size={20} />
                Data Referral
              </Link>
            </>
          )}

          <Link
            href="/dashboard/payouts"
            className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-all font-medium"
          >
            <CreditCard size={20} />
            Pembayaran
          </Link>

          {!isDeveloper && (
            <Link
              href="/dashboard/feedback"
              className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-blue-600 rounded-xl transition-all font-medium"
            >
              <MessageSquare size={20} />
              Kirim Feedback
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="px-4 py-3 mb-4 bg-slate-50 rounded-xl">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">User</p>
            <p className="text-sm font-bold text-slate-700 truncate">{profile?.full_name}</p>
            <p className="text-[10px] text-slate-400 font-medium capitalize">{profile?.role}</p>
          </div>
          
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all font-medium"
            >
              <LogOut size={20} />
              Keluar
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-slate-200 p-4 flex justify-between items-center">
          <Link href="/dashboard" className="font-bold text-blue-600 text-lg">PT</Link>
          <button className="p-2 text-slate-600">
            <Users size={24} />
          </button>
        </header>

        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
