export function Footer() {
  return (
    <footer className="w-full border-t border-notion-border py-12 mt-20 flex flex-col items-center justify-center text-sm text-notion-secondary">
      <div className="flex gap-6 mb-4">
        <a href="#" className="hover:underline">Home</a>
        <a href="#" className="hover:underline">About</a>
        <a href="#" className="hover:underline">Contact</a>
      </div>
      <div className="opacity-70">
        © {new Date().getFullYear()} Seunghoon Shin. All rights reserved.
      </div>
    </footer>
  );
}
