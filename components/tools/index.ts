import dynamic from "next/dynamic";
import type { ComponentType } from "react";

/**
 * Pemetaan slug -> komponen alat.
 * next/dynamic memastikan tiap alat dibundel terpisah dan hanya dimuat saat dibutuhkan.
 */
export const toolComponents: Record<string, ComponentType> = {
  "qr-code": dynamic(() => import("./QrGenerator")),
  "kompres-gambar": dynamic(() => import("./ImageCompressor")),
  password: dynamic(() => import("./PasswordGenerator")),
  "konverter-satuan": dynamic(() => import("./UnitConverter")),
  "penghitung-kata": dynamic(() => import("./WordCounter")),
  terbilang: dynamic(() => import("./Terbilang")),
  "json-formatter": dynamic(() => import("./JsonFormatter")),
  encoder: dynamic(() => import("./Encoder")),
  "kalkulator-usia": dynamic(() => import("./UtilityTools")),
  "angka-romawi": dynamic(() => import("./UtilityTools")),
  ipk: dynamic(() => import("./UtilityTools")),
  "tabungan": dynamic(() => import("./FinanceTools")),
  "diskon-ppn": dynamic(() => import("./FinanceTools")),
  "split-bill": dynamic(() => import("./FinanceTools")),
  "kpr": dynamic(() => import("./FinanceTools")),
  "zakat": dynamic(() => import("./FinanceTools")),
  "pph-21": dynamic(() => import("./FinanceTools")),
};
