import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Trophy, TrendingUp, DollarSign, History } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default async function PartnerDashboard() {
  const cookieStore = cookies();
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
  
  // 1. My Stats
  const { data: myReferrals } = await supabase
    .from('referrals')
    .select('*')
    .eq('partner_id', session?.user.id)
    .order('created_at', { ascending: false });

  const totalReferrals = myReferrals?.length || 0;
  const totalCommission = myReferrals?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

  // 2. Leaderboard Logic (Simplified for now)
  // Real logic should group by partner_id and sum amounts
  const { data: leaderboardData } = await supabase
    .from('referrals')
    .select('partner_id, profiles(full_name), amount');
  
  // Process leaderboard (group by partner)
  const grouped = (leaderboardData || []).reduce((acc: any, curr: any) => {
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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Halo, Partner!</h1>
        <p className="text-slate-500">Terima kasih telah membantu pertumbuhan Persiapantubel.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-2xl shadow-lg shadow-blue-200 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <TrendingUp size={20} />
            </div>
          </div>
          <p className="text-sm font-medium text-blue-100">Total Referral Saya</p>
          <p className="text-3xl font-bold">{totalReferrals}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <DollarSign size={20} />
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500">Total Komisi</p>
          <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalCommission)}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Trophy size={20} />
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500">Posisi Leaderboard</p>
          <p className="text-2xl font-bold text-slate-900">Top 5</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Leaderboard */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="text-amber-500" size={24} />
            <h2 className="text-lg font-bold text-slate-900">Top 5 Leaderboard</h2>
          </div>
          
          <div className="space-y-4">
            {sortedLeaderboard.map((item: any, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                    idx === 0 ? "bg-amber-100 text-amber-600" :
                    idx === 1 ? "bg-slate-200 text-slate-600" :
                    idx === 2 ? "bg-orange-100 text-orange-600" :
                    "bg-white text-slate-400 border border-slate-100"
                  )}>
                    {idx + 1}
                  </span>
                  <p className="font-semibold text-slate-700 text-sm truncate max-w-[120px]">{item.name}</p>
                </div>
                <p className="text-blue-600 font-bold text-sm">{formatCurrency(item.total)}</p>
              </div>
            ))}
            {sortedLeaderboard.length === 0 && (
              <p className="text-center py-8 text-slate-400 text-sm italic">Belum ada data periode ini.</p>
            )}
          </div>
        </div>

        {/* History Table */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-6">
            <History className="text-blue-600" size={24} />
            <h2 className="text-lg font-bold text-slate-900">Riwayat Referral</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                  <th className="pb-4 font-semibold">Nama Pendaftar</th>
                  <th className="pb-4 font-semibold">Tanggal</th>
                  <th className="pb-4 font-semibold text-right">Komisi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {myReferrals?.map((ref) => (
                  <tr key={ref.id} className="text-sm">
                    <td className="py-4 font-medium text-slate-700">{ref.pendaftar_name}</td>
                    <td className="py-4 text-slate-500">{formatDate(ref.created_at)}</td>
                    <td className="py-4 text-right font-bold text-green-600">{formatCurrency(ref.amount)}</td>
                  </tr>
                ))}
                {(!myReferrals || myReferrals.length === 0) && (
                  <tr>
                    <td colSpan={3} className="py-12 text-center text-slate-400 italic">Belum ada data referral.</td>
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
