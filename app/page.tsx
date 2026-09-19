import { Gift, ShieldCheck, Zap, Smartphone } from "lucide-react";
import ToolGrid from "@/components/ToolGrid";
import { SITE } from "@/lib/site";

const highlights = [
  { icon: ShieldCheck, title: "Privasi terjaga", text: "Semua diproses di perangkat Anda. File dan teks tidak pernah diunggah." },
  { icon: Zap, title: "Cepat & tanpa daftar", text: "Buka, pakai, selesai. Tidak perlu akun, tidak ada iklan yang mengganggu." },
  { icon: Gift, title: "100% gratis", text: "Bebas digunakan untuk keperluan pribadi, sekolah, kantor, maupun usaha." },
  { icon: Smartphone, title: "Ramah HP", text: "Tampilan responsif, nyaman dipakai dari ponsel maupun laptop." },
];

export default function HomePage() {
  return (
    <>
      <section className="py-8 text-center sm:py-14">
        <span className="pill mb-5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
          Gratis · Tanpa login · Tanpa upload
        </span>
        <h1 className="mx-auto max-w-3xl text-balance text-4xl font-bold tracking-tight sm:text-5xl">
          Alat online gratis untuk <span className="text-emerald-600 dark:text-emerald-400">kebutuhan sehari-hari</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-zinc-600 dark:text-zinc-400">
          Kompres foto untuk pendaftaran online, buat QR code, ubah angka jadi terbilang, dan banyak lagi. Semuanya berjalan
          langsung di browser Anda.
        </p>
      </section>

      <ToolGrid />

      <section id="tentang" className="mt-20 scroll-mt-20">
        <h2 className="text-center text-2xl font-bold tracking-tight">Kenapa {SITE.name}?</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((h) => (
            <div key={h.title} className="card">
              <h.icon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" aria-hidden />
              <h3 className="mt-3 font-semibold">{h.title}</h3>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{h.text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
