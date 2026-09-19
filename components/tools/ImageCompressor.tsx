"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, ImageIcon, LoaderCircle, RefreshCw, Trash2, Upload, X } from "lucide-react";
import { Alert, Button, Card, Field, Input, Select } from "@/components/ui";
import { cn, downloadBlob, formatBytes, nf, stripExtension } from "@/lib/utils";

type Format = "auto" | "jpeg" | "webp" | "png";

type Options = {
  quality: number; // 0.1 - 1
  maxDim: number; // px, Infinity = tidak diubah
  format: Format;
  targetKB: number | null; // null = tanpa target
};

type Result = { blob: Blob; url: string; w: number; h: number; mime: string };

type Item = {
  id: string;
  file: File;
  previewUrl: string;
  status: "pending" | "processing" | "done" | "error";
  original?: { w: number; h: number };
  result?: Result;
  error?: string;
};

const MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const TARGET_PRESETS = [50, 100, 200, 300, 500, 1024];

const MAX_DIM_OPTIONS = [
  { value: Infinity, label: "Ukuran asli" },
  { value: 4096, label: "Maks 4096 px" },
  { value: 2560, label: "Maks 2560 px" },
  { value: 1920, label: "Maks 1920 px (Full HD)" },
  { value: 1280, label: "Maks 1280 px" },
  { value: 1024, label: "Maks 1024 px" },
  { value: 800, label: "Maks 800 px" },
  { value: 600, label: "Maks 600 px" },
];

const DEFAULT_OPTIONS: Options = { quality: 0.8, maxDim: 1920, format: "auto", targetKB: null };

/* ---------- Mesin kompresi (murni di browser) ---------- */

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Gagal membaca gambar. Format mungkin tidak didukung browser (mis. HEIC)."));
    };
    img.src = url;
  });
}

function drawToBlob(img: HTMLImageElement, w: number, h: number, mime: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return reject(new Error("Canvas tidak didukung di browser ini."));
    if (mime === "image/jpeg") {
      // JPEG tidak punya transparansi: isi latar putih agar tidak jadi hitam
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
    }
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(img, 0, 0, w, h);
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Gagal mengonversi gambar."))), mime, quality);
  });
}

async function compressImage(file: File, opts: Options): Promise<Result & { ow: number; oh: number }> {
  const img = await loadImage(file);
  const ow = img.naturalWidth;
  const oh = img.naturalHeight;

  const scale = Math.min(1, opts.maxDim / Math.max(ow, oh));
  let w = Math.max(1, Math.round(ow * scale));
  let h = Math.max(1, Math.round(oh * scale));

  let mime: string;
  if (opts.format === "auto") {
    mime = file.type === "image/png" || file.type === "image/webp" ? file.type : "image/jpeg";
  } else {
    mime = `image/${opts.format}`;
  }

  let quality = opts.quality;
  let blob = await drawToBlob(img, w, h, mime, quality);
  // Browser lama bisa fallback ke PNG jika format tidak didukung (mis. WebP di Safari lama)
  if (blob.type && blob.type !== mime) mime = blob.type;

  const target = opts.targetKB ? opts.targetKB * 1000 : null;
  if (target && blob.size > target) {
    // 1) Cari kualitas tertinggi yang masih di bawah target (binary search)
    if (mime !== "image/png") {
      let lo = 0.05;
      let hi = quality;
      let best: Blob | null = null;
      for (let i = 0; i < 7; i++) {
        const mid = (lo + hi) / 2;
        const b = await drawToBlob(img, w, h, mime, mid);
        if (b.size > target) hi = mid;
        else {
          best = b;
          lo = mid;
        }
      }
      quality = lo;
      blob = best ?? (await drawToBlob(img, w, h, mime, lo));
    }
    // 2) Jika masih terlalu besar, kecilkan dimensi bertahap
    let tries = 0;
    while (blob.size > target && tries < 12 && Math.max(w, h) > 64) {
      const ratio = Math.min(0.9, Math.sqrt(target / blob.size) * 0.95);
      w = Math.max(1, Math.round(w * ratio));
      h = Math.max(1, Math.round(h * ratio));
      blob = await drawToBlob(img, w, h, mime, quality);
      tries++;
    }
  }

  return { blob, url: URL.createObjectURL(blob), w, h, mime, ow, oh };
}

/* ---------- Komponen ---------- */

export default function ImageCompressor() {
  const [items, setItems] = useState<Item[]>([]);
  const [opts, setOpts] = useState<Options>(DEFAULT_OPTIONS);
  const [dragOver, setDragOver] = useState(false);
  const [zipping, setZipping] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemsRef = useRef<Item[]>([]);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const updateItem = useCallback((id: string, patch: Partial<Item>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }, []);

  const processItems = useCallback(
    async (targets: Item[], options: Options) => {
      for (const it of targets) {
        updateItem(it.id, { status: "processing", error: undefined });
        try {
          const r = await compressImage(it.file, options);
          if (it.result) URL.revokeObjectURL(it.result.url);
          updateItem(it.id, {
            status: "done",
            original: { w: r.ow, h: r.oh },
            result: { blob: r.blob, url: r.url, w: r.w, h: r.h, mime: r.mime },
          });
        } catch (e) {
          updateItem(it.id, { status: "error", error: e instanceof Error ? e.message : "Terjadi kesalahan." });
        }
      }
    },
    [updateItem],
  );

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const accepted = Array.from(files).filter((f) => f.type.startsWith("image/"));
      if (accepted.length === 0) {
        setNotice("Tidak ada file gambar yang dikenali. Gunakan JPG, PNG, atau WebP.");
        return;
      }
      setNotice(null);
      const newItems: Item[] = accepted.map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        previewUrl: URL.createObjectURL(file),
        status: "pending",
      }));
      setItems((prev) => [...prev, ...newItems]);
      void processItems(newItems, opts);
    },
    [opts, processItems],
  );

  const reprocessAll = () => void processItems(itemsRef.current, opts);

  const removeItem = (id: string) => {
    setItems((prev) => {
      const it = prev.find((x) => x.id === id);
      if (it) {
        URL.revokeObjectURL(it.previewUrl);
        if (it.result) URL.revokeObjectURL(it.result.url);
      }
      return prev.filter((x) => x.id !== id);
    });
  };

  const clearAll = () => {
    itemsRef.current.forEach((it) => {
      URL.revokeObjectURL(it.previewUrl);
      if (it.result) URL.revokeObjectURL(it.result.url);
    });
    setItems([]);
  };

  // Bersihkan object URL saat komponen dilepas
  useEffect(() => {
    return () => {
      itemsRef.current.forEach((it) => {
        URL.revokeObjectURL(it.previewUrl);
        if (it.result) URL.revokeObjectURL(it.result.url);
      });
    };
  }, []);

  // Dukungan tempel gambar (Ctrl+V)
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const files = Array.from(e.clipboardData?.files ?? []).filter((f) => f.type.startsWith("image/"));
      if (files.length) addFiles(files);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [addFiles]);

  const outputName = (it: Item) => {
    const ext = it.result ? (MIME_EXT[it.result.mime] ?? "jpg") : "jpg";
    return `${stripExtension(it.file.name)}-kompres.${ext}`;
  };

  const downloadOne = (it: Item) => {
    if (it.result) downloadBlob(it.result.blob, outputName(it));
  };

  const downloadAll = async () => {
    const done = items.filter((it) => it.result);
    if (done.length === 0) return;
    if (done.length === 1) return downloadOne(done[0]);
    setZipping(true);
    try {
      const { default: JSZip } = await import("jszip");
      const zip = new JSZip();
      const usedNames = new Set<string>();
      for (const it of done) {
        let name = outputName(it);
        let n = 1;
        while (usedNames.has(name)) name = name.replace(/(\.\w+)$/, `-${n++}$1`);
        usedNames.add(name);
        zip.file(name, it.result!.blob);
      }
      const blob = await zip.generateAsync({ type: "blob" });
      downloadBlob(blob, "gambar-terkompres.zip");
    } finally {
      setZipping(false);
    }
  };

  const doneItems = items.filter((it) => it.status === "done" && it.result);
  const totalOriginal = doneItems.reduce((s, it) => s + it.file.size, 0);
  const totalResult = doneItems.reduce((s, it) => s + (it.result?.blob.size ?? 0), 0);
  const isProcessing = items.some((it) => it.status === "processing" || it.status === "pending");

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* Pengaturan */}
      <div className="lg:col-span-2">
        <Card title="Pengaturan" className="lg:sticky lg:top-20">
          <div className="space-y-5">
            <Field
              label="Target ukuran maksimal"
              hint="Kosongkan jika tidak perlu. Kualitas dan dimensi akan diturunkan otomatis hingga di bawah target."
            >
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  inputMode="numeric"
                  min={10}
                  placeholder="mis. 200"
                  value={opts.targetKB ?? ""}
                  onChange={(e) => setOpts({ ...opts, targetKB: e.target.value ? Math.max(1, Number(e.target.value)) : null })}
                />
                <span className="text-sm text-zinc-500">KB</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {TARGET_PRESETS.map((kb) => (
                  <button
                    key={kb}
                    type="button"
                    className={cn(
                      "pill cursor-pointer hover:border-emerald-400",
                      opts.targetKB === kb && "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
                    )}
                    onClick={() => setOpts({ ...opts, targetKB: opts.targetKB === kb ? null : kb })}
                  >
                    {kb >= 1024 ? "1 MB" : `${kb} KB`}
                  </button>
                ))}
              </div>
            </Field>

            <Field label={`Kualitas: ${Math.round(opts.quality * 100)}%`} hint="Berlaku untuk JPG dan WebP. 70–85% biasanya sudah tidak terlihat bedanya.">
              <input
                type="range"
                min={0.1}
                max={1}
                step={0.05}
                value={opts.quality}
                onChange={(e) => setOpts({ ...opts, quality: Number(e.target.value) })}
              />
            </Field>

            <Field label="Dimensi maksimal" hint="Sisi terpanjang akan dibatasi; rasio gambar tetap dijaga.">
              <Select value={String(opts.maxDim)} onChange={(e) => setOpts({ ...opts, maxDim: Number(e.target.value) })}>
                {MAX_DIM_OPTIONS.map((o) => (
                  <option key={o.label} value={String(o.value)}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Format keluaran">
              <Select value={opts.format} onChange={(e) => setOpts({ ...opts, format: e.target.value as Format })}>
                <option value="auto">Otomatis (ikuti format asli)</option>
                <option value="jpeg">JPG — paling kecil, untuk foto</option>
                <option value="webp">WebP — kecil & modern</option>
                <option value="png">PNG — tanpa kompresi kualitas (untuk logo/transparan)</option>
              </Select>
            </Field>

            <Button variant="secondary" className="w-full" onClick={reprocessAll} disabled={items.length === 0 || isProcessing}>
              <RefreshCw className={cn("h-4 w-4", isProcessing && "animate-spin")} /> Terapkan ulang ke semua gambar
            </Button>
          </div>
        </Card>
      </div>

      {/* Area unggah & hasil */}
      <div className="space-y-4 lg:col-span-3">
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            addFiles(e.dataTransfer.files);
          }}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition",
            dragOver
              ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10"
              : "border-zinc-300 bg-white hover:border-emerald-400 hover:bg-emerald-50/40 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-emerald-500/5",
          )}
        >
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
            <Upload className="h-6 w-6" aria-hidden />
          </span>
          <p className="mt-3 font-medium">Klik untuk pilih gambar, seret ke sini, atau tempel (Ctrl+V)</p>
          <p className="mt-1 text-sm text-zinc-500">JPG, PNG, WebP · Bisa banyak file sekaligus · Tidak diunggah ke mana pun</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>

        {notice && <Alert tone="info">{notice}</Alert>}

        {items.length > 0 && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div>
                <span className="font-medium">{items.length} gambar</span>
                {doneItems.length > 0 && (
                  <span className="text-zinc-500">
                    {" "}
                    · {formatBytes(totalOriginal)} → <span className="font-medium text-emerald-600 dark:text-emerald-400">{formatBytes(totalResult)}</span>{" "}
                    ({totalOriginal > 0 ? `hemat ${nf(Math.max(0, (1 - totalResult / totalOriginal) * 100), { maximumFractionDigits: 0 })}%` : ""})
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={clearAll}>
                  <Trash2 className="h-4 w-4" /> Hapus semua
                </Button>
                <Button size="sm" onClick={downloadAll} disabled={doneItems.length === 0 || zipping}>
                  {zipping ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  {doneItems.length > 1 ? "Unduh semua (ZIP)" : "Unduh"}
                </Button>
              </div>
            </div>

            <ul className="space-y-3">
              {items.map((it) => {
                const saved = it.result ? 1 - it.result.blob.size / it.file.size : 0;
                const overTarget = it.result && opts.targetKB ? it.result.blob.size > opts.targetKB * 1000 : false;
                return (
                  <li key={it.id} className="card flex gap-4 p-4">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={it.result?.url ?? it.previewUrl} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate font-medium" title={it.file.name}>
                          {it.file.name}
                        </p>
                        <button
                          type="button"
                          className="shrink-0 rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
                          onClick={() => removeItem(it.id)}
                          aria-label="Hapus"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="mt-0.5 text-xs text-zinc-500">
                        Asli: {formatBytes(it.file.size)}
                        {it.original && ` · ${it.original.w}×${it.original.h} px`}
                      </p>

                      {it.status === "processing" || it.status === "pending" ? (
                        <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-zinc-500">
                          <LoaderCircle className="h-4 w-4 animate-spin" /> Memproses…
                        </p>
                      ) : it.status === "error" ? (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{it.error}</p>
                      ) : it.result ? (
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                          <span className="text-sm">
                            Hasil: <span className="font-semibold">{formatBytes(it.result.blob.size)}</span>
                            <span className="text-zinc-500">
                              {" "}
                              · {it.result.w}×{it.result.h} px · {MIME_EXT[it.result.mime]?.toUpperCase()}
                            </span>
                          </span>
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-xs font-semibold",
                              saved > 0
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
                            )}
                          >
                            {saved > 0 ? `−${nf(saved * 100, { maximumFractionDigits: 0 })}%` : "tidak lebih kecil"}
                          </span>
                          {overTarget && (
                            <span className="text-xs text-amber-600 dark:text-amber-400">
                              Belum mencapai target — coba format JPG atau target yang lebih longgar.
                            </span>
                          )}
                          <Button size="sm" className="ml-auto" onClick={() => downloadOne(it)}>
                            <Download className="h-4 w-4" /> Unduh
                          </Button>
                        </div>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        {items.length === 0 && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
            <p className="flex items-center gap-2 font-medium text-zinc-800 dark:text-zinc-200">
              <ImageIcon className="h-4 w-4" aria-hidden /> Contoh penggunaan
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Foto KTP/ijazah untuk pendaftaran online yang mensyaratkan maksimal 200 KB → isi target 200 KB.</li>
              <li>Foto dari HP (3–8 MB) untuk dikirim lewat email atau diunggah ke web → batasi dimensi 1920 px, kualitas 80%.</li>
              <li>Logo PNG transparan → pilih format PNG agar transparansi tetap terjaga.</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
