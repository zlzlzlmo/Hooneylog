import Image from 'next/image';

export function Introduction() {
  return (
    <div className="w-full py-20">
      <section className="flex items-center gap-12 max-mobile:flex-col max-mobile:items-start">
        <div className="w-[12rem] h-[12rem] rounded-full overflow-hidden flex-shrink-0 border border-gray-200">
          <Image 
            src="/images/profile.png"
            alt="프로필 이미지"
            width={192}
            height={192}
            priority
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col">
          <h2 className="text-5xl font-bold mb-4">신승훈 블로그</h2>
          <p className="text-3xl text-black/55">기록과 함께 성장해 나가는 한 프론트엔드개발자의 이야기</p>
        </div>
      </section>
    </div>
  );
}
