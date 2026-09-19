"use client";

import { useMemo, useState } from "react";
import { Alert, Card, Checkbox, CopyButton, Field, Input, Segmented } from "@/components/ui";
import { applyCase, terbilang, type CaseStyle } from "@/lib/terbilang";
import { nf } from "@/lib/utils";

const CASES = [
  { value: "title", label: "Awal Kata Kapital" },
  { value: "sentence", label: "Awal kalimat" },
  { value: "upper", label: "HURUF BESAR" },
  { value: "lower", label: "huruf kecil" },
] as const satisfies ReadonlyArray<{ value: CaseStyle; label: string }>;

const EXAMPLES = ["1.250.000", "17.845", "2.500.000.000", "999,99", "105"];

export default function Terbilang() {
  const [raw, setRaw] = useState("1.250.000");
  const [rupiah, setRupiah] = useState(true);
  const [style, setStyle] = useState<CaseStyle>("title");

  const { text, error, numeric } = useMemo(() => {
    if (!raw.trim()) return { text: "", error: null, numeric: null };
    try {
      const t = applyCase(terbilang(raw, { rupiah }), style);
      const cleaned = raw.trim().replace(/\s/g, "").replace(/^rp\.?/i, "").replace(/\./g, "").replace(",", ".");
      const n = Number(cleaned);
      return { text: t, error: null, numeric: Number.isFinite(n) ? n : null };
    } catch (e) {
      return { text: "", error: e instanceof Error ? e.message : "Input tidak valid.", numeric: null };
    }
  }, [raw, rupiah, style]);

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="lg:col-span-2">
        <Card title="Angka" className="lg:sticky lg:top-20">
          <Field label="Masukkan angka" hint="Titik (.) sebagai pemisah ribuan, koma (,) untuk desimal. Contoh: 1.250.000,50">
            <Input
              inputMode="decimal"
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              placeholder="mis. 1.250.000"
              className="text-lg tabular-nums"
              autoFocus
            />
          </Field>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {EXAMPLES.map((ex) => (
              <button key={ex} type="button" className="pill cursor-pointer hover:border-emerald-400" onClick={() => setRaw(ex)}>
                {ex}
              </button>
            ))}
          </div>

          <div className="mt-5 space-y-3">
            <Checkbox label='Tambahkan kata "rupiah" (dan "sen" untuk desimal)' checked={rupiah} onChange={setRupiah} />
            <Field label="Gaya huruf">
              <Segmented options={CASES} value={style} onChange={setStyle} />
            </Field>
          </div>
        </Card>
      </div>

      <div className="space-y-4 lg:col-span-3">
        <Card title="Terbilang" action={<CopyButton text={text} />}>
          {error ? (
            <Alert>{error}</Alert>
          ) : text ? (
            <>
              <p className="text-balance text-xl font-medium leading-relaxed sm:text-2xl">{text}</p>
              {numeric !== null && (
                <p className="mt-4 text-sm text-zinc-500">
                  {rupiah ? "Rp " : ""}
                  {nf(numeric, { maximumFractionDigits: 2 })}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-zinc-500">Masukkan angka untuk melihat hasil terbilang.</p>
          )}
        </Card>

        <Card title="Catatan penulisan">
          <ul className="list-inside list-disc space-y-1 text-sm text-zinc-600 dark:text-zinc-400">
            <li>Mengikuti kaidah PUEBI: <em>seratus</em>, <em>seribu</em>, <em>sepuluh</em>, <em>sebelas</em>, tetapi <em>satu juta</em> dan <em>satu miliar</em>.</li>
            <li>Pada kwitansi, terbilang biasanya ditulis dengan huruf kapital di awal tiap kata dan diakhiri kata &ldquo;Rupiah&rdquo;.</li>
            <li>Mendukung hingga 999 triliun, bilangan negatif, dan desimal (dibaca &ldquo;koma&rdquo; atau &ldquo;sen&rdquo; pada mode rupiah).</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
