import { Skeleton } from '@/components/ui/skeleton';

export default function HomeLoading() {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto">
        <div className="mb-12 max-w-2xl space-y-3">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-5 w-full" />
        </div>

        <div className="grid gap-12 lg:grid-cols-[minmax(0,260px)_1fr] lg:gap-16">
          <aside className="space-y-6">
            <div className="flex items-center gap-3">
              <Skeleton className="size-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
            <Skeleton className="h-9 w-full" />
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          </aside>

          <div className="min-w-0 space-y-10">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col gap-5 sm:flex-row sm:gap-8">
                <Skeleton className="aspect-16/9 w-full shrink-0 rounded-lg sm:w-44 md:w-52" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-7 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
