/** Gabungkan class Tailwind secara kondisional. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** Format angka dengan locale Indonesia (1.234,5). */
export function nf(value: number, options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat("id-ID", options).format(value);
}

/** Format ukuran file: 1,2 MB, 340 KB, dst. */
export function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes < 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1);
  const v = bytes / Math.pow(k, i);
  return `${nf(v, { maximumFractionDigits: i === 0 ? 0 : decimals })} ${sizes[i]}`;
}

/** Unduh Blob sebagai file. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  downloadUrl(url, filename);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

/** Unduh URL (termasuk data URL) sebagai file. */
export function downloadUrl(url: string, filename: string): void {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/** Hapus ekstensi dari nama file. */
export function stripExtension(name: string): string {
  const idx = name.lastIndexOf(".");
  return idx > 0 ? name.slice(0, idx) : name;
}

/**
 * Parse angka gaya Indonesia maupun internasional.
 * "1.234,5" -> 1234.5 | "1,5" -> 1.5 | "2.5" -> 2.5 | "1.500" -> 1500 (jika opsi idStyle)
 */
export function parseNumber(input: string, idStyle = false): number {
  let s = input.trim().replace(/\s/g, "");
  if (!s) return NaN;
  const hasDot = s.includes(".");
  const hasComma = s.includes(",");
  if (hasDot && hasComma) {
    // Pemisah terakhir dianggap desimal
    if (s.lastIndexOf(",") > s.lastIndexOf(".")) s = s.replace(/\./g, "").replace(",", ".");
    else s = s.replace(/,/g, "");
  } else if (hasComma) {
    s = s.replace(",", ".");
  } else if (hasDot && idStyle) {
    s = s.replace(/\./g, "");
  }
  return Number(s);
}
