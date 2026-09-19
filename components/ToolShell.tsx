import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { relatedTools, type Tool } from "@/lib/tools";
import ToolCard from "./ToolCard";
import { cn } from "@/lib/utils";

export default function ToolShell({ tool, children }: { tool: Tool; children: React.ReactNode }) {
  const Icon = tool.icon;
  const others = relatedTools(tool.slug, 3);

  return (
    <article>
      <nav className="mb-5 text-sm">
        <Link href="/#alat" className="inline-flex items-center gap-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
          <ArrowLeft className="h-4 w-4" aria-hidden /> Semua alat
        </Link>
      </nav>

      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start">
        <span className={cn("inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl", tool.color)}>
          <Icon className="h-7 w-7" aria-hidden />
        </span>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{tool.name}</h1>
          <p className="mt-2 max-w-3xl text-zinc-600 dark:text-zinc-400">{tool.longDescription}</p>
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
            Diproses 100% di browser — file &amp; data Anda tidak pernah diunggah.
          </p>
        </div>
      </header>

      {children}

      <section className="mt-14">
        <h2 className="mb-4 text-lg font-semibold">Alat lainnya</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {others.map((t) => (
            <ToolCard key={t.slug} tool={t} compact />
          ))}
        </div>
      </section>
    </article>
  );
}
