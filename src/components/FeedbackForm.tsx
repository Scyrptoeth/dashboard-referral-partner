'use client';

import { useState } from 'react';
import { Send, Loader2, MessageSquare } from 'lucide-react';
import { submitFeedback } from '@/app/actions/mutations';
import { toast } from 'sonner';

export default function FeedbackForm() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);

    const result = await submitFeedback(content);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Pesan Kamu telah terkirim secara anonim.');
      setContent('');
    }
    setLoading(false);
  };

  return (
    <div className="h-card bg-[#F5F5F2] border-none">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#1C1C1A]">
          <MessageSquare size={20} />
        </div>
        <div>
          <h3 className="font-medium text-[#1C1C1A]">Umpan Balik Anonim</h3>
          <p className="text-xs text-[#738276]">Saran atau kendala Kamu terkirim secara anonim.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Tuliskan pesan Kamu di sini..."
          className="h-input min-h-[120px] bg-white border-transparent focus:border-[#1C1C1A] transition-all resize-none"
          required
        />

        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="h-btn w-full bg-[#1C1C1A] text-white hover:bg-[#1C1C1A]/90 border-none disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <>
              <Send size={16} />
              Kirim Pesan
            </>
          )}
        </button>
      </form>
    </div>
  );
}
