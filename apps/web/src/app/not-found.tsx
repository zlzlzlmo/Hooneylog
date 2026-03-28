import Image from 'next/image';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="w-full flex items-center justify-center py-40">
      <section className="flex flex-col items-center justify-center gap-8">
        <div className="relative w-[300px] h-[120px] sm:w-[500px] sm:h-[200px]">
          <Image 
            src="/images/404.png" 
            fill
            className="object-contain" 
            alt="404 image" 
          />
        </div>
        <div className="text-3xl sm:text-4xl font-bold text-gray-800">
          페이지를 찾을 수 없습니다.
        </div>
        <Link 
          href="/"
          className="mt-4 px-6 py-3 bg-main text-white rounded-lg font-medium hover:bg-opacity-90 transition-colors"
        >
          홈으로 돌아가기
        </Link>
      </section>
    </div>
  );
}
