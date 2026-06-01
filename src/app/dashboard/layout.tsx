import { ReactNode } from 'react';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Users, CreditCard, MessageSquare, LogOut, Terminal, Activity } from 'lucide-react';

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
    <div className="min-h-screen bg-white flex flex-col md:flex-row font-sans">
      {/* Sidebar - Technical Style */}
      <aside className="w-full md:w-72 bg-white border-r-2 border-slate-900 flex flex-col">
        <div className="p-8 border-b-2 border-slate-900">
          <Link href="/dashboard" className="flex flex-col gap-1">
            <span className="font-mono text-[10px] font-bold text-blue-600 uppercase tracking-widest">PERS_TUBEL // SYSTEM</span>
            <span className="font-black text-2xl text-slate-900 tracking-tighter uppercase leading-none">
              DASHBOARD_V2
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-3 text-slate-900 border-2 border-transparent hover:border-slate-900 transition-all font-mono text-sm font-bold uppercase"
          >
            <Terminal size={18} />
            Overview.exe
          </Link>

          {isDeveloper && (
            <>
              <Link
                href="/dashboard/developer/partners"
                className="flex items-center gap-3 px-4 py-3 text-slate-900 border-2 border-transparent hover:border-slate-900 transition-all font-mono text-sm font-bold uppercase"
              >
                <Users size={18} />
                Manage_Partners
              </Link>
              <Link
                href="/dashboard/developer/referrals"
                className="flex items-center gap-3 px-4 py-3 text-slate-900 border-2 border-transparent hover:border-slate-900 transition-all font-mono text-sm font-bold uppercase"
              >
                <Activity size={18} />
                Referral_Logs
              </Link>
            </>
          )}

          <Link
            href="/dashboard/payouts"
            className="flex items-center gap-3 px-4 py-3 text-slate-900 border-2 border-transparent hover:border-slate-900 transition-all font-mono text-sm font-bold uppercase"
          >
            <CreditCard size={18} />
            Transaction_ID
          </Link>

          {!isDeveloper && (
            <Link
              href="/dashboard/feedback"
              className="flex items-center gap-3 px-4 py-3 text-slate-900 border-2 border-transparent hover:border-slate-900 transition-all font-mono text-sm font-bold uppercase"
            >
              <MessageSquare size={18} />
              Anon_Feedback
            </Link>
          )}
        </nav>

        <div className="p-6 border-t-2 border-slate-900 bg-slate-50">
          <div className="mb-6 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-slate-400 uppercase">Current_User</span>
              <span className="w-2 h-2 bg-green-500 rounded-full" />
            </div>
            <p className="font-mono text-xs font-black text-slate-900 truncate uppercase">{profile?.full_name}</p>
            <div className="b-badge bg-slate-900 text-white text-[9px] px-2">{profile?.role}</div>
          </div>
          
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white font-mono text-xs font-bold uppercase border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              <LogOut size={16} />
              Terminate_Session
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-[#fdfdfd] overflow-auto">
        {/* Decorative Grid Background */}
        <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.02]" 
             style={{ backgroundImage: 'radial-gradient(#0f172a 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        
        <div className="relative z-10 p-6 md:p-12 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
