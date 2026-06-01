import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { formatDate } from '@/lib/utils';
import DeveloperActions from '@/components/DeveloperActions';

export default async function ManagePartnersPage() {
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

  const { data: partners } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'partner')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-12">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="heading-1 text-[#1C1C1A] mb-4">Kelola Mitra</h1>
          <p className="text-[#738276]">Daftar mitra aktif yang terdaftar dalam program referral.</p>
        </div>
      </header>

      <section className="bg-white rounded-2xl border border-[#E8E8E4] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#F5F5F2] border-b border-[#E8E8E4]">
              <tr>
                <th className="py-4 px-6 text-xs font-medium text-[#738276] uppercase tracking-widest">Nama Mitra</th>
                <th className="py-4 px-6 text-xs font-medium text-[#738276] uppercase tracking-widest">WhatsApp</th>
                <th className="py-4 px-6 text-xs font-medium text-[#738276] uppercase tracking-widest">Bergabung</th>
                <th className="py-4 px-6 text-xs font-medium text-[#738276] uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E8E4]">
              {(partners || []).map((p) => (
                <tr key={p.id} className="hover:bg-[#FDFDFB] transition-colors">
                  <td className="py-5 px-6 font-medium text-[#1C1C1A]">{p.full_name}</td>
                  <td className="py-5 px-6 text-sm text-[#4A4A48]">{p.whatsapp}</td>
                  <td className="py-5 px-6 text-sm text-[#738276]">{formatDate(p.created_at)}</td>
                  <td className="py-5 px-6">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-[#4A7356]/10 text-[#4A7356]">
                      Aktif
                    </span>
                  </td>
                </tr>
              ))}
              {(!partners || partners.length === 0) && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-sm text-[#738276] italic">Belum ada mitra yang terdaftar.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="pt-12 border-t border-[#E8E8E4]">
        <h2 className="heading-2 text-[#1C1C1A] mb-8">Tambah Mitra Baru</h2>
        <div className="max-w-md">
          <DeveloperActions partners={[]} /> {/* Only register part will be used */}
        </div>
      </section>
    </div>
  );
}
