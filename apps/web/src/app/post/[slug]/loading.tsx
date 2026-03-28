export default function PostLoading() {
  return (
    <div className="w-full flex flex-col items-center pt-10 pb-20 animate-pulse">
      <div className="w-full max-w-[800px] px-4 sm:px-6 mx-auto flex flex-col">
        {/* Header Skeleton */}
        <div className="w-24 h-6 bg-notion-gray-bg rounded mb-10"></div>
        
        <div className="w-32 h-4 bg-notion-gray-bg rounded mb-4"></div>
        <div className="w-full h-12 bg-notion-gray-bg rounded mb-4"></div>
        <div className="w-3/4 h-12 bg-notion-gray-bg rounded mb-8"></div>
        
        <div className="flex items-center gap-3 mb-12">
          <div className="w-12 h-12 rounded-full bg-notion-gray-bg"></div>
          <div className="flex flex-col gap-2">
            <div className="w-32 h-4 bg-notion-gray-bg rounded"></div>
            <div className="w-24 h-3 bg-notion-gray-bg rounded"></div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="space-y-4">
          <div className="w-full h-4 bg-notion-gray-bg rounded"></div>
          <div className="w-full h-4 bg-notion-gray-bg rounded"></div>
          <div className="w-5/6 h-4 bg-notion-gray-bg rounded"></div>
          <div className="w-full h-4 bg-notion-gray-bg rounded"></div>
          
          <div className="w-full h-64 bg-notion-gray-bg rounded mt-8 mb-8"></div>
          
          <div className="w-full h-4 bg-notion-gray-bg rounded"></div>
          <div className="w-4/5 h-4 bg-notion-gray-bg rounded"></div>
        </div>
      </div>
    </div>
  );
}
