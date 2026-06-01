import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { formatCurrency } from '@/lib/utils';
import { ArrowUpRight, Plus } from 'lucide-react';

export default async function DeveloperDashboard() {
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

  const [partnerRes, referralsRes, pendingRes] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'partner'),
    supabase.from('referrals').select('amount'),
    supabase.from('payments').select('amount').eq('status', 'pending')
  ]);

  const partnerCount = partnerRes.count || 0;
  const totalReferrals = referralsRes.data?.length || 0;
  const totalCommission = referralsRes.data?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;
  const totalPending = pendingRes.data?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

  return (
    <div className="space-y-32">
      {/* Hero: Oversized Typography */}
      <section className="relative">
        <div className="space-y-4">
          <span className="font-sans text-[10px] font-bold uppercase tracking-[0.4em] text-[#D4A373]">
            System_Metric_Report
          </span>
          <h1 className="giant-text tracking-tighter italic">
            OVERVIEW
          </h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 mt-20 gap-20">
          <div className="space-y-8">
            <p className="font-sans text-xl leading-relaxed text-black/60 max-w-md">
              Real-time monitoring of the referral ecosystem. Tracking growth across <span className="text-black font-bold">{partnerCount} active partners</span> with a high-transparency protocol.
            </p>
            <div className="flex gap-4">
              <button className="ed-btn gap-3">
                <span>Add_Entry</span>
                <Plus size={18} />
              </button>
              <button className="px-8 py-4 border-2 border-black font-display text-sm font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all">
                Registry
              </button>
            </div>
          </div>
          
          <div className="flex flex-col justify-end items-end gap-2 text-right">
            <span className="font-sans text-[9px] font-bold uppercase tracking-widest opacity-30">Server_Hash</span>
            <code className="font-mono text-[10px] opacity-40">apnilwlirfjqmkjepkzc.v2</code>
          </div>
        </div>
      </section>

      {/* Grid: Asymmetric Metrics */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-1 border-t border-black/10 pt-20">
        <div className="lg:col-span-8 ed-card border-none flex flex-col justify-between group">
          <div className="flex justify-between items-start">
            <span className="font-sans text-[10px] font-bold uppercase tracking-widest opacity-40">Total_Referral_Volume</span>
            <ArrowUpRight className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="mt-20">
            <span className="giant-text text-black">{totalReferrals}</span>
            <span className="font-display text-2xl font-black uppercase ml-4 opacity-20">Units</span>
          </div>
        </div>

        <div className="lg:col-span-4 ed-card border-l border-black/10 flex flex-col justify-between bg-black text-[#F5F5F0]">
          <span className="font-sans text-[10px] font-bold uppercase tracking-widest opacity-40">Financial_Liquidity</span>
          <div className="mt-20">
            <p className="font-sans text-xs uppercase tracking-widest opacity-50 mb-4">Commission_Pool</p>
            <p className="text-4xl font-display font-black tracking-tighter">{formatCurrency(totalCommission)}</p>
          </div>
        </div>

        <div className="lg:col-span-12 ed-card flex flex-col md:flex-row justify-between items-end gap-10 mt-10">
          <div className="space-y-4">
            <span className="font-sans text-[10px] font-bold uppercase tracking-widest opacity-40">Payout_Liability</span>
            <h3 className="text-7xl font-display font-black tracking-tighter uppercase italic">{formatCurrency(totalPending)}</h3>
          </div>
          <div className="max-w-xs text-right">
            <p className="font-sans text-[10px] leading-relaxed uppercase tracking-widest opacity-40">
              Pending confirmation for the current period. All rewards are calculated based on the 3-referral threshold rule.
            </p>
          </div>
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="pt-20 border-t border-black/10 flex flex-col md:flex-row justify-between items-center gap-10 opacity-30">
        <span className="font-display text-sm font-black uppercase tracking-[0.5em]">Persiapantubel // 2026</span>
        <div className="flex gap-8 font-sans text-[9px] font-bold uppercase tracking-widest">
          <span>Privacy_Protocol</span>
          <span>Security_Audit</span>
          <span>Terms_Of_Access</span>
        </div>
      </footer>
    </div>
  );
}
