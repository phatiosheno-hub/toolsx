"use client";

import { useMemo, useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { Button, Card, CopyButton, Field, Input, Select } from "@/components/ui";
import { categories, convert } from "@/lib/units";
import { cn, nf, parseNumber } from "@/lib/utils";

function formatResult(v: number): string {
  if (!Number.isFinite(v)) return "—";
  if (v === 0) return "0";
  const abs = Math.abs(v);
  if (abs >= 1e15 || abs < 1e-6) return v.toExponential(6).replace(".", ",");
  return nf(v, { maximumSignificantDigits: 10 });
}

export default function UnitConverter() {
  const [catId, setCatId] = useState(categories[0].id);
  const category = categories.find((c) => c.id === catId) ?? categories[0];

  const [raw, setRaw] = useState("1");
  const [from, setFrom] = useState(category.units[0].id);
  const [to, setTo] = useState(category.units[2]?.id ?? category.units[1].id);

  const changeCategory = (id: string) => {
    const cat = categories.find((c) => c.id === id);
    if (!cat) return;
    setCatId(id);
    setFrom(cat.units[0].id);
    setTo(cat.units[Math.min(2, cat.units.length - 1)].id);
  };

  const value = parseNumber(raw);
  const result = useMemo(() => (Number.isNaN(value) ? NaN : convert(category, value, from, to)), [category, value, from, to]);

  const fromUnit = category.units.find((u) => u.id === from);
  const toUnit = category.units.find((u) => u.id === to);

  const swap = () => {
    setFrom(to);
    setTo(from);
    if (Number.isFinite(result)) setRaw(String(result).replace(".", ","));
  };

  const resultText = formatResult(result);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => changeCategory(c.id)}
            className={cn(
              "pill cursor-pointer px-3.5 py-1.5 text-sm transition hover:border-emerald-400",
              c.id === catId && "border-emerald-500 bg-emerald-600 text-white hover:border-emerald-600 dark:bg-emerald-600 dark:text-white",
            )}
          >
            {c.name}
          </button>
        ))}
      </div>

      <Card>
        <div className="grid items-end gap-3 md:grid-cols-[1fr_1fr_auto_1fr]">
          <Field label="Nilai">
            <Input
              inputMode="decimal"
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              placeholder="0"
              className="text-lg"
              autoFocus
            />
          </Field>
          <Field label="Dari">
            <Select value={from} onChange={(e) => setFrom(e.target.value)}>
              {category.units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.symbol})
                </option>
              ))}
            </Select>
          </Field>
          <Button variant="secondary" onClick={swap} aria-label="Tukar satuan" className="md:mb-0.5">
            <ArrowLeftRight className="h-4 w-4" />
          </Button>
          <Field label="Ke">
            <Select value={to} onChange={(e) => setTo(e.target.value)}>
              {category.units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.symbol})
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-emerald-50 px-4 py-3 dark:bg-emerald-500/10">
          <div className="min-w-0">
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              {Number.isNaN(value) ? "Masukkan angka" : `${nf(value, { maximumSignificantDigits: 10 })} ${fromUnit?.symbol} =`}
            </div>
            <div className="break-all text-2xl font-bold tabular-nums text-emerald-700 dark:text-emerald-300 sm:text-3xl">
              {resultText} <span className="text-lg font-semibold">{toUnit?.symbol}</span>
            </div>
          </div>
          <CopyButton text={Number.isFinite(result) ? `${resultText} ${toUnit?.symbol}` : ""} />
        </div>
        <p className="mt-2 text-xs text-zinc-500">Gunakan koma atau titik untuk desimal (mis. 1,5 atau 1.5).</p>
      </Card>

      {Number.isFinite(value) && (
        <Card title={`${nf(value, { maximumSignificantDigits: 10 })} ${fromUnit?.symbol} dalam satuan lain`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody>
                {category.units
                  .filter((u) => u.id !== from)
                  .map((u) => (
                    <tr key={u.id} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
                      <td className="py-2 pr-3 text-zinc-600 dark:text-zinc-400">{u.name}</td>
                      <td className="py-2 text-right font-medium tabular-nums">
                        {formatResult(convert(category, value, from, u.id))} <span className="text-zinc-500">{u.symbol}</span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
