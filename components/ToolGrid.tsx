"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { tools } from "@/lib/tools";
import ToolCard from "./ToolCard";

export default function ToolGrid() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tools;
    return tools.filter((t) =>
      [t.name, t.description, ...t.keywords].join(" ").toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div id="alat" className="scroll-mt-20">
      <div className="relative mx-auto mb-8 max-w-xl">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" aria-hidden />
        <input
          type="search"
          className="input h-12 rounded-2xl pl-11 pr-10 text-base"
          placeholder="Cari alat… (mis. qr, kompres, rupiah)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Cari alat"
        />
        {query && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
            onClick={() => setQuery("")}
            aria-label="Hapus pencarian"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-zinc-500">
          Tidak ada alat yang cocok dengan &ldquo;{query}&rdquo;.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      )}
    </div>
  );
}
