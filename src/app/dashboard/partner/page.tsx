import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { formatCurrency, formatDate } from '@/lib/utils';
import FeedbackForm from '@/components/FeedbackForm';

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
    supabase.from('referrals').select('partner_id, profiles(full_name), amount').neq('status', 'settled')
  ]);

  const allReferrals = myReferralsRes.data || [];
  const activeReferrals = allReferrals.filter(r => r.status !== 'settled');
  
  const totalReferrals = activeReferrals.length;
  const totalCommission = activeReferrals.reduce((acc, curr) => acc + Number(curr.amount), 0);

  type LeaderboardItem = {
    name: string;
    total: number;
  };

  const grouped = (leaderboardDataRes.data || []).reduce((acc: Record<string, LeaderboardItem>, curr) => {
    const id = curr.partner_id;
    const profile = Array.isArray(curr.profiles) ? curr.profiles[0] : curr.profiles;
    const name = profile?.full_name || 'Partner';
    
    if (!acc[id]) acc[id] = { name, total: 0 };
    acc[id].total += Number(curr.amount);
    return acc;
  }, {});

  const sortedLeaderboard = Object.values(grouped)
    .sort((a, b) => b.total - a.total)
    .slice(0, 7);

  return (
    <div className="space-y-24 pb-24">
      <header className="max-w-3xl">
        <h1 className="heading-1 text-[#1C1C1A] mb-6">Pencapaian Anda</h1>
        <p className="text-lg text-[#738276] leading-relaxed">
          Terima kasih atas kontribusi Anda. Di bawah ini adalah rincian transparan mengenai rujukan dan komisi yang telah Anda hasilkan di periode berjalan.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-16 border-t border-[#E8E8E4] pt-16">
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
          <p className="text-sm text-[#738276] mt-4 leading-relaxed max-w-xs">
            Komisi yang belum dicairkan. Sudah termasuk penyesuaian khusus untuk 3 rujukan pertama.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-16 border-t border-[#E8E8E4] pt-16">
        <div className="lg:col-span-5 space-y-8">
          <h2 className="heading-2 text-[#1C1C1A]">Papan Peringkat</h2>
          <p className="text-sm text-[#738276] mb-8">7 mitra dengan kontribusi tertinggi periode aktif ini.</p>
          
          <div className="space-y-6">
            {sortedLeaderboard.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center border-b border-[#E8E8E4] pb-4">
                <div className="flex items-center gap-6">
                  <span className="font-serif text-lg text-[#1C1C1A] opacity-50">0{idx + 1}</span>
                  <p className="font-medium text-[#1C1C1A]">{item.name}</p>
                </div>
                <p className="font-medium text-[#738276]">{formatCurrency(item.total)}</p>
              </div>
            ))}
            {sortedLeaderboard.length === 0 && (
              <p className="text-sm text-[#738276] italic">Belum ada data tersedia untuk periode ini.</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-7 space-y-8">
          <h2 className="heading-2 text-[#1C1C1A]">Semua Riwayat Aktivitas</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-[#E8E8E4]">
                <tr>
                  <th className="pb-4 text-xs font-medium text-[#738276] uppercase tracking-widest">Nama Pendaftar</th>
                  <th className="pb-4 text-xs font-medium text-[#738276] uppercase tracking-widest">Status</th>
                  <th className="pb-4 text-xs font-medium text-[#738276] uppercase tracking-widest text-right">Nilai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E8E4]/50">
                {allReferrals.map((ref) => (
                  <tr key={ref.id} className="group hover:bg-[#F5F5F2] transition-colors">
                    <td className="py-5 px-2">
                      <p className="font-medium text-[#1C1C1A]">{ref.pendaftar_name}</p>
                      <p className="text-[10px] text-[#738276]">{formatDate(ref.created_at)}</p>
                    </td>
                    <td className="py-5 px-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${
                        ref.status === 'settled' ? 'bg-[#738276]/10 text-[#738276]' : 'bg-[#1C1C1A]/10 text-[#1C1C1A]'
                      }`}>
                        {ref.status === 'settled' ? 'Lunas' : 'Konfirmasi'}
                      </span>
                    </td>
                    <td className="py-5 px-2 text-right font-medium text-[#1C1C1A]">{formatCurrency(ref.amount)}</td>
                  </tr>
                ))}
                {allReferrals.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-12 text-center text-sm text-[#738276] italic">Riwayat rujukan Anda belum tersedia.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="max-w-xl border-t border-[#E8E8E4] pt-16">
        <FeedbackForm />
      </section>
    </div>
  );
}
