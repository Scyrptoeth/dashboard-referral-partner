import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { formatCurrency } from '@/lib/utils';
import DeveloperActions from '@/components/DeveloperActions';
import SettlementManager from '@/components/SettlementManager';

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

  const [partnerRes, referralsRes, pendingRes, settlementDataRes] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact' }).eq('role', 'partner'),
    supabase.from('referrals').select('amount'),
    supabase.from('payments').select('amount').eq('status', 'pending'),
    supabase.from('profiles').select('id, full_name, whatsapp, referrals(id, pendaftar_name, amount, created_at, status)').eq('role', 'partner')
  ]);

  const partnerCount = partnerRes.count || 0;
  const partnersData = partnerRes.data || [];
  const totalReferrals = referralsRes.data?.length || 0;
  const totalCommission = referralsRes.data?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;
  const totalPending = pendingRes.data?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

  // Transform data for SettlementManager
  const settlementData = (settlementDataRes.data || []).map(p => {
    type DBReferral = {
      id: string;
      pendaftar_name: string;
      amount: number;
      created_at: string;
      status: string;
    };
    
    const unearnedReferrals = (p.referrals as unknown as DBReferral[] || []).filter(r => r.status === 'confirmed');
    const total_pending = unearnedReferrals.reduce((sum, r) => sum + Number(r.amount), 0);
    
    return {
      id: p.id,
      full_name: p.full_name,
      whatsapp: p.whatsapp,
      total_pending,
      referrals: unearnedReferrals
    };
  }).filter(p => p.total_pending > 0);

  return (
    <div className="space-y-24 pb-24">
      <header className="max-w-2xl">
        <h1 className="heading-1 text-[#1C1C1A] mb-6">Tinjauan Kinerja</h1>
        <p className="text-lg text-[#738276] leading-relaxed">
          Pantau pertumbuhan ekosistem kemitraan. Saat ini terdapat <span className="text-[#1C1C1A] font-medium">{partnerCount} mitra aktif</span> yang berkontribusi pada jaringan Persiapantubel.
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-[#E8E8E4] pt-16">
        <div>
          <p className="text-xs font-medium text-[#738276] uppercase tracking-widest mb-4">Total Rujukan</p>
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-6xl text-[#1C1C1A]">{totalReferrals}</span>
            <span className="text-sm text-[#4A4A48]">siswa</span>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-[#738276] uppercase tracking-widest mb-4">Dana Terkumpul</p>
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-5xl text-[#1C1C1A] tracking-tight">{formatCurrency(totalCommission)}</span>
          </div>
        </div>

        <div className="md:col-span-2 mt-8">
          <div className="h-card bg-[#F5F5F2] border-none flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8">
            <div>
              <p className="text-xs font-medium text-[#738276] uppercase tracking-widest mb-3">Tertunda (Menunggu Pembayaran)</p>
              <h3 className="font-serif text-4xl text-[#B94A48]">{formatCurrency(totalPending)}</h3>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-[#E8E8E4] pt-16">
        <div className="flex justify-between items-center mb-12">
          <h2 className="heading-2 text-[#1C1C1A]">Manajemen Pencairan</h2>
        </div>
        <SettlementManager data={settlementData} />
      </section>

      <section className="border-t border-[#E8E8E4] pt-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="heading-2 text-[#1C1C1A]">Tindakan Cepat</h2>
        </div>
        <DeveloperActions partners={partnersData} />
      </section>
    </div>
  );
}
