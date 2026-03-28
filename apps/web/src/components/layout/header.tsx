import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full h-[56px] bg-white/90 backdrop-blur-md border-b border-notion-border flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-1.5 h-full">
        <Link 
          href="/" 
          className="flex items-center gap-2 h-full px-2 rounded-[4px] hover:bg-notion-hover transition-colors"
        >
          {/* Notion's signature generic icon container */}
          <div className="w-[20px] h-[20px] relative rounded-[3px] overflow-hidden flex items-center justify-center bg-transparent">
             {/* Using an inline SVG roughly resembling a Notion workspace icon */}
             <svg viewBox="0 0 20 20" className="w-[18px] h-[18px] fill-notion-text pointer-events-none" aria-hidden="true">
               <path d="M14.646 1.15A1 1 0 0 0 13.9 1H6.1c-.265 0-.52.105-.707.293L1.293 5.393A1 1 0 0 0 1 6.1v7.8c0 .265.105.52.293.707l4.1 4.1A1 1 0 0 0 6.1 19h7.8c.265 0 .52-.105.707-.293l4.1-4.1A1 1 0 0 0 19 13.9V6.1c0-.265-.105-.52-.293-.707l-4.06-4.243zM6.514 3h6.972l2.828 2.828v.172H3.685v-.172L6.514 3zM3 7v6.972H17V7H3zm.685 8.972v.028h12.63v-.028H3.685zM6.515 17h6.97l2.83-2.828v-.172H3.685v.172L6.515 17z" fillRule="evenodd" clipRule="evenodd"></path>
             </svg>
          </div>
          <span className="font-semibold text-[15px] text-notion-text tracking-tight">HooneyLog</span>
        </Link>
        <div className="h-[20px] w-[1px] bg-notion-border mx-1 hidden sm:block"></div>
      </div>
      
      {/* Theme toggle or extra icons could go here in the future, currently empty to keep it clean */}
      <div className="flex items-center gap-2">
      </div>
    </header>
  );
}
