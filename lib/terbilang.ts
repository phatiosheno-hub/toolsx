/**
 * Konversi angka ke kata dalam bahasa Indonesia ("terbilang").
 * Mendukung hingga 999.999.999.999.999 (ratusan triliun), desimal, dan bilangan negatif.
 */

const SATUAN = ["", "satu", "dua", "tiga", "empat", "lima", "enam", "tujuh", "delapan", "sembilan", "sepuluh", "sebelas"];
const SKALA = ["", "ribu", "juta", "miliar", "triliun"];

export const MAX_DIGITS = 15;

/** 0..999 -> kata. */
function ratusan(n: number): string {
  if (n === 0) return "";
  if (n < 12) return SATUAN[n];
  if (n < 20) return `${SATUAN[n - 10]} belas`;
  if (n < 100) {
    const puluh = Math.floor(n / 10);
    const sisa = n % 10;
    return `${SATUAN[puluh]} puluh${sisa ? ` ${SATUAN[sisa]}` : ""}`;
  }
  const ratus = Math.floor(n / 100);
  const sisa = n % 100;
  return `${ratus === 1 ? "seratus" : `${SATUAN[ratus]} ratus`}${sisa ? ` ${ratusan(sisa)}` : ""}`;
}

/** Bilangan bulat (string digit) -> kata. */
export function terbilangBulat(digits: string): string {
  const s = digits.replace(/\D/g, "").replace(/^0+/, "");
  if (!s) return "nol";
  if (s.length > MAX_DIGITS) throw new Error(`Maksimal ${MAX_DIGITS} digit (999 triliun).`);

  // Pecah per tiga digit dari kanan
  const groups: number[] = [];
  let rest = s;
  while (rest.length) {
    groups.unshift(parseInt(rest.slice(-3), 10));
    rest = rest.slice(0, -3);
  }

  const parts: string[] = [];
  groups.forEach((g, i) => {
    const scale = groups.length - 1 - i;
    if (g === 0) return;
    if (scale === 1 && g === 1) {
      parts.push("seribu");
      return;
    }
    parts.push(`${ratusan(g)}${scale ? ` ${SKALA[scale]}` : ""}`);
  });
  return parts.join(" ");
}

export type TerbilangOptions = {
  /** Tambahkan "rupiah" (dan "sen" untuk desimal). */
  rupiah?: boolean;
};

/**
 * Input berupa string angka gaya Indonesia: titik = pemisah ribuan, koma = desimal.
 * Contoh: "1.250.000,50" -> "satu juta dua ratus lima puluh ribu rupiah lima puluh sen"
 */
export function terbilang(input: string, opts: TerbilangOptions = {}): string {
  let s = input.trim().replace(/\s/g, "").replace(/^rp\.?/i, "");
  if (!s) return "";

  const negative = s.startsWith("-");
  if (negative) s = s.slice(1);

  // Buang pemisah ribuan (titik), pisahkan desimal (koma)
  const [intPartRaw, ...decParts] = s.replace(/\./g, "").split(",");
  if (decParts.length > 1) throw new Error("Format angka tidak valid.");
  const intPart = intPartRaw || "0";
  const decPart = decParts[0] ?? "";

  if (!/^\d+$/.test(intPart) || (decPart && !/^\d+$/.test(decPart))) {
    throw new Error("Hanya angka, titik (ribuan), dan koma (desimal) yang diperbolehkan.");
  }

  let words = terbilangBulat(intPart);

  if (opts.rupiah) {
    words += " rupiah";
    if (decPart && /[1-9]/.test(decPart)) {
      const sen = decPart.slice(0, 2).padEnd(2, "0");
      words += ` ${terbilangBulat(sen)} sen`;
    }
  } else if (decPart) {
    words += ` koma ${[...decPart].map((d) => (d === "0" ? "nol" : SATUAN[Number(d)])).join(" ")}`;
  }

  return negative ? `minus ${words}` : words;
}

export type CaseStyle = "title" | "sentence" | "upper" | "lower";

export function applyCase(text: string, style: CaseStyle): string {
  switch (style) {
    case "upper":
      return text.toUpperCase();
    case "lower":
      return text.toLowerCase();
    case "sentence":
      return text.charAt(0).toUpperCase() + text.slice(1);
    default:
      return text.replace(/\b\p{L}/gu, (c) => c.toUpperCase());
  }
}
