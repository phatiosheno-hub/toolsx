"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import { Check, Copy, Download } from "lucide-react";
import { Alert, Button, Card, Checkbox, Field, Input, Segmented, Select, Textarea } from "@/components/ui";
import { downloadBlob, downloadUrl } from "@/lib/utils";

type Mode = "text" | "whatsapp" | "wifi";
type Level = "L" | "M" | "Q" | "H";
type WifiEnc = "WPA" | "WEP" | "nopass";

const MODES = [
  { value: "text", label: "Teks / Link" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "wifi", label: "WiFi" },
] as const satisfies ReadonlyArray<{ value: Mode; label: string }>;

/** Escape karakter khusus pada format WIFI: sesuai spesifikasi. */
function escapeWifi(value: string): string {
  return value.replace(/([\\;,":])/g, "\\$1");
}

/** Normalisasi nomor HP Indonesia ke format internasional tanpa tanda plus (08xx -> 628xx). */
function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("0")) return "62" + digits.slice(1);
  if (digits.startsWith("8")) return "62" + digits;
  return digits;
}

export default function QrGenerator() {
  const [mode, setMode] = useState<Mode>("text");
  const [text, setText] = useState("");
  const [waPhone, setWaPhone] = useState("");
  const [waMessage, setWaMessage] = useState("");
  const [ssid, setSsid] = useState("");
  const [wifiPass, setWifiPass] = useState("");
  const [wifiEnc, setWifiEnc] = useState<WifiEnc>("WPA");
  const [wifiHidden, setWifiHidden] = useState(false);

  const [size, setSize] = useState(320);
  const [level, setLevel] = useState<Level>("M");
  const [margin, setMargin] = useState(2);
  const [fg, setFg] = useState("#000000");
  const [bg, setBg] = useState("#ffffff");

  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const payload = useMemo(() => {
    switch (mode) {
      case "whatsapp": {
        const phone = normalizePhone(waPhone);
        if (!phone) return "";
        const msg = waMessage.trim() ? `?text=${encodeURIComponent(waMessage.trim())}` : "";
        return `https://wa.me/${phone}${msg}`;
      }
      case "wifi": {
        if (!ssid.trim()) return "";
        const parts = [`T:${wifiEnc}`, `S:${escapeWifi(ssid)}`];
        if (wifiEnc !== "nopass") parts.push(`P:${escapeWifi(wifiPass)}`);
        if (wifiHidden) parts.push("H:true");
        return `WIFI:${parts.join(";")};;`;
      }
      default:
        return text.trim();
    }
  }, [mode, text, waPhone, waMessage, ssid, wifiPass, wifiEnc, wifiHidden]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!payload) {
      setError(null);
      return;
    }
    let cancelled = false;
    QRCode.toCanvas(canvas, payload, {
      width: size,
      margin,
      errorCorrectionLevel: level,
      color: { dark: fg, light: bg },
    })
      .then(() => !cancelled && setError(null))
      .catch((e: Error) => {
        if (cancelled) return;
        setError(
          /too big|too long|amount of data/i.test(e.message)
            ? "Isi terlalu panjang untuk satu QR code. Persingkat teks atau turunkan tingkat koreksi kesalahan."
            : e.message,
        );
      });
    return () => {
      cancelled = true;
    };
  }, [payload, size, margin, level, fg, bg]);

  const fileBase = `qr-${mode}`;

  const downloadPng = () => {
    const canvas = canvasRef.current;
    if (!canvas || !payload) return;
    downloadUrl(canvas.toDataURL("image/png"), `${fileBase}.png`);
  };

  const downloadSvg = async () => {
    if (!payload) return;
    const svg = await QRCode.toString(payload, {
      type: "svg",
      width: size,
      margin,
      errorCorrectionLevel: level,
      color: { dark: fg, light: bg },
    });
    downloadBlob(new Blob([svg], { type: "image/svg+xml" }), `${fileBase}.svg`);
  };

  const copyImage = () => {
    const canvas = canvasRef.current;
    if (!canvas || !payload) return;
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      try {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } catch {
        setError("Browser tidak mendukung salin gambar. Silakan unduh PNG.");
      }
    }, "image/png");
  };

  const ready = Boolean(payload) && !error;

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      {/* Panel input */}
      <div className="space-y-6 lg:col-span-3">
        <Card title="Isi QR Code">
          <Segmented options={MODES} value={mode} onChange={setMode} className="mb-4" />

          {mode === "text" && (
            <Field label="Teks atau link" hint="Bisa berupa URL, nomor telepon, alamat email, atau teks bebas.">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="https://contoh.id/menu"
                className="min-h-28 font-sans"
                autoFocus
              />
            </Field>
          )}

          {mode === "whatsapp" && (
            <div className="space-y-4">
              <Field label="Nomor WhatsApp" hint="Format 08xx atau 62xx. Otomatis dikonversi ke format internasional.">
                <Input
                  inputMode="tel"
                  value={waPhone}
                  onChange={(e) => setWaPhone(e.target.value)}
                  placeholder="0812 3456 7890"
                />
              </Field>
              <Field label="Pesan awal (opsional)">
                <Textarea
                  value={waMessage}
                  onChange={(e) => setWaMessage(e.target.value)}
                  placeholder="Halo, saya ingin bertanya tentang…"
                  className="min-h-24 font-sans"
                />
              </Field>
            </div>
          )}

          {mode === "wifi" && (
            <div className="space-y-4">
              <Field label="Nama WiFi (SSID)">
                <Input value={ssid} onChange={(e) => setSsid(e.target.value)} placeholder="WiFi Warung Bu Sri" />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Keamanan">
                  <Select value={wifiEnc} onChange={(e) => setWifiEnc(e.target.value as WifiEnc)}>
                    <option value="WPA">WPA / WPA2 / WPA3</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">Tanpa kata sandi</option>
                  </Select>
                </Field>
                <Field label="Kata sandi">
                  <Input
                    type="text"
                    value={wifiPass}
                    onChange={(e) => setWifiPass(e.target.value)}
                    disabled={wifiEnc === "nopass"}
                    placeholder="••••••••"
                    autoComplete="off"
                  />
                </Field>
              </div>
              <Checkbox label="Jaringan tersembunyi (hidden SSID)" checked={wifiHidden} onChange={setWifiHidden} />
            </div>
          )}
        </Card>

        <Card title="Tampilan">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={`Ukuran: ${size} px`}>
              <input type="range" min={128} max={1024} step={32} value={size} onChange={(e) => setSize(Number(e.target.value))} />
            </Field>
            <Field label={`Margin: ${margin} modul`}>
              <input type="range" min={0} max={8} step={1} value={margin} onChange={(e) => setMargin(Number(e.target.value))} />
            </Field>
            <Field label="Koreksi kesalahan" hint="Semakin tinggi, QR tetap terbaca meski sebagian tertutup/rusak, tapi lebih padat.">
              <Select value={level} onChange={(e) => setLevel(e.target.value as Level)}>
                <option value="L">Rendah (L) — 7%</option>
                <option value="M">Sedang (M) — 15%</option>
                <option value="Q">Tinggi (Q) — 25%</option>
                <option value="H">Sangat tinggi (H) — 30%</option>
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Warna QR">
                <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} aria-label="Warna QR" />
              </Field>
              <Field label="Latar">
                <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} aria-label="Warna latar" />
              </Field>
            </div>
          </div>
        </Card>
      </div>

      {/* Panel hasil */}
      <div className="lg:col-span-2">
        <Card title="Hasil" className="lg:sticky lg:top-20">
          <div className="flex items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-950">
            <canvas
              ref={canvasRef}
              className={ready ? "h-auto w-full max-w-xs rounded-md" : "hidden"}
              aria-label="Pratinjau QR code"
            />
            {!ready && (
              <p className="py-16 text-center text-sm text-zinc-500">
                {error ? "QR tidak dapat dibuat" : "Isi data di sebelah kiri untuk membuat QR code"}
              </p>
            )}
          </div>

          {error && (
            <div className="mt-3">
              <Alert>{error}</Alert>
            </div>
          )}

          {payload && !error && (
            <p className="mt-3 break-all rounded-lg bg-zinc-100 px-3 py-2 font-mono text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
              {payload}
            </p>
          )}

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button onClick={downloadPng} disabled={!ready}>
              <Download className="h-4 w-4" /> PNG
            </Button>
            <Button variant="secondary" onClick={downloadSvg} disabled={!ready}>
              <Download className="h-4 w-4" /> SVG
            </Button>
            <Button variant="secondary" className="col-span-2" onClick={copyImage} disabled={!ready}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Gambar tersalin!" : "Salin gambar"}
            </Button>
          </div>

          <p className="mt-4 text-xs text-zinc-500">
            Tips: untuk dicetak, gunakan SVG atau ukuran ≥ 512 px dan pastikan kontras warna cukup tinggi.
          </p>
        </Card>
      </div>
    </div>
  );
}
