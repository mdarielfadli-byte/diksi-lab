"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "../../lib/supabase/browser";
import styles from "../member-area/portal-live.module.css";

export default function ResetPasswordPage() {
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      const supabase = getSupabaseBrowserClient();
      const { data } = await supabase.auth.getSession();
      window.history.replaceState({}, document.title, "/reset-password");
      setReady(Boolean(data.session));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setMessage("");
    if (password.length < 10) return setError("Gunakan password minimal 10 karakter.");
    if (password !== confirmPassword) return setError("Konfirmasi password belum sama.");
    setSaving(true);
    try {
      const { error: updateError } = await getSupabaseBrowserClient().auth.updateUser({ password });
      if (updateError) throw updateError;
      setMessage("Password berhasil diperbarui. Anda dapat masuk ke Member Area.");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Password belum dapat diperbarui."); }
    finally { setSaving(false); }
  }

  return <main className={styles.state}><section className={styles.card}><Link className={styles.brand} href="/">DIKSI<span>LAB</span></Link><p className={styles.eyebrow}>KEAMANAN AKUN</p><h1>Atur password baru.</h1>{ready ? <form onSubmit={updatePassword}><label htmlFor="new-password">Password baru</label><input id="new-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" required /><label htmlFor="confirm-password">Konfirmasi password</label><input id="confirm-password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" required /><button type="submit" disabled={saving}>{saving ? "Menyimpan…" : "Simpan password"}</button></form> : <p>Tautan pemulihan tidak aktif atau telah kedaluwarsa. Minta tautan baru dari administrator.</p>}{message ? <p className={styles.notice}>{message}</p> : null}{error ? <p className={styles.error}>{error}</p> : null}{message ? <Link href="/member-area">Lanjut ke Member Area →</Link> : null}</section></main>;
}
