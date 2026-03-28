import Link from 'next/link';

export function Header() {
  return (
    <header className="w-full h-24 text-white bg-main max-mobile:px-5">
      <div className="max-w-[var(--container-max)] w-full h-full mx-auto flex items-center justify-between">
        <Link 
          href="/" 
          className="flex justify-end select-none font-bold cursor-pointer text-[clamp(2rem,3vw,2.5rem)]"
        >
          HooneyLog
        </Link>
      </div>
    </header>
  );
}
