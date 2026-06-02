import { formatDate } from '@/lib/utils';
import FeedbackForm from '@/components/FeedbackForm';
import { createSupabaseAdminClient, getCurrentUserAndProfile } from '@/lib/supabase-server';

export default async function FeedbackPage() {
  const { profile } = await getCurrentUserAndProfile();
  const supabaseAdmin = createSupabaseAdminClient();
  const isDeveloper = profile?.role === 'developer';

  if (isDeveloper) {
    const { data: feedbackList } = await supabaseAdmin
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });

    return (
      <div className="space-y-12">
        <header>
          <h1 className="heading-1 text-[#1C1C1A] mb-4">Umpan Balik Masuk</h1>
          <p className="text-[#738276]">Daftar saran dan masukan anonim dari para mitra.</p>
        </header>

        <div className="grid gap-6">
          {(feedbackList || []).map((fb) => (
            <div key={fb.id} className="h-card bg-white border-[#E8E8E4]">
              <p className="text-[#1C1C1A] leading-relaxed mb-6 italic">&quot;{fb.content}&quot;</p>
              <div className="flex justify-between items-center border-t border-[#E8E8E4] pt-4">
                <span className="text-[10px] font-medium text-[#738276] uppercase tracking-widest">Anonim</span>
                <span className="text-xs text-[#738276]">{formatDate(fb.created_at)}</span>
              </div>
            </div>
          ))}
          {(!feedbackList || feedbackList.length === 0) && (
            <div className="text-center py-24 bg-[#F5F5F2] rounded-2xl border-2 border-dashed border-[#E8E8E4]">
              <p className="text-[#738276] italic">Belum ada umpan balik yang masuk.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-12">
      <header>
        <h1 className="heading-1 text-[#1C1C1A] mb-4">Kirim Umpan Balik</h1>
        <p className="text-[#738276]">Suara Kamu penting bagi kami. Kirimkan saran atau kendala Kamu secara anonim.</p>
      </header>
      <FeedbackForm />
    </div>
  );
}
