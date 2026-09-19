import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { SITE } from "@/lib/site";
import { tools } from "@/lib/tools";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <div className="font-semibold">{SITE.name}</div>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{SITE.tagline}.</p>
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-300">
            <ShieldCheck className="h-4 w-4" aria-hidden />
            Semua proses berjalan di browser Anda. Tidak ada data yang dikirim ke server.
          </p>
        </div>
        <div className="md:col-span-2">
          <div className="text-sm font-medium">Semua alat</div>
          <ul className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm text-zinc-600 sm:grid-cols-3 dark:text-zinc-400">
            {tools.map((t) => (
              <li key={t.slug}>
                <Link href={`/${t.slug}`} className="hover:text-zinc-900 hover:underline dark:hover:text-white">
                  {t.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-zinc-200 py-4 text-center text-xs text-zinc-500 dark:border-zinc-800">
        &copy; <span suppressHydrationWarning>{new Date().getFullYear()}</span> {SITE.name}. Gratis dan open source. Dibuat dengan Next.js, di-deploy di Vercel.
      </div>
    </footer>
  );
}
