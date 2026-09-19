import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-24 text-center">
      <p className="text-sm font-medium text-emerald-600">404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">Halaman tidak ditemukan</h1>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400">Alat yang Anda cari mungkin sudah dipindahkan atau belum tersedia.</p>
      <Link href="/" className="btn btn-primary mt-6">
        Kembali ke beranda
      </Link>
    </div>
  );
}
