import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-gray-950/80 backdrop-blur-lg sticky top-0 z-50 border-b border-slate-800">
      <nav className="mx-auto max-w-6xl px-4 py-4">
        <Link href="/" className="text-2xl font-bold tracking-wider group">
          <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent group-hover:opacity-80 transition-opacity duration-300">
            DLR
          </span>
        </Link>
      </nav>
    </header>
  );
}
