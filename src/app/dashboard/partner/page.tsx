import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Trophy, TrendingUp, DollarSign, History, Terminal, Zap } from 'lucide-react';
import { formatCurrency, formatDate, cn } from '@/lib/utils';

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
  
  // Parallel fetching for performance
  const [myReferralsRes, leaderboardDataRes] = await Promise.all([
    supabase.from('referrals').select('*').eq('partner_id', session?.user.id).order('created_at', { ascending: false }),
    supabase.from('referrals').select('partner_id, profiles(full_name), amount')
  ]);

  const myReferrals = myReferralsRes.data || [];
  const totalReferrals = myReferrals.length;
  const totalCommission = myReferrals.reduce((acc, curr) => acc + Number(curr.amount), 0);

  // Process leaderboard
  const grouped = (leaderboardDataRes.data || []).reduce((acc: any, curr: any) => {
    const id = curr.partner_id;
    if (!acc[id]) {
      acc[id] = { name: curr.profiles.full_name, total: 0 };
    }
    acc[id].total += Number(curr.amount);
    return acc;
  }, {});

  const sortedLeaderboard = Object.values(grouped)
    .sort((a: any, b: any) => b.total - a.total)
    .slice(0, 5);

  return (
    <div className="space-y-12">
      <header>
        <div className="flex items-center gap-2 mb-2">
          <Zap size={14} className="text-amber-500 fill-amber-500" />
          <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active_Node: Partner_Dashboard</span>
        </div>
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">
          PARTNER_ENV
        </h1>
        <p className="font-mono text-xs text-slate-500 mt-4 uppercase tracking-tight">
          Performance analytics and commission breakdown for the current period.
        </p>
      </header>

      {/* Stats - Technical Brutalist */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'My_Total_Referrals', value: totalReferrals, icon: TrendingUp, dark: true },
          { label: 'Earnings_Accumulated', value: formatCurrency(totalCommission), icon: DollarSign },
          { label: 'Current_Rank', value: '#1', icon: Trophy },
        ].map((stat, i) => (
          <div key={i} className={cn(
            "p-8 border-2 border-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]",
            stat.dark ? "bg-slate-900 text-white" : "bg-white text-slate-900"
          )}>
            <div className="flex items-center justify-between mb-8">
              <span className={cn("font-mono text-[10px] font-bold uppercase tracking-widest", stat.dark ? "text-slate-400" : "text-slate-400")}>
                {stat.label}
              </span>
              <stat.icon size={16} className={stat.dark ? "text-blue-400" : "text-blue-600"} />
            </div>
            <p className="text-3xl font-black tracking-tight font-mono uppercase">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Leaderboard - Technical List */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center gap-4">
            <Trophy size={20} className="text-amber-500" />
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Top_Performers</h2>
          </div>
          
          <div className="space-y-3">
            {sortedLeaderboard.map((item: any, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 border-2 border-slate-900 bg-white group hover:bg-slate-900 hover:text-white transition-all">
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xs font-black w-6">0{idx + 1}</span>
                  <p className="font-bold text-sm uppercase truncate max-w-[150px]">{item.name}</p>
                </div>
                <p className="font-mono text-xs font-bold text-blue-600 group-hover:text-blue-400">{formatCurrency(item.total)}</p>
              </div>
            ))}
            {sortedLeaderboard.length === 0 && (
              <div className="p-8 border-2 border-dashed border-slate-300 text-center font-mono text-[10px] text-slate-400 uppercase">
                Zero_Data_Buffer
              </div>
            )}
          </div>
        </div>

        {/* History - Technical Table */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center gap-4">
            <Terminal size={20} className="text-slate-900" />
            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Referral_History</h2>
          </div>

          <div className="border-2 border-slate-900 overflow-hidden bg-white shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-mono text-[10px] uppercase tracking-widest">
                  <th className="p-4 border-r border-slate-800">Student_Name</th>
                  <th className="p-4 border-r border-slate-800">Timestamp</th>
                  <th className="p-4 text-right">Credit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-xs">
                {myReferrals.map((ref) => (
                  <tr key={ref.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-bold text-slate-900 uppercase">{ref.pendaftar_name}</td>
                    <td className="p-4 text-slate-500">{formatDate(ref.created_at)}</td>
                    <td className="p-4 text-right font-black text-green-600">{formatCurrency(ref.amount)}</td>
                  </tr>
                ))}
                {myReferrals.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-12 text-center text-slate-300 italic">No historical data records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
