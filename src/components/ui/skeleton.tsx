import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-md animate-pulse bg-muted/60', className)}
      {...props}
    />
  );
}

function SkeletonCard() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-5 w-1/3" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

function SkeletonTable({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-0">
      {/* header */}
      <div className="flex gap-4 px-4 py-3 border-b border-light">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 px-4 py-3 border-b border-light">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className={`h-4 flex-1 ${c === 0 ? 'w-10' : ''}`} />
          ))}
        </div>
      ))}
    </div>
  );
}

export { Skeleton, SkeletonCard, SkeletonTable };
