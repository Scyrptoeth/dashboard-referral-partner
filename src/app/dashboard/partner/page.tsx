import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';
import { ArrowUpRight, TrendingUp, Share2 } from 'lucide-react';
import TrendChart from '@/components/TrendChart';
import ReferralShareToolkit from '@/components/ReferralShareToolkit';

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
  
  const [myReferralsRes, leaderboardDataRes, rewardConfigsRes, profileRes] = await Promise.all([
    supabase.from('referrals').select('*').eq('partner_id', session?.user.id).order('created_at', { ascending: false }),
    supabase.from('referrals')
      .select('partner_id, profiles(full_name), amount, created_at')
      .neq('status', 'settled')
      .order('created_at', { ascending: true }),
    supabase.from('reward_configs').select('*').order('rank', { ascending: true }),
    supabase.from('profiles').select('full_name, whatsapp').eq('id', session?.user.id).single()
  ]);

  const profile = profileRes.data;
  const allReferrals = myReferralsRes.data || [];
  const activeReferrals = allReferrals.filter(r => r.status !== 'settled');
  
  const totalReferrals = activeReferrals.length;
  const totalCommission = activeReferrals.reduce((acc, curr) => acc + Number(curr.amount), 0);

  // Agregasi Data untuk Chart (7 hari terakhir)
  const chartDataRaw = activeReferrals.reduce((acc: Record<string, number>, curr) => {
    const date = new Date(curr.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const chartData = Object.entries(chartDataRaw).map(([date, count]) => ({ date, count })).slice(-7);

  type LeaderboardItem = {
    name: string;
    basis: number;
    total: number;
    referrals: { amount: string | number }[];
  };

  // Group by partner
  const grouped = (leaderboardDataRes.data || []).reduce((acc: Record<string, LeaderboardItem>, curr) => {
    const id = curr.partner_id;
    const profile = Array.isArray(curr.profiles) ? curr.profiles[0] : curr.profiles;
    const name = profile?.full_name || 'Partner';
    
    if (!acc[id]) acc[id] = { name, basis: 0, total: 0, referrals: [] };
    acc[id].referrals.push(curr);
    return acc;
  }, {});

  // Calculate Reward Basis (Total - first 3) and Add Reward Percentage
  const rewardConfigs = rewardConfigsRes.data || [];
  
  const leaderboardItems = Object.values(grouped).map(item => {
    const rewardReferrals = item.referrals.slice(3);
    const rewardBasis = rewardReferrals.reduce((sum, r) => sum + Number(r.amount), 0);
    return {
      name: item.name,
      basis: rewardBasis,
      total: rewardBasis
    };
  });

  const sortedLeaderboard = leaderboardItems
    .sort((a, b) => b.basis - a.basis)
    .slice(0, 5) // Top 5
    .map((item, idx) => {
      const config = rewardConfigs.find(c => c.rank === idx + 1);
      const rewardAmount = item.basis * (Number(config?.percentage || 0) / 100);
      return {
        ...item,
        rewardAmount,
        percentage: config?.percentage || 0
      };
    });

  return (
    <div className="space-y-24 pb-24">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12">
        <div className="max-w-3xl">
          <h1 className="heading-1 text-[#1C1C1A] mb-6">Pencapaian Kamu</h1>
          <p className="text-lg text-[#738276] leading-relaxed">
            Terima kasih atas kontribusi Kamu, <span className="text-[#1C1C1A] font-medium">{profile?.full_name}</span>. Di bawah ini adalah ringkasan rujukan dan komisi yang Kamu hasilkan.
          </p>
        </div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-16 border-t border-[#E8E8E4] pt-16">
        <div className="lg:col-span-4 space-y-8">
          <div className="flex items-center gap-3 mb-2">
            <Share2 size={20} className="text-[#1C1C1A]" />
            <h2 className="heading-2 text-[#1C1C1A]">Amunisi Promo</h2>
          </div>
          <p className="text-sm text-[#738276]">Pilih format yang paling sesuai untuk membagikan info Bimbel.</p>
          <ReferralShareToolkit partnerName={profile?.full_name || ''} whatsapp={profile?.whatsapp || ''} />
        </div>

        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-12">
            <div>
              <p className="text-xs font-medium text-[#738276] uppercase tracking-widest mb-4">Rujukan Periode Ini</p>
              <div className="flex items-baseline gap-3">
                <span className="font-serif text-7xl text-[#1C1C1A]">{totalReferrals}</span>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-[#738276] uppercase tracking-widest mb-4">Estimasi Pendapatan Baru</p>
              <div className="flex items-baseline gap-3">
                <span className="font-serif text-5xl text-[#1C1C1A] tracking-tight">{formatCurrency(totalCommission)}</span>
              </div>
              <Link href="/dashboard/payouts" className="inline-flex items-center gap-2 text-sm text-[#738276] mt-4 hover:text-[#1C1C1A] transition-colors group">
                Lihat riwayat pencairan <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-[#E8E8E4] self-start">
            <div className="flex items-center gap-2 mb-8">
              <TrendingUp size={18} className="text-[#1C1C1A]" />
              <h3 className="text-sm font-medium text-[#1C1C1A]">Tren Rujukan</h3>
            </div>
            <TrendChart data={chartData} />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-16 border-t border-[#E8E8E4] pt-16">
        <div className="lg:col-span-6 space-y-8">
          <h2 className="heading-2 text-[#1C1C1A]">Papan Peringkat (Top 5)</h2>
          <p className="text-sm text-[#738276] mb-8">Estimasi bonus tambahan berdasarkan performa periode aktif.</p>
          
          <div className="space-y-6">
            {sortedLeaderboard.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center border-b border-[#E8E8E4] pb-6 last:border-none">
                <div className="flex items-center gap-6">
                  <span className="font-serif text-lg text-[#1C1C1A] opacity-50">0{idx + 1}</span>
                  <div>
                    <p className="font-medium text-[#1C1C1A]">{item.name}</p>
                    <p className="text-[10px] text-[#738276] uppercase tracking-wider mt-1">Bonus {item.percentage}% dari basis komisi</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-[#1C1C1A]">{formatCurrency(item.rewardAmount)}</p>
                  <p className="text-[10px] text-[#738276] italic">Basis: {formatCurrency(item.basis)}</p>
                </div>
              </div>
            ))}
            {sortedLeaderboard.length === 0 && (
              <p className="text-sm text-[#738276] italic">Belum ada data tersedia.</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-6 space-y-8">
          <div className="flex justify-between items-end">
            <h2 className="heading-2 text-[#1C1C1A]">Aktivitas Terkini</h2>
            <Link href="/dashboard/archive" className="text-sm text-[#738276] hover:text-[#1C1C1A] underline underline-offset-4">Lihat Arsip</Link>
          </div>
          
          <div className="space-y-4">
            {allReferrals.slice(0, 5).map((ref) => (
              <div key={ref.id} className="flex justify-between items-center p-4 bg-[#F5F5F2] rounded-xl group hover:bg-[#FDFDFB] border border-transparent hover:border-[#E8E8E4] transition-all">
                <div>
                  <p className="font-medium text-[#1C1C1A]">{ref.pendaftar_name}</p>
                  <p className="text-[10px] text-[#738276]">{formatDate(ref.created_at)}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-[#1C1C1A]">{formatCurrency(ref.amount)}</p>
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                    ref.status === 'settled' ? 'bg-[#738276]/10 text-[#738276]' : 'bg-[#1C1C1A]/10 text-[#1C1C1A]'
                  }`}>
                    {ref.status === 'settled' ? 'Lunas' : 'Pending'}
                  </span>
                </div>
              </div>
            ))}
            {allReferrals.length === 0 && (
              <p className="text-sm text-[#738276] italic py-12 text-center border-2 border-dashed border-[#E8E8E4] rounded-2xl">Belum ada rujukan.</p>
            )}
          </div>
        </div>
      </section>

      <section className="bg-[#1C1C1A] rounded-3xl p-8 md:p-12 text-white flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="text-center md:text-left">
          <h2 className="font-serif text-3xl mb-2">Punya masukan?</h2>
          <p className="text-[#738276]">Bantu kami meningkatkan layanan ini untuk Kamu.</p>
        </div>
        <Link href="/dashboard/feedback" className="h-btn bg-white text-[#1C1C1A] hover:bg-[#F5F5F2] border-none px-8">
          Kirim Umpan Balik
        </Link>
      </section>
    </div>
  );
}
