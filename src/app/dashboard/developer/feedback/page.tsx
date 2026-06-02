import { formatDate } from '@/lib/utils';
import { MessageSquare, Trash2, CheckCheck } from 'lucide-react';
import { deleteFeedback, markFeedbackAsRead } from '@/app/actions/mutations';
import { createSupabaseAdminClient } from '@/lib/supabase-server';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kotak Masuk | Persiapantubel',
};

export default async function DeveloperFeedbackPage() {
  const supabaseAdmin = createSupabaseAdminClient();

  const { data: feedbackList, error } = await supabaseAdmin
    .from('feedback')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-16 pb-24">
      <header className="max-w-2xl">
        <h1 className="heading-1 text-[#1C1C1A] mb-6">Kotak Masuk</h1>
        <p className="text-lg text-[#738276] leading-relaxed">
          Umpan balik anonim dari para Partner untuk membantu meningkatkan ekosistem Persiapantubel.
        </p>
      </header>

      <section className="border-t border-[#E8E8E4] pt-16">
        {error && <p className="text-[#B94A48]">Gagal memuat feedback: {error.message}</p>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {feedbackList?.map((item) => (
            <div key={item.id} className={`h-card group border-[#E8E8E4] flex flex-col justify-between hover:border-[#1C1C1A]/20 transition-all ${!item.is_read ? 'border-l-4 border-l-[#B94A48]' : ''}`}>
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2 rounded-lg ${!item.is_read ? 'bg-[#B94A48]/10 text-[#B94A48]' : 'bg-[#F5F5F2] text-[#738276]'}`}>
                    <MessageSquare size={18} />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-medium text-[#738276] uppercase tracking-widest">
                      {formatDate(item.created_at)}
                    </span>
                    {!item.is_read && (
                      <span className="text-[8px] font-bold text-[#B94A48] uppercase tracking-tighter bg-[#B94A48]/10 px-1.5 py-0.5 rounded">Baru</span>
                    )}
                  </div>
                </div>
                <p className={`text-[#1C1C1A] leading-relaxed whitespace-pre-wrap ${!item.is_read ? 'font-medium' : ''}`}>
                  {item.content}
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-[#E8E8E4]/50 flex justify-between items-center">
                <div className="flex gap-2">
                  {!item.is_read && (
                    <form action={async () => {
                      'use server';
                      await markFeedbackAsRead(item.id);
                    }}>
                      <button className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-[#738276] hover:text-[#1C1C1A] transition-colors">
                        <CheckCheck size={14} /> Tandai Dibaca
                      </button>
                    </form>
                  )}
                </div>
                <form action={async () => {
                  'use server';
                  await deleteFeedback(item.id);
                }}>
                  <button className="text-[#738276] hover:text-[#B94A48] transition-colors p-2 rounded-full hover:bg-[#B94A48]/5">
                    <Trash2 size={16} />
                  </button>
                </form>
              </div>
            </div>
          ))}

          {feedbackList?.length === 0 && (
            <div className="col-span-full py-24 text-center bg-[#F5F5F2] rounded-3xl border-2 border-dashed border-[#E8E8E4]">
              <p className="text-[#738276] italic">Belum ada umpan balik yang masuk.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
