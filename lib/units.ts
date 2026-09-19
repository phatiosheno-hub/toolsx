export type Unit = {
  id: string;
  name: string;
  symbol: string;
  /** Faktor pengali ke satuan dasar kategori (tidak dipakai untuk suhu). */
  factor: number;
};

export type Category = {
  id: string;
  name: string;
  units: Unit[];
  /** Konversi khusus (non-linear), mis. suhu. */
  convert?: (value: number, from: string, to: string) => number;
};

function toCelsius(v: number, from: string): number {
  switch (from) {
    case "f":
      return ((v - 32) * 5) / 9;
    case "k":
      return v - 273.15;
    case "r":
      return v * 1.25;
    default:
      return v;
  }
}

function fromCelsius(c: number, to: string): number {
  switch (to) {
    case "f":
      return (c * 9) / 5 + 32;
    case "k":
      return c + 273.15;
    case "r":
      return c * 0.8;
    default:
      return c;
  }
}

export const categories: Category[] = [
  {
    id: "panjang",
    name: "Panjang",
    units: [
      { id: "mm", name: "Milimeter", symbol: "mm", factor: 0.001 },
      { id: "cm", name: "Sentimeter", symbol: "cm", factor: 0.01 },
      { id: "m", name: "Meter", symbol: "m", factor: 1 },
      { id: "km", name: "Kilometer", symbol: "km", factor: 1000 },
      { id: "in", name: "Inci", symbol: "in", factor: 0.0254 },
      { id: "ft", name: "Kaki (feet)", symbol: "ft", factor: 0.3048 },
      { id: "yd", name: "Yard", symbol: "yd", factor: 0.9144 },
      { id: "mi", name: "Mil", symbol: "mi", factor: 1609.344 },
      { id: "nmi", name: "Mil laut", symbol: "nmi", factor: 1852 },
    ],
  },
  {
    id: "massa",
    name: "Berat / Massa",
    units: [
      { id: "mg", name: "Miligram", symbol: "mg", factor: 1e-6 },
      { id: "g", name: "Gram", symbol: "g", factor: 0.001 },
      { id: "ons", name: "Ons (Indonesia, 100 g)", symbol: "ons", factor: 0.1 },
      { id: "kg", name: "Kilogram", symbol: "kg", factor: 1 },
      { id: "kuintal", name: "Kuintal", symbol: "kw", factor: 100 },
      { id: "ton", name: "Ton", symbol: "t", factor: 1000 },
      { id: "oz", name: "Ounce (imperial)", symbol: "oz", factor: 0.028349523125 },
      { id: "lb", name: "Pon (pound)", symbol: "lb", factor: 0.45359237 },
    ],
  },
  {
    id: "suhu",
    name: "Suhu",
    units: [
      { id: "c", name: "Celsius", symbol: "°C", factor: 1 },
      { id: "f", name: "Fahrenheit", symbol: "°F", factor: 1 },
      { id: "k", name: "Kelvin", symbol: "K", factor: 1 },
      { id: "r", name: "Reamur", symbol: "°R", factor: 1 },
    ],
    convert: (v, from, to) => fromCelsius(toCelsius(v, from), to),
  },
  {
    id: "luas",
    name: "Luas",
    units: [
      { id: "cm2", name: "Sentimeter persegi", symbol: "cm²", factor: 0.0001 },
      { id: "m2", name: "Meter persegi", symbol: "m²", factor: 1 },
      { id: "are", name: "Are", symbol: "a", factor: 100 },
      { id: "ha", name: "Hektar", symbol: "ha", factor: 10000 },
      { id: "km2", name: "Kilometer persegi", symbol: "km²", factor: 1e6 },
      { id: "ft2", name: "Kaki persegi", symbol: "ft²", factor: 0.09290304 },
      { id: "acre", name: "Acre", symbol: "ac", factor: 4046.8564224 },
    ],
  },
  {
    id: "volume",
    name: "Volume",
    units: [
      { id: "ml", name: "Mililiter", symbol: "mL", factor: 0.001 },
      { id: "sdt", name: "Sendok teh (5 mL)", symbol: "sdt", factor: 0.005 },
      { id: "sdm", name: "Sendok makan (15 mL)", symbol: "sdm", factor: 0.015 },
      { id: "cup", name: "Cup (US)", symbol: "cup", factor: 0.2365882365 },
      { id: "l", name: "Liter", symbol: "L", factor: 1 },
      { id: "galon", name: "Galon air isi ulang (19 L)", symbol: "galon", factor: 19 },
      { id: "galus", name: "Gallon (US)", symbol: "gal", factor: 3.785411784 },
      { id: "m3", name: "Meter kubik", symbol: "m³", factor: 1000 },
    ],
  },
  {
    id: "kecepatan",
    name: "Kecepatan",
    units: [
      { id: "ms", name: "Meter per detik", symbol: "m/s", factor: 1 },
      { id: "kmh", name: "Kilometer per jam", symbol: "km/jam", factor: 1 / 3.6 },
      { id: "mph", name: "Mil per jam", symbol: "mph", factor: 0.44704 },
      { id: "knot", name: "Knot", symbol: "kn", factor: 0.514444444 },
    ],
  },
  {
    id: "waktu",
    name: "Waktu",
    units: [
      { id: "ms", name: "Milidetik", symbol: "ms", factor: 0.001 },
      { id: "s", name: "Detik", symbol: "dtk", factor: 1 },
      { id: "min", name: "Menit", symbol: "mnt", factor: 60 },
      { id: "h", name: "Jam", symbol: "jam", factor: 3600 },
      { id: "d", name: "Hari", symbol: "hari", factor: 86400 },
      { id: "w", name: "Minggu", symbol: "mgg", factor: 604800 },
      { id: "mo", name: "Bulan (30 hari)", symbol: "bln", factor: 2592000 },
      { id: "y", name: "Tahun (365 hari)", symbol: "thn", factor: 31536000 },
    ],
  },
  {
    id: "data",
    name: "Data Digital",
    units: [
      { id: "bit", name: "Bit", symbol: "b", factor: 0.125 },
      { id: "B", name: "Byte", symbol: "B", factor: 1 },
      { id: "KB", name: "Kilobyte (1000 B)", symbol: "KB", factor: 1e3 },
      { id: "MB", name: "Megabyte (10⁶ B)", symbol: "MB", factor: 1e6 },
      { id: "GB", name: "Gigabyte (10⁹ B)", symbol: "GB", factor: 1e9 },
      { id: "TB", name: "Terabyte (10¹² B)", symbol: "TB", factor: 1e12 },
      { id: "KiB", name: "Kibibyte (1024 B)", symbol: "KiB", factor: 1024 },
      { id: "MiB", name: "Mebibyte (1024²)", symbol: "MiB", factor: 1048576 },
      { id: "GiB", name: "Gibibyte (1024³)", symbol: "GiB", factor: 1073741824 },
    ],
  },
];

export function convert(category: Category, value: number, from: string, to: string): number {
  if (category.convert) return category.convert(value, from, to);
  const f = category.units.find((u) => u.id === from);
  const t = category.units.find((u) => u.id === to);
  if (!f || !t) return NaN;
  return (value * f.factor) / t.factor;
}
