# Diksilab

Website digital agency Diksilab, dibangun dengan Next.js App Router dan dipublikasikan melalui Vercel.

## Link proyek

- Website: https://www.diksilab.com
- Repository: https://github.com/mdarielfadli-byte/diksi-lab
- Riwayat perubahan: [CHANGELOG.md](CHANGELOG.md)

## Stack

- Next.js 16 dan React 19
- TypeScript
- Next.js App Router
- Vercel

## Halaman utama

- Beranda, Visi, Layanan, dan Karya
- Konsultasi / Work Together
- Audit Brand & Marketing serta Audit Kanal
- Artikel, detail artikel, dan FAQ

## Menjalankan secara lokal

Prasyarat: Node.js `>=22.13.0`.

```bash
npm install
npm run dev
```

Buka http://localhost:3000.

## Validasi dan deployment

```bash
npm run build
npx vercel --prod
```

Jalankan deployment production hanya setelah preview dan build telah diverifikasi.

## Alur kerja

1. Buat dan tinjau perubahan melalui preview lokal.
2. Jalankan `npm run build` untuk validasi.
3. Setelah disetujui, gunakan keyword `PUBLISH` untuk commit, push GitHub, dan deploy Vercel.
4. Gunakan `Wrap Up` untuk merangkum pekerjaan dan memperbarui `CHANGELOG.md` bila diperlukan.
