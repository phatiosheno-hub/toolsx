"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Download, Trash2, WandSparkles } from "lucide-react";
import { Alert, Button, Card, Checkbox, CopyButton, Select, Textarea } from "@/components/ui";
import { downloadBlob, formatBytes } from "@/lib/utils";

type Indent = "2" | "4" | "tab" | "min";

const SAMPLE = `{"nama":"Budi Santoso","umur":29,"kota":"Malang","aktif":true,"hobi":["membaca","bersepeda"],"alamat":{"jalan":"Jl. Ijen No. 12","kodePos":"65119"},"catatan":null}`;

function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value as Record<string, unknown>)
        .sort((a, b) => a.localeCompare(b))
        .map((k) => [k, sortKeysDeep((value as Record<string, unknown>)[k])]),
    );
  }
  return value;
}

/** Ambil posisi error dari pesan JSON.parse (V8: "at position N", Firefox: "line X column Y"). */
function locateError(message: string, source: string): string | null {
  const pos = /position (\d+)/i.exec(message);
  if (pos) {
    const idx = Number(pos[1]);
    const before = source.slice(0, idx);
    const line = before.split("\n").length;
    const col = idx - before.lastIndexOf("\n");
    return `baris ${line}, kolom ${col}`;
  }
  const lc = /line (\d+) column (\d+)/i.exec(message);
  if (lc) return `baris ${lc[1]}, kolom ${lc[2]}`;
  return null;
}

const TOKEN_RE = /("(?:\\.|[^"\\])*")(\s*:)?|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|(true|false)|(null)|([{}[\],:])|(\s+)/g;

/** Pewarnaan sintaks sederhana untuk output JSON yang sudah valid. */
function highlight(json: string): ReactNode[] {
  const out: ReactNode[] = [];
  let m: RegExpExecArray | null;
  let i = 0;
  TOKEN_RE.lastIndex = 0;
  while ((m = TOKEN_RE.exec(json))) {
    const [full, str, colon, num, bool, nul] = m;
    if (str) {
      out.push(
        <span key={i++} className={colon ? "text-sky-700 dark:text-sky-300" : "text-emerald-700 dark:text-emerald-300"}>
          {str}
        </span>,
      );
      if (colon) out.push(colon);
    } else if (num) out.push(<span key={i++} className="text-amber-700 dark:text-amber-300">{num}</span>);
    else if (bool) out.push(<span key={i++} className="text-violet-700 dark:text-violet-300">{bool}</span>);
    else if (nul) out.push(<span key={i++} className="text-zinc-500 italic">{nul}</span>);
    else out.push(full);
  }
  return out;
}

function describe(value: unknown): string {
  if (Array.isArray(value)) return `Array dengan ${value.length} elemen`;
  if (value && typeof value === "object") return `Object dengan ${Object.keys(value).length} kunci`;
  return `Nilai ${value === null ? "null" : typeof value}`;
}

export default function JsonFormatter() {
  const [input, setInput] = useState("");
  const [indent, setIndent] = useState<Indent>("2");
  const [sortKeys, setSortKeys] = useState(false);

  const { output, error, location, info } = useMemo(() => {
    if (!input.trim()) return { output: "", error: null, location: null, info: null };
    try {
      let parsed: unknown = JSON.parse(input);
      if (sortKeys) parsed = sortKeysDeep(parsed);
      const space = indent === "min" ? undefined : indent === "tab" ? "\t" : Number(indent);
      const out = JSON.stringify(parsed, null, space);
      return { output: out, error: null, location: null, info: describe(parsed) };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "JSON tidak valid";
      return { output: "", error: msg, location: locateError(msg, input), info: null };
    }
  }, [input, indent, sortKeys]);

  const highlighted = useMemo(() => (output && output.length < 200_000 ? highlight(output) : output), [output]);

  const download = () => {
    if (output) downloadBlob(new Blob([output], { type: "application/json" }), "data.json");
  };

  const inputBytes = new TextEncoder().encode(input).length;
  const outputBytes = new TextEncoder().encode(output).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={indent} onChange={(e) => setIndent(e.target.value as Indent)} className="w-auto">
          <option value="2">Indentasi 2 spasi</option>
          <option value="4">Indentasi 4 spasi</option>
          <option value="tab">Indentasi tab</option>
          <option value="min">Minify (satu baris)</option>
        </Select>
        <Checkbox label="Urutkan kunci A→Z" checked={sortKeys} onChange={setSortKeys} />
        <div className="ml-auto flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => setInput(SAMPLE)}>
            <WandSparkles className="h-4 w-4" /> Contoh
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setInput("")} disabled={!input}>
            <Trash2 className="h-4 w-4" /> Bersihkan
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Masukan" action={<span className="text-xs text-zinc-500">{formatBytes(inputBytes)}</span>}>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='{"contoh": true}'
            className="min-h-[420px]"
            spellCheck={false}
            autoFocus
          />
          {error && (
            <div className="mt-3">
              <Alert>
                <strong>JSON tidak valid</strong>
                {location && <> — {location}</>}
                <div className="mt-1 break-words font-mono text-xs opacity-80">{error}</div>
              </Alert>
            </div>
          )}
          {info && (
            <div className="mt-3">
              <Alert tone="success">Valid · {info}</Alert>
            </div>
          )}
        </Card>

        <Card
          title="Hasil"
          action={
            <div className="flex items-center gap-2">
              {output && <span className="text-xs text-zinc-500">{formatBytes(outputBytes)}</span>}
              <Button size="sm" variant="secondary" onClick={download} disabled={!output}>
                <Download className="h-4 w-4" /> .json
              </Button>
              <CopyButton text={output} />
            </div>
          }
        >
          <pre className="input min-h-[420px] overflow-auto whitespace-pre font-mono text-sm leading-relaxed">
            {output ? highlighted : <span className="text-zinc-400">Hasil akan tampil di sini…</span>}
          </pre>
        </Card>
      </div>
    </div>
  );
}
