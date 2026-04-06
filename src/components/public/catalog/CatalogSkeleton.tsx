export const CatalogSkeleton = () => {
  return (
    <div className="w-full space-y-4 animate-pulse">
      {/* Filters Skeleton */}
      <div className="flex gap-2 overflow-x-auto pb-1">
         {Array.from({ length: 4 }).map((_, i) => (
           <div key={i} className="h-8 w-16 bg-white/10 rounded-full shrink-0" />
         ))}
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-1 md:gap-1.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col bg-white/5 rounded-2xl overflow-hidden border border-white/10 h-64">
             <div className="w-full aspect-[4/3] bg-white/10" />
             <div className="p-3 space-y-2">
                <div className="h-3.5 w-3/4 bg-white/10 rounded" />
                <div className="h-2.5 w-1/2 bg-white/5 rounded" />
                <div className="pt-2">
                   <div className="h-6 w-16 bg-white/10 rounded-full" />
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};
