"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Copy, Eye, EyeOff, RefreshCw } from "lucide-react";
import { Alert, Button, Card, Checkbox, Field, Segmented, Select, useCopy } from "@/components/ui";
import { cn, nf } from "@/lib/utils";
import { WORDS } from "@/lib/words";

type Mode = "random" | "passphrase";

const MODES = [
  { value: "random", label: "Acak (kuat)" },
  { value: "passphrase", label: "Frasa (mudah diingat)" },
] as const satisfies ReadonlyArray<{ value: Mode; label: string }>;

const SETS = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  digits: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.<>?/~",
};
const AMBIGUOUS = /[0O1lI|`'"]/g;

/** Bilangan acak aman [0, max) tanpa bias modulo. */
function secureRandom(max: number): number {
  const limit = Math.floor(0x100000000 / max) * max;
  const buf = new Uint32Array(1);
  let x: number;
  do {
    crypto.getRandomValues(buf);
    x = buf[0];
  } while (x >= limit);
  return x % max;
}

function generateRandom(length: number, groups: string[]): string {
  const pool = groups.join("");
  if (!pool) return "";
  for (let attempt = 0; attempt < 100; attempt++) {
    let out = "";
    for (let i = 0; i < length; i++) out += pool[secureRandom(pool.length)];
    // Pastikan tiap kelompok yang dipilih terwakili (jika panjang memungkinkan)
    const ok = length < groups.length || groups.every((g) => [...out].some((c) => g.includes(c)));
    if (ok) return out;
  }
  return "";
}

function generatePassphrase(count: number, sep: string, capitalize: boolean, withNumber: boolean): string {
  const words: string[] = [];
  for (let i = 0; i < count; i++) {
    let w = WORDS[secureRandom(WORDS.length)];
    if (capitalize) w = w[0].toUpperCase() + w.slice(1);
    words.push(w);
  }
  if (withNumber) words.splice(secureRandom(words.length + 1), 0, String(secureRandom(100)).padStart(2, "0"));
  return words.join(sep);
}

function strength(bits: number): { label: string; color: string; pct: number } {
  if (bits < 28) return { label: "Sangat lemah", color: "bg-red-500", pct: 15 };
  if (bits < 40) return { label: "Lemah", color: "bg-orange-500", pct: 35 };
  if (bits < 60) return { label: "Cukup", color: "bg-amber-500", pct: 55 };
  if (bits < 80) return { label: "Kuat", color: "bg-lime-500", pct: 78 };
  return { label: "Sangat kuat", color: "bg-emerald-500", pct: 100 };
}

/** Estimasi waktu tebak (rata-rata) pada 10 miliar percobaan/detik (serangan offline). */
function crackTime(bits: number): string {
  const seconds = Math.pow(2, bits - 1) / 1e10;
  if (seconds < 1) return "kurang dari 1 detik";
  if (seconds < 60) return `${nf(seconds, { maximumFractionDigits: 0 })} detik`;
  if (seconds < 3600) return `${nf(seconds / 60, { maximumFractionDigits: 0 })} menit`;
  if (seconds < 86400) return `${nf(seconds / 3600, { maximumFractionDigits: 0 })} jam`;
  const years = seconds / 31557600;
  if (years < 1) return `${nf(seconds / 86400, { maximumFractionDigits: 0 })} hari`;
  if (years < 1e3) return `${nf(years, { maximumFractionDigits: 0 })} tahun`;
  if (years < 1e6) return `${nf(years / 1e3, { maximumFractionDigits: 0 })} ribu tahun`;
  if (years < 1e9) return `${nf(years / 1e6, { maximumFractionDigits: 0 })} juta tahun`;
  if (years < 1e12) return `${nf(years / 1e9, { maximumFractionDigits: 0 })} miliar tahun`;
  return "lebih dari satu triliun tahun";
}

export default function PasswordGenerator() {
  const [mode, setMode] = useState<Mode>("random");
  const [length, setLength] = useState(16);
  const [useLower, setUseLower] = useState(true);
  const [useUpper, setUseUpper] = useState(true);
  const [useDigits, setUseDigits] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [noAmbiguous, setNoAmbiguous] = useState(false);
  const [count, setCount] = useState(5);

  const [wordCount, setWordCount] = useState(4);
  const [sep, setSep] = useState("-");
  const [capitalize, setCapitalize] = useState(true);
  const [withNumber, setWithNumber] = useState(true);

  const [results, setResults] = useState<string[]>([]);
  const [hidden, setHidden] = useState(false);

  const groups = useMemo(() => {
    const g: string[] = [];
    if (useLower) g.push(SETS.lower);
    if (useUpper) g.push(SETS.upper);
    if (useDigits) g.push(SETS.digits);
    if (useSymbols) g.push(SETS.symbols);
    return noAmbiguous ? g.map((s) => s.replace(AMBIGUOUS, "")).filter(Boolean) : g;
  }, [useLower, useUpper, useDigits, useSymbols, noAmbiguous]);

  const bits = useMemo(() => {
    if (mode === "random") {
      const poolSize = groups.join("").length;
      return poolSize ? length * Math.log2(poolSize) : 0;
    }
    return wordCount * Math.log2(WORDS.length) + (withNumber ? Math.log2(100 * (wordCount + 1)) : 0);
  }, [mode, groups, length, wordCount, withNumber]);

  const generate = useCallback(() => {
    const n = mode === "random" ? count : Math.min(count, 5);
    const out: string[] = [];
    for (let i = 0; i < n; i++) {
      out.push(mode === "random" ? generateRandom(length, groups) : generatePassphrase(wordCount, sep, capitalize, withNumber));
    }
    setResults(out);
  }, [mode, count, length, groups, wordCount, sep, capitalize, withNumber]);

  // Generate saat pertama kali & tiap pengaturan berubah (hanya di klien -> tidak ada masalah hydration)
  useEffect(() => {
    generate();
  }, [generate]);

  const s = strength(bits);
  const noGroup = mode === "random" && groups.length === 0;

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <Card title="Pengaturan" className="lg:sticky lg:top-20">
          <Segmented options={MODES} value={mode} onChange={setMode} className="mb-5 w-full" />

          {mode === "random" ? (
            <div className="space-y-5">
              <Field label={`Panjang: ${length} karakter`}>
                <input type="range" min={6} max={64} value={length} onChange={(e) => setLength(Number(e.target.value))} />
                <div className="mt-1 flex justify-between text-xs text-zinc-500">
                  <span>6</span>
                  <span>Disarankan ≥ 12</span>
                  <span>64</span>
                </div>
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Checkbox label="Huruf kecil (a–z)" checked={useLower} onChange={setUseLower} />
                <Checkbox label="Huruf besar (A–Z)" checked={useUpper} onChange={setUseUpper} />
                <Checkbox label="Angka (0–9)" checked={useDigits} onChange={setUseDigits} />
                <Checkbox label="Simbol (!@#$…)" checked={useSymbols} onChange={setUseSymbols} />
              </div>
              <Checkbox label="Hindari karakter mirip (0 O 1 l I)" checked={noAmbiguous} onChange={setNoAmbiguous} />
              {noGroup && <Alert>Pilih minimal satu jenis karakter.</Alert>}
            </div>
          ) : (
            <div className="space-y-5">
              <Field label={`Jumlah kata: ${wordCount}`}>
                <input type="range" min={3} max={8} value={wordCount} onChange={(e) => setWordCount(Number(e.target.value))} />
              </Field>
              <Field label="Pemisah">
                <Select value={sep} onChange={(e) => setSep(e.target.value)}>
                  <option value="-">Tanda hubung ( - )</option>
                  <option value=".">Titik ( . )</option>
                  <option value="_">Garis bawah ( _ )</option>
                  <option value=" ">Spasi</option>
                  <option value="">Tanpa pemisah</option>
                </Select>
              </Field>
              <Checkbox label="Huruf kapital di awal kata" checked={capitalize} onChange={setCapitalize} />
              <Checkbox label="Sisipkan angka dua digit" checked={withNumber} onChange={setWithNumber} />
              <p className="text-xs text-zinc-500">
                Frasa dibentuk dari {WORDS.length} kata umum bahasa Indonesia. Lebih mudah diingat, tapi untuk akun penting
                gunakan ≥ 5 kata atau mode acak.
              </p>
            </div>
          )}

          <Field label="Jumlah dibuat" className="mt-5">
            <Select value={count} onChange={(e) => setCount(Number(e.target.value))}>
              {[1, 3, 5, 10].map((n) => (
                <option key={n} value={n}>
                  {n} sekaligus
                </option>
              ))}
            </Select>
          </Field>
        </Card>
      </div>

      <div className="space-y-4 lg:col-span-3">
        <Card
          title="Hasil"
          action={
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => setHidden((v) => !v)} aria-label={hidden ? "Tampilkan" : "Sembunyikan"}>
                {hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
              <Button size="sm" onClick={generate} disabled={noGroup}>
                <RefreshCw className="h-4 w-4" /> Buat ulang
              </Button>
            </div>
          }
        >
          <ul className="space-y-2">
            {results.map((pw, i) => (
              <PasswordRow key={`${i}-${pw}`} value={pw} hidden={hidden} primary={i === 0} />
            ))}
          </ul>
        </Card>

        <Card title="Kekuatan">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{s.label}</span>
            <span className="text-zinc-500">≈ {nf(bits, { maximumFractionDigits: 0 })} bit entropi</span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
            <div className={cn("h-full rounded-full transition-all", s.color)} style={{ width: `${s.pct}%` }} />
          </div>
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            Perkiraan waktu tebak dengan serangan brute-force offline (10 miliar percobaan/detik):{" "}
            <span className="font-medium text-zinc-900 dark:text-zinc-100">{crackTime(bits)}</span>.
          </p>
          <ul className="mt-3 list-inside list-disc space-y-1 text-xs text-zinc-500">
            <li>Gunakan sandi berbeda untuk tiap akun, dan simpan di pengelola kata sandi (password manager).</li>
            <li>Aktifkan verifikasi dua langkah (2FA) untuk email, perbankan, dan media sosial.</li>
            <li>Sandi dibuat memakai <code>crypto.getRandomValues</code> di perangkat Anda dan tidak pernah dikirim ke mana pun.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

function PasswordRow({ value, hidden, primary }: { value: string; hidden: boolean; primary: boolean }) {
  const { copied, copy } = useCopy();
  return (
    <li
      className={cn(
        "flex items-center gap-3 rounded-xl border px-3 py-2",
        primary
          ? "border-emerald-300 bg-emerald-50/60 dark:border-emerald-800 dark:bg-emerald-500/5"
          : "border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950",
      )}
    >
      <code className={cn("min-w-0 flex-1 break-all font-mono", primary ? "text-base sm:text-lg" : "text-sm")}>
        {hidden ? "•".repeat(Math.min(value.length, 32)) : value}
      </code>
      <Button size="sm" variant={copied ? "primary" : "secondary"} onClick={() => copy(value)} aria-label="Salin kata sandi">
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        <span className="hidden sm:inline">{copied ? "Tersalin" : "Salin"}</span>
      </Button>
    </li>
  );
}
