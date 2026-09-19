"use client";

import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button, Card, CopyButton, Stat, Textarea } from "@/components/ui";
import { nf } from "@/lib/utils";

const STOPWORDS = new Set(
  `yang dan di ke dari ini itu untuk dengan pada adalah tidak ada juga akan atau saya kamu dia kami kita mereka
   sebagai oleh dalam karena jika maka bisa dapat sudah telah masih lebih harus agar bahwa saat ketika setelah
   sebelum tapi tetapi namun serta seperti hanya sangat lagi pun para ia nya lah kah the a an and or of to in on
   for is are was were be been it this that with as at by from`
    .split(/\s+/)
    .filter(Boolean),
);

function analyze(text: string) {
  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/) : [];
  const sentences = trimmed ? (trimmed.match(/[^.!?…]+[.!?…]+["'”’)\]]*|[^.!?…]+$/g) ?? []).filter((s) => s.trim()).length : 0;
  const paragraphs = trimmed ? trimmed.split(/\n+/).filter((p) => p.trim()).length : 0;
  const charsNoSpace = text.replace(/\s/g, "").length;

  const freq = new Map<string, number>();
  for (const w of words) {
    const clean = w.toLowerCase().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
    if (clean.length < 2 || STOPWORDS.has(clean) || /^\d+$/.test(clean)) continue;
    freq.set(clean, (freq.get(clean) ?? 0) + 1);
  }
  const top = [...freq.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 10);
  const unique = new Set(words.map((w) => w.toLowerCase().replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "")).filter(Boolean)).size;
  const longest = words.reduce((a, b) => (b.replace(/[^\p{L}\p{N}]/gu, "").length > a.length ? b.replace(/[^\p{L}\p{N}]/gu, "") : a), "");

  return {
    words: words.length,
    chars: text.length,
    charsNoSpace,
    sentences,
    paragraphs,
    unique,
    longest,
    top,
    readMin: words.length / 200,
    speakMin: words.length / 130,
    avgWordLen: words.length ? charsNoSpace / words.length : 0,
  };
}

function formatMinutes(min: number): string {
  if (min === 0) return "0 dtk";
  if (min < 1) return `${Math.max(1, Math.round(min * 60))} dtk`;
  const m = Math.floor(min);
  const s = Math.round((min - m) * 60);
  return s ? `${m} mnt ${s} dtk` : `${m} mnt`;
}

const toTitle = (t: string) => t.toLowerCase().replace(/(^|\s|[-("'])(\p{L})/gu, (m, p, c) => p + c.toUpperCase());
const toSentence = (t: string) => t.toLowerCase().replace(/(^\s*|[.!?]\s+)(\p{L})/gu, (m, p, c) => p + c.toUpperCase());

export default function WordCounter() {
  const [text, setText] = useState("");
  const a = useMemo(() => analyze(text), [text]);

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="space-y-4 lg:col-span-3">
        <Card
          title="Teks"
          action={
            <div className="flex gap-2">
              <CopyButton text={text} />
              <Button size="sm" variant="ghost" onClick={() => setText("")} disabled={!text}>
                <Trash2 className="h-4 w-4" /> Bersihkan
              </Button>
            </div>
          }
        >
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ketik atau tempel teks di sini…"
            className="min-h-[360px] font-sans text-base"
            autoFocus
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="self-center text-xs text-zinc-500">Ubah huruf:</span>
            <Button size="sm" variant="secondary" onClick={() => setText(text.toUpperCase())} disabled={!text}>
              HURUF BESAR
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setText(text.toLowerCase())} disabled={!text}>
              huruf kecil
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setText(toTitle(text))} disabled={!text}>
              Awal Kata Kapital
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setText(toSentence(text))} disabled={!text}>
              Awal kalimat kapital
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setText(text.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim())} disabled={!text}>
              Rapikan spasi
            </Button>
          </div>
        </Card>
      </div>

      <div className="space-y-4 lg:col-span-2">
        <div className="grid grid-cols-2 gap-3">
          <Stat label="Kata" value={nf(a.words)} />
          <Stat label="Karakter" value={nf(a.chars)} sub={`${nf(a.charsNoSpace)} tanpa spasi`} />
          <Stat label="Kalimat" value={nf(a.sentences)} />
          <Stat label="Paragraf" value={nf(a.paragraphs)} />
          <Stat label="Waktu baca" value={formatMinutes(a.readMin)} sub="±200 kata/menit" />
          <Stat label="Waktu bicara" value={formatMinutes(a.speakMin)} sub="±130 kata/menit" />
          <Stat label="Kata unik" value={nf(a.unique)} />
          <Stat label="Rata-rata panjang kata" value={nf(a.avgWordLen, { maximumFractionDigits: 1 })} sub="huruf" />
        </div>

        <Card title="Kata paling sering">
          {a.top.length === 0 ? (
            <p className="text-sm text-zinc-500">Belum ada teks. Kata umum (yang, dan, di, …) tidak dihitung.</p>
          ) : (
            <ul className="space-y-1.5">
              {a.top.map(([w, n]) => (
                <li key={w} className="flex items-center gap-2 text-sm">
                  <span className="w-28 truncate font-medium" title={w}>
                    {w}
                  </span>
                  <span className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <span className="block h-full rounded-full bg-emerald-500" style={{ width: `${(n / a.top[0][1]) * 100}%` }} />
                  </span>
                  <span className="w-10 text-right tabular-nums text-zinc-500">{n}×</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
