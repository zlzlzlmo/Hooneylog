export default function HomeLoading() {
  return (
    <div className="w-full flex flex-col items-center animate-pulse">
      {/* Intro Hero Skeleton */}
      <div className="w-full pt-[60px] pb-[40px] px-2 flex flex-col items-start w-full mx-auto">
        <div className="w-[300px] h-[100px] bg-notion-gray-bg rounded-lg mb-8"></div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 w-full mx-auto px-2 items-start mt-8">
        {/* Sidebar Skeleton */}
        <aside className="w-full lg:w-[220px] flex-shrink-0">
          <div className="hidden lg:flex flex-col mb-8 p-4 bg-notion-gray-bg/50 rounded-lg border border-notion-border h-[140px]"></div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-full h-8 bg-notion-gray-bg rounded"></div>
            ))}
          </div>
        </aside>

        {/* Main Content Skeleton */}
        <div className="flex-1 w-full min-w-0">
          <div className="w-full h-10 bg-notion-gray-bg rounded mb-8"></div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-12">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex flex-col">
                <div className="w-full aspect-[4/3] sm:aspect-video bg-notion-gray-bg rounded-[6px] mb-4"></div>
                <div className="w-24 h-3 bg-notion-gray-bg rounded mb-2"></div>
                <div className="w-full h-5 bg-notion-gray-bg rounded mb-2"></div>
                <div className="w-3/4 h-5 bg-notion-gray-bg rounded mb-3"></div>
                <div className="w-full h-4 bg-notion-gray-bg rounded mb-1"></div>
                <div className="w-2/3 h-4 bg-notion-gray-bg rounded mb-4"></div>
                <div className="flex items-center justify-between mt-auto pt-4">
                  <div className="w-12 h-3 bg-notion-gray-bg rounded"></div>
                  <div className="w-16 h-3 bg-notion-gray-bg rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
