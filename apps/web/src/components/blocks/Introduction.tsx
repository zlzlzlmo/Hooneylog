import Image from 'next/image';
import Link from 'next/link';

export function Introduction() {
  return (
    <div className="w-full pt-[60px] pb-[40px] px-2 flex flex-col items-start w-full mx-auto">
      <Link href="/" className="mb-8 hover:opacity-80 transition-opacity">
        <div className="relative w-[157px] h-[93px]">
          <Image 
            src="/images/tools-and-craft-logo.svg" 
            alt="Tools & Craft" 
            fill 
            className="object-contain"
            priority
          />
        </div>
      </Link>
    </div>
  );
}
