"use client";

import { useMemo, useState } from "react";
import styles from "./team-project-calendar.module.css";

export type CalendarEntry = {
  id: string;
  title: string;
  date: string;
  kind: "task" | "meeting";
  status: string;
};

const weekday = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

export function TeamProjectCalendar({
  entries,
  onSelectDate,
}: {
  entries: CalendarEntry[];
  onSelectDate: (date: string) => void;
}) {
  const [cursor, setCursor] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });
  const monthTitle = new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(cursor);
  const cells = useMemo(() => {
    const firstDay = (cursor.getDay() + 6) % 7;
    const lastDate = new Date(
      cursor.getFullYear(),
      cursor.getMonth() + 1,
      0,
    ).getDate();
    return Array.from({ length: firstDay + lastDate }, (_, index) =>
      index < firstDay ? null : index - firstDay + 1,
    );
  }, [cursor]);
  const dateFor = (day: number) =>
    [
      cursor.getFullYear(),
      String(cursor.getMonth() + 1).padStart(2, "0"),
      String(day).padStart(2, "0"),
    ].join("-");

  return (
    <section className={styles.panel} aria-label="Kalender interaktif proyek">
      <div className={styles.header}>
        <div>
          <p>TIME TABLE PROYEK</p>
          <h2>Kalender kerja interaktif</h2>
        </div>
        <div className={styles.controls}>
          <button
            type="button"
            onClick={() =>
              setCursor(
                (value) =>
                  new Date(value.getFullYear(), value.getMonth() - 1, 1),
              )
            }
          >
            ←
          </button>
          <b>{monthTitle}</b>
          <button
            type="button"
            onClick={() =>
              setCursor(
                (value) =>
                  new Date(value.getFullYear(), value.getMonth() + 1, 1),
              )
            }
          >
            →
          </button>
        </div>
      </div>
      <p className={styles.hint}>
        Klik tanggal untuk melihat agenda dan menambahkan task atau meeting.
      </p>
      <div className={styles.weekdays}>
        {weekday.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className={styles.grid}>
        {cells.map((day, index) => {
          if (!day)
            return <div className={styles.empty} key={"empty-" + index} />;
          const date = dateFor(day);
          const dayEntries = entries.filter((entry) => entry.date === date);
          return (
            <button
              type="button"
              key={date}
              className={styles.day}
              onClick={() => onSelectDate(date)}
              aria-label={"Buka agenda " + date}
            >
              <b>{day}</b>
              {dayEntries.slice(0, 3).map((entry) => (
                <span
                  className={
                    entry.kind === "meeting" ? styles.meeting : styles.task
                  }
                  key={entry.kind + entry.id}
                  title={entry.title}
                >
                  {entry.kind === "meeting" ? "◌ " : "✓ "}
                  {entry.title}
                </span>
              ))}
              {dayEntries.length > 3 ? (
                <small>+{dayEntries.length - 3} agenda</small>
              ) : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}
