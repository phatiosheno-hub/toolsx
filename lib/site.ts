/**
 * Konfigurasi identitas situs. Ubah sesuai kebutuhan.
 */
function resolveSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export const SITE = {
  name: "Alatku",
  tagline: "Alat online gratis untuk kebutuhan sehari-hari",
  description:
    "Kumpulan alat online gratis: pembuat QR code, kompres gambar, generator password, konverter satuan, penghitung kata, terbilang rupiah, JSON formatter, dan encoder. Semua diproses di browser — cepat, privat, tanpa upload ke server.",
  url: resolveSiteUrl(),
  locale: "id_ID",
};
