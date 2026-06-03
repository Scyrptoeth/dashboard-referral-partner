'use client';

import { useState, useRef } from 'react';
import { X, Key, ShieldAlert, ShieldCheck, Loader2 } from 'lucide-react';
import { adminUpdatePartner } from '@/app/actions/developer';
import { toast } from 'sonner';

export default function PartnerAdminTools({ partner }: { partner: { id: string, full_name: string, is_active: boolean } }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    
    const result = await adminUpdatePartner(partner.id, { password });
    
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Password berhasil direset.');
      dialogRef.current?.close();
    }
    setLoading(false);
  };

  const handleToggleStatus = async () => {
    setLoading(true);
    const result = await adminUpdatePartner(partner.id, { is_active: !partner.is_active });
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(`Partner ${partner.is_active ? 'dinonaktifkan' : 'diaktifkan'}.`);
    }
    setLoading(false);
  };

  return (
    <>
      <div className="flex items-center gap-3">
        <button 
          onClick={() => dialogRef.current?.showModal()}
          className="p-2 text-[#738276] hover:text-[#1C1C1A] hover:bg-[#F5F5F2] rounded-full transition-all"
          title="Reset Password"
        >
          <Key size={16} />
        </button>
        <button 
          onClick={handleToggleStatus}
          disabled={loading}
          className={`p-2 rounded-full transition-all ${
            partner.is_active 
              ? 'text-[#4A7356] hover:bg-[#4A7356]/10' 
              : 'text-[#B94A48] hover:bg-[#B94A48]/10'
          }`}
          title={partner.is_active ? "Nonaktifkan Partner" : "Aktifkan Partner"}
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : (partner.is_active ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />)}
        </button>
      </div>

      <dialog ref={dialogRef} className="p-0 rounded-2xl bg-white backdrop:bg-black/50 w-full max-w-md m-auto border border-[#E8E8E4] shadow-xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="heading-3 text-[#1C1C1A]">Reset Password</h2>
              <p className="text-xs text-[#738276] mt-1">Partner: {partner.full_name}</p>
            </div>
            <button type="button" onClick={() => dialogRef.current?.close()} className="text-[#738276] hover:text-[#1C1C1A]">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#4A4A48] mb-1">Password Baru</label>
              <input 
                type="text" 
                name="password" 
                required 
                className="h-input w-full bg-transparent" 
                placeholder="Masukkan password manual (Opsi A)" 
              />
            </div>
            <div className="pt-4 flex justify-end gap-3">
              <button type="button" onClick={() => dialogRef.current?.close()} className="px-4 py-2 text-sm font-medium text-[#4A4A48] hover:bg-[#F5F5F2] rounded-full">
                Batal
              </button>
              <button type="submit" disabled={loading} className="h-btn bg-[#1C1C1A] text-white hover:bg-[#1C1C1A]/90 disabled:opacity-50 border-none">
                {loading ? 'Memproses...' : 'Reset Sekarang'}
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}
