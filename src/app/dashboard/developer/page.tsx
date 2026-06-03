import { formatCurrency } from '@/lib/utils';
import DeveloperActions from '@/components/DeveloperActions';
import RewardConfigEditor from '@/components/RewardConfigEditor';
import Link from 'next/link';
import { ArrowUpRight, TrendingUp } from 'lucide-react';
import TrendChart from '@/components/TrendChart';
import { createSupabaseAdminClient } from '@/lib/supabase-server';

export default async function DeveloperDashboard() {
  const supabaseAdmin = createSupabaseAdminClient();

  const [partnerRes, referralsRes, pendingRes, rewardConfigsRes] = await Promise.all([
    supabaseAdmin.from('profiles').select('*', { count: 'exact' }).eq('role', 'partner'),
    supabaseAdmin.from('referrals').select('amount, created_at, status'),
    supabaseAdmin.from('referrals').select('amount').neq('status', 'settled'),
    supabaseAdmin.from('reward_configs').select('*').order('rank', { ascending: true })
  ]);

  const partnerCount = partnerRes.count || 0;
  const partnersData = partnerRes.data || [];
  const referralsData = referralsRes.data || [];
  
  // Piutang tertunda: referral yang belum berstatus 'settled'
  const totalPending = pendingRes.data?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

  // Agregasi Data untuk Chart (7 hari terakhir)
  const chartDataRaw = referralsData
    .filter(r => r.status !== 'settled')
    .reduce((acc: Record<string, number>, curr) => {
      const date = new Date(curr.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

  const chartData = Object.entries(chartDataRaw).map(([date, count]) => ({ date, count })).slice(-7);

  return (
    <div className="space-y-24 pb-24">
      <header className="max-w-2xl">
        <h1 className="heading-1 text-[#1C1C1A] mb-6">Tinjauan Kinerja</h1>
        <p className="text-lg text-[#738276] leading-relaxed">
          Pantau pertumbuhan ekosistem kemitraan. Saat ini terdapat <span className="text-[#1C1C1A] font-medium">{partnerCount} partner aktif</span> yang berkontribusi pada jaringan Persiapantubel.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-16 border-t border-[#E8E8E4] pt-16">
        <div className="space-y-12">
          <Link href="/dashboard/developer/referrals" className="group block">
            <div className="flex justify-between items-start mb-4">
              <p className="text-xs font-medium text-[#738276] uppercase tracking-widest">Total Referral Aktif</p>
              <ArrowUpRight size={16} className="text-[#E8E8E4] group-hover:text-[#1C1C1A] transition-colors" />
            </div>
            <div className="flex items-baseline gap-3">
              <span className="font-serif text-6xl text-[#1C1C1A]">{referralsData.filter(r => r.status !== 'settled').length}</span>
              <span className="text-sm text-[#4A4A48]">siswa aktif</span>
            </div>
          </Link>

          <div>
            <p className="text-xs font-medium text-[#738276] uppercase tracking-widest mb-4">Komisi Terbayar (Arsip)</p>
            <div className="flex items-baseline gap-3">
              <span className="font-serif text-5xl text-[#1C1C1A] tracking-tight">
                {formatCurrency(referralsData.filter(r => r.status === 'settled').reduce((acc, curr) => acc + Number(curr.amount), 0))}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-[#E8E8E4]">
          <div className="flex items-center gap-2 mb-8">
            <TrendingUp size={18} className="text-[#1C1C1A]" />
            <h3 className="text-sm font-medium text-[#1C1C1A]">Pertumbuhan Referral Baru</h3>
          </div>
          <TrendChart data={chartData} />
        </div>

        <div className="md:col-span-2">
          <Link href="/dashboard/payouts" className="group block h-card bg-[#F5F5F2] border-none">
            <div className="flex justify-between items-start sm:items-center gap-8">
              <div>
                <p className="text-xs font-medium text-[#738276] uppercase tracking-widest mb-3">Total Piutang (Belum Cair)</p>
                <h3 className="font-serif text-4xl text-[#B94A48]">{formatCurrency(totalPending)}</h3>
              </div>
              <ArrowUpRight size={24} className="text-[#E8E8E4] group-hover:text-[#B94A48] transition-colors" />
            </div>
          </Link>
        </div>
      </section>

      <section className="border-t border-[#E8E8E4] pt-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="heading-2 text-[#1C1C1A]">Tindakan Cepat</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <DeveloperActions partners={partnersData} />
          <RewardConfigEditor configs={rewardConfigsRes.data || []} />
        </div>
      </section>
    </div>
  );
}
