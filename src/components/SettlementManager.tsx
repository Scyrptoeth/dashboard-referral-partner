'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle2, Loader2, Search } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { settlePartnerPayments } from '@/app/actions/mutations';
import { toast } from 'sonner';

type Referral = {
  id: string;
  pendaftar_name: string;
  amount: number;
  created_at: string;
};

type PartnerSummary = {
  id: string;
  full_name: string;
  whatsapp: string;
  total_pending: number;
  referrals: Referral[];
};

export default function SettlementManager({ data }: { data: PartnerSummary[] }) {
  const [expandedPartner, setExpandedPartner] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null); // partnerId
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = data.filter(p => 
    p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.whatsapp.includes(searchTerm)
  );

  const handleSettle = async (partner: PartnerSummary) => {
    if (!confirm(`Konfirmasi pembayaran sebesar ${formatCurrency(partner.total_pending)} kepada ${partner.full_name}?`)) return;
    
    setLoading(partner.id);
    const referralIds = partner.referrals.map(r => r.id);
    const result = await settlePartnerPayments(partner.id, referralIds, partner.total_pending);
    
    if (result.error) {
      toast.error('Gagal memproses: ' + result.error);
    } else {
      toast.success('Pembayaran berhasil dicatat.');
    }
    setLoading(null);
  };

  return (
    <div className="space-y-8">
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#738276]" size={18} />
        <input 
          type="text" 
          placeholder="Cari nama mitra atau WhatsApp..." 
          className="h-input pl-12"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {filteredData.map((partner) => (
          <div key={partner.id} className="h-card p-0 overflow-hidden border-[#E8E8E4]">
            {/* Header Partner */}
            <div 
              className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 cursor-pointer hover:bg-[#FDFDFB] transition-colors"
              onClick={() => setExpandedPartner(expandedPartner === partner.id ? null : partner.id)}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#F5F5F2] flex items-center justify-center font-serif text-xl text-[#1C1C1A]">
                  {partner.full_name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-medium text-[#1C1C1A]">{partner.full_name}</h3>
                  <p className="text-sm text-[#738276]">{partner.whatsapp}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-8 w-full sm:w-auto justify-between sm:justify-end">
                <div className="text-right">
                  <p className="text-[10px] font-medium text-[#738276] uppercase tracking-[0.2em] mb-1">Piutang</p>
                  <p className="font-serif text-xl text-[#B94A48]">{formatCurrency(partner.total_pending)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button 
                    disabled={loading === partner.id}
                    onClick={(e) => { e.stopPropagation(); handleSettle(partner); }}
                    className="h-btn py-2 px-4 text-xs flex items-center gap-2 bg-[#1C1C1A] text-white hover:bg-[#1C1C1A]/90 border-none disabled:opacity-50"
                  >
                    {loading === partner.id ? <Loader2 className="animate-spin" size={14} /> : <CheckCircle2 size={14} />}
                    Cairkan
                  </button>
                  {expandedPartner === partner.id ? <ChevronUp size={20} className="text-[#738276]" /> : <ChevronDown size={20} className="text-[#738276]" />}
                </div>
              </div>
            </div>

            {/* Detail Referrals (Accordion) */}
            {expandedPartner === partner.id && (
              <div className="bg-[#FDFDFB] border-t border-[#E8E8E4] p-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <h4 className="text-xs font-medium text-[#738276] uppercase tracking-widest mb-4">Rincian Rujukan yang Belum Dibayar</h4>
                <div className="space-y-3">
                  {partner.referrals.map((ref) => (
                    <div key={ref.id} className="flex justify-between items-center text-sm py-2 border-b border-[#E8E8E4]/50 last:border-none">
                      <div>
                        <p className="text-[#1C1C1A] font-medium">{ref.pendaftar_name}</p>
                        <p className="text-[10px] text-[#738276]">{formatDate(ref.created_at)}</p>
                      </div>
                      <p className="text-[#1C1C1A]">{formatCurrency(ref.amount)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {filteredData.length === 0 && (
          <div className="text-center py-24 bg-[#F5F5F2] rounded-2xl border-2 border-dashed border-[#E8E8E4]">
            <p className="text-[#738276] italic">Tidak ada mitra dengan piutang tertunda.</p>
          </div>
        )}
      </div>
    </div>
  );
}
