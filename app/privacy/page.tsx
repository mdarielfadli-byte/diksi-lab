import Link from "next/link";

export const metadata = { title: "Kebijakan Privasi | DiksiLab" };

export default function PrivacyPage() {
  return <main style={{ maxWidth: 760, margin: "0 auto", padding: "72px 24px", fontFamily: "Arial, sans-serif", lineHeight: 1.65 }}>
    <Link href="/" style={{ color: "#171717", fontWeight: 800, textDecoration: "none" }}>DIKSI<span style={{ color: "#9cff00" }}>LAB</span></Link>
    <h1>Kebijakan Privasi</h1>
    <p>Terakhir diperbarui: 29 Agustus 2026.</p>
    <p>DiksiLab menggunakan data akun Google hanya untuk mengautentikasi pengguna yang telah diberi akses ke Member Area. Kami menyimpan identitas akun, peran, dan aktivitas proyek seperlunya untuk menjalankan layanan.</p>
    <p>Data proyek dan dokumen tidak dibagikan kepada pihak lain tanpa persetujuan. Akses dibatasi berdasarkan perusahaan dan peran pengguna.</p>
    <p>Untuk pertanyaan tentang data pribadi, hubungi <a href="mailto:mdarielfadli@gmail.com">mdarielfadli@gmail.com</a>.</p>
  </main>;
}
