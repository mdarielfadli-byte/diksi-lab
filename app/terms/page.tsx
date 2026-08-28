import Link from "next/link";

export const metadata = { title: "Ketentuan Layanan | DiksiLab" };

export default function TermsPage() {
  return <main style={{ maxWidth: 760, margin: "0 auto", padding: "72px 24px", fontFamily: "Arial, sans-serif", lineHeight: 1.65 }}>
    <Link href="/" style={{ color: "#171717", fontWeight: 800, textDecoration: "none" }}>DIKSI<span style={{ color: "#9cff00" }}>LAB</span></Link>
    <h1>Ketentuan Layanan</h1>
    <p>Terakhir diperbarui: 29 Agustus 2026.</p>
    <p>Member Area DiksiLab adalah ruang kerja untuk tim DiksiLab dan klien yang secara eksplisit diberi akses. Pengguna wajib menjaga keamanan akun Google dan kerahasiaan informasi proyek.</p>
    <p>DiksiLab dapat menambah, mengubah, atau mencabut akses berdasarkan kebutuhan proyek. Materi dan data pada Member Area hanya boleh digunakan untuk pelaksanaan kerja sama yang relevan.</p>
    <p>Untuk pertanyaan layanan, hubungi <a href="mailto:mdarielfadli@gmail.com">mdarielfadli@gmail.com</a>.</p>
  </main>;
}
