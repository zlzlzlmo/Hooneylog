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
            alt=""
          />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-notion-text text-center">
          페이지를 찾을 수 없습니다.
        </h1>
        <p className="text-notion-secondary text-center">
          주소가 바뀌었거나 삭제된 글일 수 있습니다.
        </p>
        <Link
          href="/"
          className="mt-2 px-6 py-3 bg-notion-blue-text text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          홈으로 돌아가기
        </Link>
      </section>
    </div>
  );
}
