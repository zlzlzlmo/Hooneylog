import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <section className="container mx-auto flex flex-col items-center justify-center gap-6 py-32 text-center">
      <div className="relative h-[120px] w-[300px] sm:h-[200px] sm:w-[500px]">
        <Image
          src="/images/404.png"
          alt=""
          fill
          priority
          sizes="(min-width: 640px) 500px, 300px"
          className="object-contain"
        />
      </div>
      <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        페이지를 찾을 수 없습니다.
      </h1>
      <p className="text-muted-foreground">주소가 바뀌었거나 삭제된 글일 수 있습니다.</p>
      <Button asChild>
        <Link href="/">홈으로 돌아가기</Link>
      </Button>
    </section>
  );
}
