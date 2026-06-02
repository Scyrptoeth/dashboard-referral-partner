'use client';

import { useState, useRef } from 'react';
import { X, Edit3, Loader2 } from 'lucide-react';
import { updateReferral } from '@/app/actions/mutations';
import { toast } from 'sonner';

type Partner = {
  id: string;
  full_name: string;
  whatsapp: string;
};

export default function ReferralEditor({ referral, partners }: { 
  referral: { id: string, pendaftar_name: string, amount: number, partner_id: string, status: string },
  partners: Partner[]
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    const updates = {
      pendaftar_name: formData.get('pendaftar_name') as string,
      amount: Number(formData.get('amount')),
      partner_id: formData.get('partner_id') as string,
    };
    
    const result = await updateReferral(referral.id, updates);
    
    if (result.error) {
      setError(result.error);
      toast.error(result.error);
    } else {
      toast.success('Data rujukan berhasil diperbarui.');
      dialogRef.current?.close();
    }
    setLoading(false);
  };

  if (referral.status === 'settled') return null;

  return (
    <>
      <button 
        onClick={() => dialogRef.current?.showModal()}
        className="p-2 text-[#738276] hover:text-[#1C1C1A] hover:bg-[#F5F5F2] rounded-full transition-all"
        title="Edit Data Rujukan"
      >
        <Edit3 size={14} />
      </button>

      <dialog ref={dialogRef} className="p-0 rounded-2xl bg-white backdrop:bg-black/50 w-full max-w-md m-auto border border-[#E8E8E4] shadow-xl">
        <div className="p-6 text-left">
          <div className="flex justify-between items-center mb-6">
            <h2 className="heading-3 text-[#1C1C1A]">Koreksi Data Rujukan</h2>
            <button type="button" onClick={() => dialogRef.current?.close()} className="text-[#738276] hover:text-[#1C1C1A]">
              <X size={20} />
            </button>
          </div>

          {error && <p className="text-[#B94A48] text-sm mb-4 bg-[#B94A48]/10 p-3 rounded">{error}</p>}

          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#4A4A48] mb-1">Mitra Referral</label>
              <select name="partner_id" defaultValue={referral.partner_id} required className="h-input w-full bg-transparent">
                {partners.map(p => (
                  <option key={p.id} value={p.id}>{p.full_name} ({p.whatsapp})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#4A4A48] mb-1">Nama Pendaftar</label>
              <input 
                type="text" 
                name="pendaftar_name" 
                defaultValue={referral.pendaftar_name}
                required 
                className="h-input w-full bg-transparent" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#4A4A48] mb-1">Nominal Komisi (Rp)</label>
              <input 
                type="number" 
                name="amount" 
                defaultValue={referral.amount}
                required 
                className="h-input w-full bg-transparent" 
              />
            </div>
            <div className="pt-4 flex justify-end gap-3">
              <button type="button" onClick={() => dialogRef.current?.close()} className="px-4 py-2 text-sm font-medium text-[#4A4A48] hover:bg-[#F5F5F2] rounded-full">
                Batal
              </button>
              <button type="submit" disabled={loading} className="h-btn bg-[#1C1C1A] text-white hover:bg-[#1C1C1A]/90 disabled:opacity-50 border-none">
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}
