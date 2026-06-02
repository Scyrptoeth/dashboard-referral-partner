import { TableSkeleton } from '@/components/Skeleton';

export default function Loading() {
  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="space-y-4">
        <div className="h-10 w-48 bg-[#F5F5F2] rounded-md animate-pulse" />
        <div className="h-6 w-96 bg-[#F5F5F2] rounded-md animate-pulse" />
      </div>
      
      <section className="bg-white rounded-2xl border border-[#E8E8E4] p-6">
        <TableSkeleton rows={8} cols={5} />
      </section>
    </div>
  );
}
