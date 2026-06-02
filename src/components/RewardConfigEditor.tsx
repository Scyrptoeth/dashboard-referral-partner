'use client';

import { useState, useRef } from 'react';
import { Settings, X } from 'lucide-react';
import { updateRewardConfigs } from '@/app/actions/mutations';
import { toast } from 'sonner';

type RewardConfig = {
  rank: number;
  percentage: number;
  description: string | null;
};

export default function RewardConfigEditor({ configs }: { configs: RewardConfig[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [localConfigs, setLocalConfigs] = useState(configs);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await updateRewardConfigs(localConfigs);
    
    if (result.error) {
      setError(result.error);
      toast.error(result.error);
    } else {
      toast.success('Konfigurasi reward berhasil diperbarui.');
      dialogRef.current?.close();
    }
    setLoading(false);
  };

  const handlePercentageChange = (rank: number, val: string) => {
    const numVal = parseFloat(val) || 0;
    setLocalConfigs(prev => prev.map(c => c.rank === rank ? { ...c, percentage: numVal } : c));
  };

  return (
    <>
      <button 
        onClick={() => dialogRef.current?.showModal()}
        className="h-card text-left group hover:border-[#1C1C1A] transition-colors"
      >
        <h3 className="font-medium text-[#1C1C1A] mb-2">Konfigurasi Reward</h3>
        <p className="text-sm text-[#738276] mb-6">Sesuaikan persentase bonus untuk Top 5 Partner di Leaderboard.</p>
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#F5F5F2] group-hover:bg-[#1C1C1A] group-hover:text-white transition-colors">
          <Settings size={16} />
        </span>
      </button>

      <dialog ref={dialogRef} className="p-0 rounded-2xl bg-white backdrop:bg-black/50 w-full max-w-md m-auto border border-[#E8E8E4] shadow-xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="heading-3 text-[#1C1C1A]">Pengaturan Reward</h2>
            <button type="button" onClick={() => { dialogRef.current?.close(); setError(''); }} className="text-[#738276] hover:text-[#1C1C1A]">
              <X size={20} />
            </button>
          </div>

          {error && <p className="text-[#B94A48] text-sm mb-4 bg-[#B94A48]/10 p-3 rounded">{error}</p>}

          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="space-y-4">
              {localConfigs.sort((a, b) => a.rank - b.rank).map((config) => (
                <div key={config.rank} className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#1C1C1A]">Peringkat {config.rank}</p>
                    <p className="text-xs text-[#738276]">{config.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      step="0.01"
                      value={config.percentage}
                      onChange={(e) => handlePercentageChange(config.rank, e.target.value)}
                      className="h-input w-20 text-center bg-transparent"
                    />
                    <span className="text-sm text-[#738276]">%</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button type="button" onClick={() => { dialogRef.current?.close(); setError(''); }} className="px-4 py-2 text-sm font-medium text-[#4A4A48] hover:bg-[#F5F5F2] rounded-full transition-colors">
                Batal
              </button>
              <button type="submit" disabled={loading} className="h-btn bg-[#1C1C1A] text-white hover:bg-[#1C1C1A]/90 disabled:opacity-50 border-none">
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </>
  );
}
