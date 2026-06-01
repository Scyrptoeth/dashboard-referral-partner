import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { ArrowDown } from 'lucide-react';

export default async function PartnerDashboard() {
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
  
  const [myReferralsRes, leaderboardDataRes] = await Promise.all([
    supabase.from('referrals').select('*').eq('partner_id', session?.user.id).order('created_at', { ascending: false }),
    supabase.from('referrals').select('partner_id, profiles(full_name), amount')
  ]);

  const myReferrals = myReferralsRes.data || [];
  const totalReferrals = myReferrals.length;
  const totalCommission = myReferrals.reduce((acc, curr) => acc + Number(curr.amount), 0);

  const grouped = (leaderboardDataRes.data || []).reduce((acc: any, curr: any) => {
    const id = curr.partner_id;
    if (!acc[id]) acc[id] = { name: curr.profiles.full_name, total: 0 };
    acc[id].total += Number(curr.amount);
    return acc;
  }, {});

  const sortedLeaderboard = Object.values(grouped)
    .sort((a: any, b: any) => b.total - a.total)
    .slice(0, 5);

  return (
    <div className="space-y-40">
      {/* Editorial Header */}
      <section className="flex flex-col md:flex-row justify-between items-start gap-10">
        <div className="space-y-6">
          <h1 className="giant-text italic tracking-tighter">PERFORMANCE</h1>
          <div className="flex items-center gap-6">
            <span className="w-12 h-12 rounded-full border border-black flex items-center justify-center animate-bounce">
              <ArrowDown size={20} />
            </span>
            <p className="font-sans text-sm font-bold uppercase tracking-[0.3em] opacity-40">Scroll_To_Audit</p>
          </div>
        </div>
        
        <div className="md:text-right space-y-4 max-w-sm">
          <p className="font-sans text-lg leading-relaxed opacity-60">
            A bespoke breakdown of your referral impact. We value transparency above all, ensuring every recruitment unit is accounted for in our real-time audit system.
          </p>
          <div className="b-badge border-black/10 text-[9px] px-3 py-1">GEN_TOKEN: {session?.user.id.slice(0, 8)}</div>
        </div>
      </section>

      {/* Main Metrics: High Asymmetry */}
      <section className="relative grid grid-cols-1 lg:grid-cols-12 gap-0 border-y border-black/10">
        <div className="lg:col-span-7 p-12 md:p-20 border-r border-black/10">
          <span className="font-sans text-[10px] font-bold uppercase tracking-[0.4em] text-[#D4A373] mb-10 block">01. IMPACT_UNITS</span>
          <div className="flex items-baseline gap-4">
            <span className="giant-text leading-none">{totalReferrals}</span>
            <span className="font-display text-4xl font-black uppercase opacity-10">RECRUITS</span>
          </div>
        </div>
        
        <div className="lg:col-span-5 p-12 md:p-20 bg-black text-[#F5F5F0]">
          <span className="font-sans text-[10px] font-bold uppercase tracking-[0.4em] opacity-40 mb-10 block">02. TOTAL_YIELD</span>
          <p className="text-6xl font-display font-black tracking-tighter leading-none">{formatCurrency(totalCommission)}</p>
          <p className="mt-10 font-sans text-[10px] uppercase tracking-widest opacity-30 leading-loose">
            Cumulative commission based on current active period. Includes 50% initial bonus protocols.
          </p>
        </div>
      </section>

      {/* Leaderboard & Logs */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-20">
        <div className="lg:col-span-4 space-y-12">
          <div className="space-y-2">
            <h2 className="text-3xl font-black italic tracking-tighter uppercase">Hall_Of_Fame</h2>
            <div className="h-[2px] w-20 bg-[#D4A373]"></div>
          </div>
          
          <div className="space-y-10">
            {sortedLeaderboard.map((item: any, idx) => (
              <div key={idx} className="flex justify-between items-end border-b border-black/5 pb-6 group hover:border-black transition-colors">
                <div className="space-y-1">
                  <span className="font-mono text-[9px] font-bold opacity-30">RANK_0{idx + 1}</span>
                  <p className="font-display text-xl font-black uppercase tracking-tight group-hover:text-[#D4A373] transition-colors">{item.name}</p>
                </div>
                <p className="font-sans text-xs font-bold opacity-40">{formatCurrency(item.total)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-8 space-y-12">
          <div className="space-y-2">
            <h2 className="text-3xl font-black italic tracking-tighter uppercase">Audit_Logs</h2>
            <div className="h-[2px] w-20 bg-black"></div>
          </div>

          <div className="overflow-hidden">
            <table className="w-full text-left">
              <thead className="font-sans text-[9px] font-bold uppercase tracking-widest opacity-30">
                <tr>
                  <th className="pb-8">SUBJECT_NAME</th>
                  <th className="pb-8">TIMESTAMP</th>
                  <th className="pb-8 text-right">CREDIT_VAL</th>
                </tr>
              </thead>
              <tbody className="font-sans text-xs border-t border-black/10">
                {myReferrals.map((ref) => (
                  <tr key={ref.id} className="group hover:bg-black hover:text-[#F5F5F0] transition-all">
                    <td className="py-8 font-black uppercase tracking-tight">{ref.pendaftar_name}</td>
                    <td className="py-8 opacity-40 uppercase">{formatDate(ref.created_at)}</td>
                    <td className="py-8 text-right font-display font-black text-lg">{formatCurrency(ref.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {myReferrals.length === 0 && (
              <p className="py-20 text-center font-display text-sm font-black uppercase opacity-20 italic">No_Activity_Detected_In_Buffer</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
