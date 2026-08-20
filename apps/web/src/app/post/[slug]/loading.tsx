import { Skeleton } from '@/components/ui/skeleton';

export default function PostLoading() {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="mt-7 mb-6 h-12 w-full max-w-3xl" />

        <div className="flex items-center gap-3">
          <Skeleton className="size-8 rounded-full" />
          <Skeleton className="h-4 w-56" />
        </div>

        <Skeleton className="mt-8 mb-10 h-px w-full md:mb-16" />

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 space-y-4 lg:col-span-8">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="my-8 h-64 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
          <div className="col-span-3 col-start-10 hidden space-y-2 lg:block">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
