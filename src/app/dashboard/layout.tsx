import { ReactNode } from 'react';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { LogOut, Plus } from 'lucide-react';

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
    <div className="min-h-screen bg-[#F5F5F0] text-[#1A1A1A] font-sans selection:bg-black selection:text-white">
      {/* Corner Navigation - Editorial Style */}
      <nav className="fixed top-0 left-0 w-full z-50 p-8 flex justify-between items-start pointer-events-none">
        <div className="pointer-events-auto flex flex-col gap-1">
          <Link href="/dashboard" className="font-display text-2xl font-black italic tracking-tighter leading-none">
            PT.V2
          </Link>
          <span className="font-sans text-[9px] font-bold uppercase tracking-[0.3em] opacity-30">Editorial_Edition</span>
        </div>

        <div className="pointer-events-auto flex items-start gap-12">
          <div className="hidden md:flex flex-col items-end gap-2">
            <span className="font-sans text-[9px] font-bold uppercase tracking-widest text-[#D4A373]">Active_Identity</span>
            <p className="font-display text-sm font-black uppercase tracking-tight">{profile?.full_name}</p>
          </div>
          
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="p-3 bg-black text-white hover:bg-[#D4A373] transition-colors rounded-full"
            >
              <LogOut size={16} />
            </button>
          </form>
        </div>
      </nav>

      {/* Floating Menu - Editorial Minimalist */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-black text-white px-8 py-4 rounded-full flex items-center gap-8 shadow-2xl">
        <Link href="/dashboard" className="font-display text-[10px] font-black uppercase tracking-widest hover:text-[#D4A373] transition-colors">
          Home
        </Link>
        {isDeveloper && (
          <>
            <Link href="/dashboard/developer/partners" className="font-display text-[10px] font-black uppercase tracking-widest hover:text-[#D4A373] transition-colors">
              Partners
            </Link>
            <Link href="/dashboard/developer/referrals" className="font-display text-[10px] font-black uppercase tracking-widest hover:text-[#D4A373] transition-colors">
              Logs
            </Link>
          </>
        )}
        <Link href="/dashboard/payouts" className="font-display text-[10px] font-black uppercase tracking-widest hover:text-[#D4A373] transition-colors">
          Payouts
        </Link>
        {!isDeveloper && (
          <Link href="/dashboard/feedback" className="font-display text-[10px] font-black uppercase tracking-widest hover:text-[#D4A373] transition-colors">
            Feedback
          </Link>
        )}
      </div>

      {/* Main Content Area */}
      <main className="pt-32 pb-40">
        <div className="max-w-[1400px] mx-auto px-8 md:px-20">
          {children}
        </div>
      </main>

      {/* Global Branding Element */}
      <div className="fixed bottom-10 right-10 vertical-text opacity-5 select-none font-display text-6xl font-black">
        PERSIAPANTUBEL
      </div>
    </div>
  );
}
