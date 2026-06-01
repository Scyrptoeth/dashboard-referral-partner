import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { formatCurrency, formatDate } from '@/lib/utils';
import DeveloperActions from '@/components/DeveloperActions';

export default async function DataReferralsPage() {
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

  const [referralsRes, partnersRes] = await Promise.all([
    supabase
      .from('referrals')
      .select('*, profiles(full_name, whatsapp)')
      .order('created_at', { ascending: false }),
    supabase.from('profiles').select('*').eq('role', 'partner')
  ]);

  const referrals = referralsRes.data || [];
  const partners = partnersRes.data || [];

  return (
    <div className="space-y-12">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="heading-1 text-[#1C1C1A] mb-4">Data Rujukan</h1>
          <p className="text-[#738276]">Seluruh riwayat pendaftaran siswa melalui kode referral mitra.</p>
        </div>
      </header>

      <section className="bg-white rounded-2xl border border-[#E8E8E4] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#F5F5F2] border-b border-[#E8E8E4]">
              <tr>
                <th className="py-4 px-6 text-xs font-medium text-[#738276] uppercase tracking-widest">Pendaftar</th>
                <th className="py-4 px-6 text-xs font-medium text-[#738276] uppercase tracking-widest">Mitra</th>
                <th className="py-4 px-6 text-xs font-medium text-[#738276] uppercase tracking-widest">Tanggal</th>
                <th className="py-4 px-6 text-xs font-medium text-[#738276] uppercase tracking-widest">Status</th>
                <th className="py-4 px-6 text-xs font-medium text-[#738276] uppercase tracking-widest text-right">Komisi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E8E4]">
              {referrals.map((ref) => {
                const partner = Array.isArray(ref.profiles) ? ref.profiles[0] : ref.profiles;
                return (
                  <tr key={ref.id} className="hover:bg-[#FDFDFB] transition-colors text-sm">
                    <td className="py-5 px-6 font-medium text-[#1C1C1A]">{ref.pendaftar_name}</td>
                    <td className="py-5 px-6">
                      <p className="text-[#1C1C1A]">{partner?.full_name}</p>
                      <p className="text-[10px] text-[#738276]">{partner?.whatsapp}</p>
                    </td>
                    <td className="py-5 px-6 text-[#738276]">{formatDate(ref.created_at)}</td>
                    <td className="py-5 px-6">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${
                        ref.status === 'settled' ? 'bg-[#738276]/10 text-[#738276]' : 'bg-[#1C1C1A]/10 text-[#1C1C1A]'
                      }`}>
                        {ref.status === 'settled' ? 'Lunas' : 'Konfirmasi'}
                      </span>
                    </td>
                    <td className="py-5 px-6 text-right font-medium text-[#1C1C1A]">{formatCurrency(ref.amount)}</td>
                  </tr>
                );
              })}
              {referrals.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm text-[#738276] italic">Belum ada data rujukan.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="pt-12 border-t border-[#E8E8E4]">
        <h2 className="heading-2 text-[#1C1C1A] mb-8">Input Rujukan Baru</h2>
        <div className="max-w-md">
          <DeveloperActions partners={partners} /> {/* Only referral part will be used */}
        </div>
      </section>
    </div>
  );
}
