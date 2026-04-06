"use client";
import { useEffect, useState } from "react";

type Stats = {
  main:      { waiting: number; active: number; failed: number;
               delayed: number; completed: number };
  dlq:       { waiting: number };
  healthy:   boolean;
  checkedAt: string;
};

export default function AdminOverview() {
  const [stats, setStats]   = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res  = await fetch("/api/admin/queue-stats");
    const data = await res.json();
    setStats(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  if (loading) return <p style={{ color: "var(--color-text-secondary)" }}>Loading...</p>;
  if (!stats)  return <p style={{ color: "var(--color-text-danger)" }}>Failed to load stats.</p>;

  const cards = [
    { label: "Waiting",   value: stats.main.waiting,   color: "var(--color-text-secondary)" },
    { label: "Active",    value: stats.main.active,    color: "var(--color-text-info)" },
    { label: "Delayed",   value: stats.main.delayed,   color: "var(--color-text-warning)" },
    { label: "Failed",    value: stats.main.failed,    color: "var(--color-text-danger)" },
    { label: "Completed", value: stats.main.completed, color: "var(--color-text-success)" },
    { label: "DLQ",       value: stats.dlq.waiting,    color: stats.dlq.waiting > 0
                                                         ? "var(--color-text-danger)"
                                                         : "var(--color-text-success)" },
  ];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center",
                    gap: 12, marginBottom: 32 }}>
        <h1 style={{ fontSize: 22, fontWeight: 500, margin: 0 }}>
          Queue overview
        </h1>
        <span style={{
          fontSize: 12,
          padding: "2px 10px",
          borderRadius: 99,
          background: stats.healthy
            ? "var(--color-background-success)"
            : "var(--color-background-danger)",
          color: stats.healthy
            ? "var(--color-text-success)"
            : "var(--color-text-danger)",
        }}>
          {stats.healthy ? "Healthy" : "Needs attention"}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns:
                    "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
        {cards.map((c) => (
          <div key={c.label} style={{
            padding: 20,
            border: "1px solid var(--color-border-tertiary)",
            borderRadius: 12,
          }}>
            <p style={{ fontSize: 12, color: "var(--color-text-tertiary)",
                        margin: "0 0 8px" }}>
              {c.label}
            </p>
            <p style={{ fontSize: 28, fontWeight: 500,
                        color: c.color, margin: 0 }}>
              {c.value}
            </p>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>
        Last checked: {new Date(stats.checkedAt).toLocaleString()}
        {" · "}
        <button onClick={load}
          style={{ fontSize: 12, color: "var(--color-text-info)",
                   background: "none", border: "none",
                   cursor: "pointer", padding: 0 }}>
          Refresh
        </button>
      </p>

      {stats.dlq.waiting > 0 && (
        <div style={{
          marginTop: 24,
          padding: 16,
          border: "1px solid var(--color-border-danger)",
          borderRadius: 8,
          background: "var(--color-background-danger)",
        }}>
          <p style={{ margin: 0, fontSize: 14,
                      color: "var(--color-text-danger)" }}>
            {stats.dlq.waiting} job{stats.dlq.waiting > 1 ? "s" : ""} in
            the dead letter queue.{" "}
            <a href="/admin/dlq"
              style={{ color: "var(--color-text-danger)",
                       fontWeight: 500 }}>
              View and retry
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
