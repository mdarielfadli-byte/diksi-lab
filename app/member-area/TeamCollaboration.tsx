"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "../../lib/supabase/browser";
import styles from "./team-workspace.module.css";

type Decision = {
  id: string;
  title: string;
  decision: string;
  status: string;
  owner_label: string | null;
};
type Feedback = {
  id: string;
  subject: string;
  body: string;
  status: string;
  coordinator_label: string | null;
};

export function TeamCollaboration({
  companyId,
  projectId,
}: {
  companyId: string;
  projectId: string;
}) {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const db = getSupabaseBrowserClient();
    const [decisionResponse, feedbackResponse] = await Promise.all([
      db
        .from("decision_logs")
        .select("id,title,decision,status,owner_label")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false }),
      db
        .from("client_feedback")
        .select("id,subject,body,status,coordinator_label")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false }),
    ]);
    if (decisionResponse.error) throw decisionResponse.error;
    if (feedbackResponse.error) throw feedbackResponse.error;
    setDecisions((decisionResponse.data ?? []) as Decision[]);
    setFeedback((feedbackResponse.data ?? []) as Feedback[]);
  }, [projectId]);

  useEffect(() => {
    let active = true;
    void Promise.resolve()
      .then(() => {
        if (active) setLoading(true);
        return load();
      })
      .catch((caught) => {
        if (active)
          setError(
            caught instanceof Error
              ? caught.message
              : "Data kolaborasi belum dapat dimuat.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [load]);

  async function addDecision(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const db = getSupabaseBrowserClient();
      const { data: auth, error: authError } = await db.auth.getUser();
      if (authError) throw authError;
      if (!auth.user) throw new Error("Sesi masuk berakhir. Silakan masuk kembali.");
      const { error: insertError } = await db.from("decision_logs").insert({
        company_id: companyId,
        project_id: projectId,
        title: String(form.get("title") ?? "").trim(),
        decision: String(form.get("decision") ?? "").trim(),
        owner_label: String(form.get("owner") ?? "").trim() || null,
        created_by: auth.user.id,
      });
      if (insertError) throw insertError;
      formElement.reset();
      await load();
      setMessage("Keputusan berhasil dipublikasikan.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Keputusan belum tersimpan.");
    } finally {
      setBusy(false);
    }
  }

  async function updateFeedback(id: string, status: "in_review" | "resolved") {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const { error: updateError } = await getSupabaseBrowserClient()
        .from("client_feedback")
        .update({ status })
        .eq("id", id);
      if (updateError) throw updateError;
      await load();
      setMessage(status === "resolved" ? "Feedback ditandai selesai." : "Feedback ditandai sedang ditangani.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Status feedback belum berubah.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className={styles.actionGrid} aria-label="Kolaborasi proyek">
      <form className={styles.card} onSubmit={addDecision}>
        <p>DECISION LOG</p>
        <h2>Keputusan untuk klien</h2>
        <label>
          Judul keputusan
          <input name="title" required maxLength={140} placeholder="Contoh: Arah visual landing page" />
        </label>
        <label>
          Keputusan dan konteks
          <textarea name="decision" required maxLength={3000} placeholder="Catat keputusan, konteks, dan dampaknya…" />
        </label>
        <label>
          PIC
          <input name="owner" maxLength={100} placeholder="Nama PIC (opsional)" />
        </label>
        <button type="submit" disabled={busy}>{busy ? "Menyimpan…" : "Publikasikan keputusan"}</button>
        {decisions.map((item) => (
          <article key={item.id}>
            <b>{item.title}</b>
            <p>{item.decision}</p>
            <small>{item.status.replaceAll("_", " ")} · {item.owner_label || "Diksilab"}</small>
          </article>
        ))}
        {!loading && decisions.length === 0 ? <p>Belum ada keputusan yang dibagikan.</p> : null}
      </form>

      <section className={styles.card} aria-labelledby="feedback-inbox-title">
        <p>FEEDBACK KLIEN</p>
        <h2 id="feedback-inbox-title">Inbox koordinator</h2>
        {loading ? <p role="status">Memuat feedback…</p> : null}
        {feedback.map((item) => (
          <article key={item.id}>
            <b>{item.subject}</b>
            <p>{item.body}</p>
            <small>{item.status.replaceAll("_", " ")} · Koordinator: {item.coordinator_label || "Belum ditentukan"}</small>
            {item.status !== "resolved" ? (
              <div className={styles.inline}>
                {item.status !== "in_review" ? <button type="button" className={styles.secondary} disabled={busy} onClick={() => void updateFeedback(item.id, "in_review")}>Mulai tangani</button> : null}
                <button type="button" disabled={busy} onClick={() => void updateFeedback(item.id, "resolved")}>Tandai selesai</button>
              </div>
            ) : null}
          </article>
        ))}
        {!loading && feedback.length === 0 ? <p>Belum ada feedback dari klien.</p> : null}
      </section>
      {message ? <p className={styles.notice} role="status">{message}</p> : null}
      {error ? <p className={styles.error} role="alert">{error}</p> : null}
    </section>
  );
}
