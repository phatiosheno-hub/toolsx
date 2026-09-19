import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Tool } from "@/lib/tools";
import { cn } from "@/lib/utils";

export default function ToolCard({ tool, compact = false }: { tool: Tool; compact?: boolean }) {
  const Icon = tool.icon;
  return (
    <Link
      href={`/${tool.slug}`}
      className={cn(
        "group card flex gap-4 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md dark:hover:border-emerald-700",
        compact ? "items-center p-4" : "flex-col",
      )}
    >
      <span className={cn("inline-flex shrink-0 items-center justify-center rounded-xl", tool.color, compact ? "h-10 w-10" : "h-12 w-12")}>
        <Icon className={compact ? "h-5 w-5" : "h-6 w-6"} aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1 font-semibold">
          {tool.name}
          <ArrowRight className="h-4 w-4 -translate-x-1 opacity-0 transition group-hover:translate-x-0 group-hover:opacity-100" aria-hidden />
        </span>
        <span className={cn("mt-1 block text-sm text-zinc-600 dark:text-zinc-400", compact && "line-clamp-1")}>{tool.description}</span>
      </span>
    </Link>
  );
}
