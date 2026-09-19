import Link from "next/link";
import { Wrench } from "lucide-react";
import { SITE } from "@/lib/site";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/80 bg-zinc-50/80 backdrop-blur supports-[backdrop-filter]:bg-zinc-50/60 dark:border-zinc-800 dark:bg-zinc-950/80 dark:supports-[backdrop-filter]:bg-zinc-950/60">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
            <Wrench className="h-4 w-4" aria-hidden />
          </span>
          <span>{SITE.name}</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link href="/#alat" className="btn btn-ghost btn-sm">
            Semua alat
          </Link>
          <Link href="/#tentang" className="btn btn-ghost btn-sm">
            Tentang
          </Link>
        </nav>
      </div>
    </header>
  );
}
