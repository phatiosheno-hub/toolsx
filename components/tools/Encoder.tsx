"use client";

import { useMemo, useRef, useState } from "react";
import { ArrowLeftRight, Trash2, Upload } from "lucide-react";
import { Alert, Button, Card, Checkbox, CopyButton, Field, Segmented, Textarea } from "@/components/ui";
import { formatBytes } from "@/lib/utils";

type Kind = "base64" | "url" | "html";
type Direction = "encode" | "decode";

const KINDS = [
  { value: "base64", label: "Base64" },
  { value: "url", label: "URL" },
  { value: "html", label: "HTML Entity" },
] as const satisfies ReadonlyArray<{ value: Kind; label: string }>;

const DIRECTIONS = [
  { value: "encode", label: "Encode" },
  { value: "decode", label: "Decode" },
] as const satisfies ReadonlyArray<{ value: Direction; label: string }>;

/* ---------- Base64 (aman untuk Unicode) ---------- */

function bytesToBase64(bytes: Uint8Array): string {
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(bin);
}

function encodeBase64(text: string, urlSafe: boolean): string {
  const b64 = bytesToBase64(new TextEncoder().encode(text));
  return urlSafe ? b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "") : b64;
}

function decodeBase64(text: string): string {
  let s = text.trim().replace(/\s+/g, "").replace(/-/g, "+").replace(/_/g, "/");
  if (s.length % 4) s += "=".repeat(4 - (s.length % 4));
  const bin = atob(s);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
}

/* ---------- HTML entity ---------- */

const HTML_MAP: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

function encodeHtml(text: string, all: boolean): string {
  const basic = text.replace(/[&<>"']/g, (c) => HTML_MAP[c]);
  if (!all) return basic;
  return basic.replace(/[^\x20-\x7E\n\r\t]/g, (c) => `&#${c.codePointAt(0)};`);
}

function decodeHtml(text: string): string {
  const doc = new DOMParser().parseFromString(`<!doctype html><body>${text}`, "text/html");
  return doc.body.textContent ?? "";
}

/* ---------- Komponen ---------- */

export default function Encoder() {
  const [kind, setKind] = useState<Kind>("base64");
  const [direction, setDirection] = useState<Direction>("encode");
  const [input, setInput] = useState("");
  const [urlSafe, setUrlSafe] = useState(false);
  const [fullUrl, setFullUrl] = useState(false);
  const [htmlAll, setHtmlAll] = useState(false);

  const [fileResult, setFileResult] = useState<{ name: string; size: number; dataUri: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { output, error } = useMemo(() => {
    if (!input) return { output: "", error: null };
    try {
      let out = "";
      if (kind === "base64") out = direction === "encode" ? encodeBase64(input, urlSafe) : decodeBase64(input);
      else if (kind === "url") {
        if (direction === "encode") out = fullUrl ? encodeURI(input) : encodeURIComponent(input);
        else out = fullUrl ? decodeURI(input) : decodeURIComponent(input.replace(/\+/g, "%20"));
      } else out = direction === "encode" ? encodeHtml(input, htmlAll) : decodeHtml(input);
      return { output: out, error: null };
    } catch {
      return {
        output: "",
        error:
          kind === "base64"
            ? "Input bukan Base64 yang valid (atau hasilnya bukan teks UTF-8)."
            : "Input tidak dapat di-decode. Periksa kembali karakter % dan urutannya.",
      };
    }
  }, [input, kind, direction, urlSafe, fullUrl, htmlAll]);

  const swap = () => {
    if (!output) return;
    setInput(output);
    setDirection(direction === "encode" ? "decode" : "encode");
  };

  const onFile = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setFileResult({ name: file.name, size: file.size, dataUri: String(reader.result) });
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-center gap-3">
          <Segmented options={KINDS} value={kind} onChange={setKind} />
          <Segmented options={DIRECTIONS} value={direction} onChange={setDirection} />
          <div className="ml-auto flex flex-wrap items-center gap-4">
            {kind === "base64" && direction === "encode" && (
              <Checkbox label="URL-safe (-_ tanpa =)" checked={urlSafe} onChange={setUrlSafe} />
            )}
            {kind === "url" && <Checkbox label="URL lengkap (biarkan :/?&=)" checked={fullUrl} onChange={setFullUrl} />}
            {kind === "html" && direction === "encode" && (
              <Checkbox label="Encode semua non-ASCII" checked={htmlAll} onChange={setHtmlAll} />
            )}
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-start">
          <Field label={direction === "encode" ? "Teks asli" : `Teks ter-${kind === "url" ? "encode" : kind === "html" ? "encode" : "Base64"}`}>
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={direction === "encode" ? "Halo dunia! Selamat pagi ☀️" : kind === "base64" ? "SGFsbyBkdW5pYSE=" : "Halo%20dunia%21"}
              className="min-h-[260px]"
              spellCheck={false}
              autoFocus
            />
          </Field>
          <div className="flex justify-center lg:pt-8">
            <Button variant="secondary" onClick={swap} disabled={!output} aria-label="Tukar masukan dan hasil" title="Gunakan hasil sebagai masukan">
              <ArrowLeftRight className="h-4 w-4 lg:rotate-0" />
            </Button>
          </div>
          <Field label="Hasil">
            <Textarea value={output} readOnly className="min-h-[260px] bg-zinc-50 dark:bg-zinc-950" placeholder="Hasil akan tampil di sini…" />
          </Field>
        </div>

        {error && (
          <div className="mt-3">
            <Alert>{error}</Alert>
          </div>
        )}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <CopyButton text={output} label="Salin hasil" />
          <Button size="sm" variant="ghost" onClick={() => setInput("")} disabled={!input}>
            <Trash2 className="h-4 w-4" /> Bersihkan
          </Button>
          <span className="ml-auto text-xs text-zinc-500">
            {input.length.toLocaleString("id-ID")} → {output.length.toLocaleString("id-ID")} karakter
          </span>
        </div>
      </Card>

      <Card title="File → Base64 (data URI)">
        <p className="mb-3 text-sm text-zinc-600 dark:text-zinc-400">
          Ubah gambar/ikon kecil menjadi data URI untuk disematkan langsung di HTML, CSS, atau email. Disarankan untuk file &lt; 100 KB.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4" /> Pilih file
          </Button>
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            onChange={(e) => {
              onFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
          {fileResult && (
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              {fileResult.name} · {formatBytes(fileResult.size)} → {formatBytes(fileResult.dataUri.length)} sebagai teks
            </span>
          )}
        </div>
        {fileResult && (
          <div className="mt-3 space-y-2">
            <Textarea value={fileResult.dataUri} readOnly className="min-h-28 text-xs" />
            <div className="flex flex-wrap gap-2">
              <CopyButton text={fileResult.dataUri} label="Salin data URI" />
              <CopyButton text={`<img src="${fileResult.dataUri}" alt="">`} label="Salin sebagai <img>" />
              <Button size="sm" variant="ghost" onClick={() => setFileResult(null)}>
                <Trash2 className="h-4 w-4" /> Hapus
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
