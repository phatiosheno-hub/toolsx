import {
  Banknote,
  Binary,
  Braces,
  ImageDown,
  KeyRound,
  QrCode,
  Ruler,
  Type,
  type LucideIcon,
  Calculator,
} from "lucide-react";

export type Tool = {
  /** Segmen URL, mis. "qr-code" -> /qr-code */
  slug: string;
  name: string;
  /** Deskripsi singkat (dipakai di kartu & meta description). */
  description: string;
  /** Penjelasan lebih panjang di halaman alat. */
  longDescription: string;
  icon: LucideIcon;
  /** Kata kunci untuk pencarian di halaman utama. */
  keywords: string[];
  /** Class warna ikon (harus ditulis lengkap agar terdeteksi Tailwind). */
  color: string;
};

/**
 * Daftar alat. Untuk menambah alat baru:
 * 1. Tambahkan entri di sini.
 * 2. Buat komponen di components/tools/NamaAlat.tsx.
 * 3. Daftarkan slug -> komponen di components/tools/index.ts.
 */
export const tools: Tool[] = [
  ...([
    ["kalkulator-usia","Kalkulator Usia","Hitung usia dalam tahun, bulan, dan hari.",["usia","umur","tanggal"]],
    ["angka-romawi","Konverter Angka Romawi","Ubah angka menjadi angka Romawi.",["romawi","angka"]],
    ["ipk","Kalkulator IPK","Hitung IPK berbobot berdasarkan nilai dan SKS.",["ipk","nilai","sks"]],
    ["pph-21","Kalkulator PPh 21","Perkirakan PPh 21 bulanan dari penghasilan bruto.",["pajak","gaji","pph"]],
    ["zakat","Kalkulator Zakat","Hitung perkiraan zakat maal 2,5%.",["zakat","maal","sedekah"]],
    ["kpr","Kalkulator KPR & Cicilan","Hitung estimasi cicilan anuitas dan uang muka.",["kpr","kredit","cicilan"]],
    ["split-bill","Split Bill","Bagi tagihan makan secara adil per orang.",["tagihan","patungan","makan"]],
    ["diskon-ppn","Kalkulator Diskon & PPN","Hitung harga akhir setelah diskon dan PPN.",["diskon","ppn","harga"]],
    ["tabungan","Kalkulator Tabungan","Proyeksikan nilai tabungan dengan bunga majemuk.",["tabungan","bunga","investasi"]],
  ] as const).map(([slug,name,description,keywords]) => ({ slug, name, description, longDescription: description, icon: Calculator, keywords: [...keywords], color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" })),

  {
    slug: "qr-code",
    name: "Pembuat QR Code",
    description: "Buat QR code untuk link, teks, WhatsApp, atau WiFi. Unduh PNG/SVG.",
    longDescription:
      "Buat QR code secara instan untuk tautan, teks bebas, chat WhatsApp, atau berbagi WiFi. Atur ukuran, warna, dan tingkat koreksi kesalahan, lalu unduh sebagai PNG atau SVG berkualitas cetak.",
    icon: QrCode,
    keywords: ["qr", "barcode", "whatsapp", "wifi", "link", "url", "menu"],
    color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  },
  {
    slug: "kompres-gambar",
    name: "Kompres Gambar",
    description: "Perkecil ukuran foto ke target KB tertentu (mis. maks 200 KB) untuk pendaftaran online.",
    longDescription:
      "Perkecil ukuran file foto JPG, PNG, atau WebP tanpa mengunggah ke server. Cocok untuk syarat pendaftaran online (CPNS, SNBT, KIP, beasiswa) yang membatasi ukuran file, misalnya maksimal 100 KB atau 200 KB.",
    icon: ImageDown,
    keywords: ["compress", "resize", "foto", "jpg", "png", "webp", "kb", "ukuran", "cpns"],
    color: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  },
  {
    slug: "password",
    name: "Generator Password",
    description: "Buat kata sandi acak yang kuat atau frasa sandi yang mudah diingat.",
    longDescription:
      "Buat kata sandi acak yang aman menggunakan generator kriptografis browser, atau frasa sandi dari kata-kata bahasa Indonesia yang mudah diingat. Dilengkapi indikator kekuatan dan estimasi waktu tebak.",
    icon: KeyRound,
    keywords: ["kata sandi", "sandi", "acak", "random", "aman", "passphrase"],
    color: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  },
  {
    slug: "konverter-satuan",
    name: "Konverter Satuan",
    description: "Konversi panjang, berat, suhu, luas, volume, kecepatan, waktu, dan data.",
    longDescription:
      "Konversi berbagai satuan dengan cepat: panjang, massa, suhu (termasuk Reamur), luas (hektar, are), volume (termasuk galon 19 liter), kecepatan, waktu, dan ukuran data digital.",
    icon: Ruler,
    keywords: ["unit", "konversi", "meter", "kilogram", "celcius", "hektar", "liter", "byte"],
    color: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  },
  {
    slug: "penghitung-kata",
    name: "Penghitung Kata",
    description: "Hitung kata, karakter, kalimat, paragraf, dan estimasi waktu baca.",
    longDescription:
      "Tempel teks untuk menghitung jumlah kata, karakter, kalimat, dan paragraf secara langsung. Lihat estimasi waktu baca, kata yang paling sering muncul, dan ubah huruf besar/kecil dalam sekali klik.",
    icon: Type,
    keywords: ["word counter", "karakter", "kalimat", "paragraf", "esai", "skripsi", "huruf"],
    color: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  },
  {
    slug: "terbilang",
    name: "Terbilang Rupiah",
    description: "Ubah angka menjadi teks terbilang bahasa Indonesia untuk kwitansi & invoice.",
    longDescription:
      "Ubah angka menjadi tulisan terbilang dalam bahasa Indonesia, misalnya 1.250.000 menjadi \u201cSatu Juta Dua Ratus Lima Puluh Ribu Rupiah\u201d. Praktis untuk kwitansi, invoice, nota, dan dokumen resmi.",
    icon: Banknote,
    keywords: ["angka", "huruf", "kwitansi", "invoice", "nota", "rupiah", "uang"],
    color: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
  },
  {
    slug: "json-formatter",
    name: "JSON Formatter",
    description: "Rapikan, validasi, dan minify JSON dengan penanda lokasi error.",
    longDescription:
      "Rapikan (pretty print), validasi, dan perkecil (minify) data JSON. Jika ada kesalahan, lokasi baris dan kolom ditampilkan agar mudah diperbaiki. Bisa juga mengurutkan kunci secara alfabetis.",
    icon: Braces,
    keywords: ["json", "format", "validate", "minify", "beautify", "developer", "api"],
    color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
  },
  {
    slug: "encoder",
    name: "Encoder / Decoder",
    description: "Base64, URL encode, HTML entity, dan file ke Base64 (data URI).",
    longDescription:
      "Encode dan decode teks ke Base64 (mendukung karakter Unicode), URL encoding, dan HTML entity. Bisa juga mengubah file gambar kecil menjadi Base64 data URI untuk disematkan langsung di HTML/CSS.",
    icon: Binary,
    keywords: ["base64", "url encode", "html entity", "decode", "data uri", "developer"],
    color: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-500/15 dark:text-fuchsia-300",
  },
];

export function getTool(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}

/** Alat lain untuk ditampilkan sebagai rekomendasi (berputar sesuai posisi). */
export function relatedTools(slug: string, count = 3): Tool[] {
  const idx = tools.findIndex((t) => t.slug === slug);
  if (idx === -1) return tools.slice(0, count);
  return Array.from({ length: count }, (_, i) => tools[(idx + i + 1) % tools.length]);
}
