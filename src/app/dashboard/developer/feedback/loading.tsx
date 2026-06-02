import { CardSkeleton } from '@/components/Skeleton';

export default function Loading() {
  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="space-y-4">
        <div className="h-10 w-48 bg-[#F5F5F2] rounded-md animate-pulse" />
        <div className="h-6 w-96 bg-[#F5F5F2] rounded-md animate-pulse" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-12 border-t border-[#E8E8E4]">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
