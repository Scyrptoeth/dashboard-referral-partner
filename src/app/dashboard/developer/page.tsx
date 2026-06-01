import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { formatCurrency } from '@/lib/utils';
import DeveloperActions from '@/components/DeveloperActions';
import RewardConfigEditor from '@/components/RewardConfigEditor';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

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

  const [partnerRes, referralsRes, pendingRes, rewardConfigsRes] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact' }).eq('role', 'partner'),
    supabase.from('referrals').select('amount'),
    supabase.from('referrals').select('amount').neq('status', 'settled'),
    supabase.from('reward_configs').select('*').order('rank', { ascending: true })
  ]);

  const partnerCount = partnerRes.count || 0;
  const partnersData = partnerRes.data || [];
  const totalReferrals = referralsRes.data?.length || 0;
  const totalCommission = referralsRes.data?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;
  
  // Piutang tertunda: rujukan yang belum berstatus 'settled'
  const totalPending = pendingRes.data?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

  return (
    <div className="space-y-24 pb-24">
      <header className="max-w-2xl">
        <h1 className="heading-1 text-[#1C1C1A] mb-6">Tinjauan Kinerja</h1>
        <p className="text-lg text-[#738276] leading-relaxed">
          Pantau pertumbuhan ekosistem kemitraan. Saat ini terdapat <span className="text-[#1C1C1A] font-medium">{partnerCount} mitra aktif</span> yang berkontribusi pada jaringan Persiapantubel.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-[#E8E8E4] pt-16">
        <Link href="/dashboard/developer/referrals" className="group">
          <div className="flex justify-between items-start mb-4">
            <p className="text-xs font-medium text-[#738276] uppercase tracking-widest">Total Rujukan</p>
            <ArrowUpRight size={16} className="text-[#E8E8E4] group-hover:text-[#1C1C1A] transition-colors" />
          </div>
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-6xl text-[#1C1C1A]">{totalReferrals}</span>
            <span className="text-sm text-[#4A4A48]">siswa</span>
          </div>
        </Link>

        <div>
          <p className="text-xs font-medium text-[#738276] uppercase tracking-widest mb-4">Dana Terakumulasi</p>
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-5xl text-[#1C1C1A] tracking-tight">{formatCurrency(totalCommission)}</span>
          </div>
        </div>

        <div className="md:col-span-2 mt-8">
          <Link href="/dashboard/payouts" className="group block h-card bg-[#F5F5F2] border-none">
            <div className="flex justify-between items-start sm:items-center gap-8">
              <div>
                <p className="text-xs font-medium text-[#738276] uppercase tracking-widest mb-3">Tertunda (Menunggu Pembayaran)</p>
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
