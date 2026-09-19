# Alatku — Kumpulan Alat Online Gratis

Aplikasi web berisi alat-alat praktis yang **berjalan 100% di browser** (tanpa backend, tanpa database, tanpa upload).
Dibangun dengan **Next.js 16 (App Router) + TypeScript + Tailwind CSS v4**, siap di-deploy ke **Vercel** dalam satu klik.

## Alat yang tersedia

| Alat | URL | Kegunaan |
| --- | --- | --- |
| Pembuat QR Code | `/qr-code` | QR untuk link/teks, chat WhatsApp (`wa.me`), dan berbagi WiFi. Unduh PNG/SVG, atur warna & ukuran. |
| Kompres Gambar | `/kompres-gambar` | Perkecil foto ke **target KB tertentu** (mis. maks 200 KB untuk CPNS/SNBT/KIP), batasi dimensi, ubah format, unduh ZIP. |
| Generator Password | `/password` | Sandi acak kriptografis atau frasa sandi berbahasa Indonesia, lengkap dengan indikator kekuatan. |
| Konverter Satuan | `/konverter-satuan` | Panjang, berat (termasuk ons Indonesia & kuintal), suhu (termasuk Reamur), luas (hektar/are), volume (galon 19 L), kecepatan, waktu, data. |
| Penghitung Kata | `/penghitung-kata` | Kata, karakter, kalimat, paragraf, waktu baca, kata terbanyak, ubah huruf besar/kecil. |
| Terbilang Rupiah | `/terbilang` | Angka → teks terbilang bahasa Indonesia sesuai PUEBI untuk kwitansi/invoice. |
| JSON Formatter | `/json-formatter` | Rapikan, minify, validasi (dengan lokasi baris/kolom error), urutkan kunci. |
| Encoder / Decoder | `/encoder` | Base64 (Unicode-safe), URL encode, HTML entity, file → data URI. |

Fitur tambahan: SEO metadata per halaman, `sitemap.xml`, `robots.txt`, gambar Open Graph otomatis, web manifest (PWA-ready), dark mode otomatis, dan security headers.

## Menjalankan secara lokal

```bash
npm install
npm run dev
# buka http://localhost:3000
```

Perintah lain:

```bash
npm run build      # build produksi
npm run start      # jalankan hasil build
npm run typecheck  # cek TypeScript
```

## Deploy ke Vercel

### Cara 1 — lewat GitHub (disarankan)

1. Push folder ini ke repository GitHub/GitLab/Bitbucket.
2. Buka [vercel.com/new](https://vercel.com/new), pilih repository tersebut.
3. Vercel otomatis mendeteksi Next.js. Klik **Deploy** — tidak perlu konfigurasi apa pun.
4. Setiap `git push` ke branch utama akan otomatis men-deploy ulang.

### Cara 2 — lewat Vercel CLI

```bash
npm i -g vercel
vercel          # preview
vercel --prod   # produksi
```

### Environment variable (opsional)

| Nama | Keterangan |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | URL publik situs, mis. `https://alatku.vercel.app`. Dipakai untuk canonical URL, sitemap, dan Open Graph. Jika kosong, otomatis memakai domain produksi Vercel. |

Lihat `.env.example`.

## Struktur proyek

```
app/
  layout.tsx            # layout utama + metadata global
  page.tsx              # beranda (daftar & pencarian alat)
  [slug]/page.tsx       # halaman tiap alat (SSG dari registry)
  sitemap.ts, robots.ts, manifest.ts, opengraph-image.tsx, icon.svg
  globals.css           # Tailwind v4 + kelas komponen (.btn, .card, .input, ...)
components/
  ui.tsx                # komponen UI kecil (Button, Input, Select, CopyButton, ...)
  Header.tsx, Footer.tsx, ToolCard.tsx, ToolGrid.tsx, ToolShell.tsx
  tools/
    index.ts            # pemetaan slug -> komponen (dimuat dinamis per halaman)
    QrGenerator.tsx, ImageCompressor.tsx, PasswordGenerator.tsx, UnitConverter.tsx,
    WordCounter.tsx, Terbilang.tsx, JsonFormatter.tsx, Encoder.tsx
lib/
  tools.ts              # REGISTRY alat (nama, deskripsi, ikon, kata kunci)
  terbilang.ts, units.ts, words.ts, utils.ts, site.ts
```

## Menambah alat baru

1. **Daftarkan** di `lib/tools.ts` — tambahkan objek baru ke array `tools` (slug, nama, deskripsi, ikon dari `lucide-react`, kata kunci, warna).
2. **Buat komponen** di `components/tools/NamaAlat.tsx` dengan `"use client";` di baris pertama. Gunakan komponen dari `components/ui.tsx` agar tampilan konsisten.
3. **Petakan** slug ke komponen di `components/tools/index.ts`:
   ```ts
   "nama-alat": dynamic(() => import("./NamaAlat")),
   ```

Selesai — halaman `/nama-alat`, kartu di beranda, sitemap, dan footer akan otomatis ikut ter-update.

## Prinsip

- **Privasi**: tidak ada data pengguna yang meninggalkan perangkat. Tidak ada analytics bawaan.
- **Tanpa biaya server**: seluruh halaman statis (SSG), sehingga gratis di-hosting di Vercel Hobby plan.
- **Ringan**: tiap alat dibundel terpisah dan hanya dimuat saat halamannya dibuka.

## Lisensi

MIT — bebas digunakan, dimodifikasi, dan disebarluaskan.
