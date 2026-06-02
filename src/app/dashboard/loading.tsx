import { CardSkeleton } from '@/components/Skeleton';

export default function Loading() {
  return (
    <div className="space-y-16 animate-in fade-in duration-500">
      <div className="space-y-4">
        <div className="h-10 w-48 bg-[#F5F5F2] rounded-md animate-pulse" />
        <div className="h-6 w-96 bg-[#F5F5F2] rounded-md animate-pulse" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-[#E8E8E4] pt-16">
        <CardSkeleton />
        <CardSkeleton />
      </div>

      <div className="border-t border-[#E8E8E4] pt-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="h-32 bg-[#F5F5F2] rounded-2xl animate-pulse" />
        <div className="h-32 bg-[#F5F5F2] rounded-2xl animate-pulse" />
        <div className="h-32 bg-[#F5F5F2] rounded-2xl animate-pulse" />
      </div>
    </div>
  );
}
