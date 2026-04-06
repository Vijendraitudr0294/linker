"use client";
import { useEffect, useState } from "react";

type FailedJob = {
  id:       string;
  payload:  { postId: string; platforms: string[]; userId: string };
  error:    string;
  failedAt: string;
};

export default function DLQPage() {
  const [jobs, setJobs]     = useState<FailedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing]   = useState<string | null>(null);

  async function load() {
    const res  = await fetch("/api/admin/dlq");
    const data = await res.json();
    setJobs(data.jobs ?? []);
    setLoading(false);
  }

  async function retry(id: string) {
    setActing(id);
    await fetch(`/api/admin/dlq/${id}/retry`, { method: "POST" });
    await load();
    setActing(null);
  }

  async function dismiss(id: string) {
    setActing(id);
    await fetch(`/api/admin/dlq/${id}/dismiss`, { method: "DELETE" });
    await load();
    setActing(null);
  }

  useEffect(() => { load(); }, []);

  if (loading) return (
    <p style={{ color: "var(--color-text-secondary)" }}>Loading...</p>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between",
                    alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 500, margin: 0 }}>
          Failed jobs
        </h1>
        <button onClick={load}
          style={{ fontSize: 13, padding: "6px 14px",
                   border: "1px solid var(--color-border-secondary)",
                   borderRadius: 8, background: "none",
                   cursor: "pointer",
                   color: "var(--color-text-primary)" }}>
          Refresh
        </button>
      </div>

      {jobs.length === 0 && (
        <div style={{
          padding: 40, textAlign: "center",
          border: "1px solid var(--color-border-tertiary)",
          borderRadius: 12,
          color: "var(--color-text-secondary)",
        }}>
          No failed jobs. Queue is healthy.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {jobs.map((job) => (
          <div key={job.id} style={{
            padding: 20,
            border: "1px solid var(--color-border-tertiary)",
            borderRadius: 12,
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 16,
            alignItems: "start",
          }}>
            <div>
              <div style={{ display: "flex", gap: 8,
                            flexWrap: "wrap", marginBottom: 8 }}>
                {job.payload.platforms?.map((p) => (
                  <span key={p} style={{
                    fontSize: 11, padding: "2px 8px",
                    borderRadius: 99, fontWeight: 500,
                    background: "var(--color-background-secondary)",
                    color: "var(--color-text-secondary)",
                  }}>
                    {p}
                  </span>
                ))}
              </div>

              <p style={{ fontSize: 13, margin: "0 0 6px",
                          color: "var(--color-text-primary)" }}>
                Post ID: <code style={{ fontSize: 12,
                  background: "var(--color-background-secondary)",
                  padding: "1px 6px", borderRadius: 4 }}>
                  {job.payload.postId}
                </code>
              </p>

              <p style={{ fontSize: 12, margin: "0 0 6px",
                          color: "var(--color-text-danger)",
                          fontFamily: "var(--font-mono)" }}>
                {job.error}
              </p>

              <p style={{ fontSize: 11, margin: 0,
                          color: "var(--color-text-tertiary)" }}>
                Failed {new Date(job.failedAt).toLocaleString()}
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column",
                          gap: 8, minWidth: 100 }}>
              <button
                disabled={acting === job.id}
                onClick={() => retry(job.id)}
                style={{
                  fontSize: 13, padding: "6px 14px",
                  borderRadius: 8, border: "none",
                  background: "var(--color-background-info)",
                  color: "var(--color-text-info)",
                  cursor: acting === job.id ? "not-allowed" : "pointer",
                  fontWeight: 500,
                }}>
                {acting === job.id ? "..." : "Retry"}
              </button>
              <button
                disabled={acting === job.id}
                onClick={() => dismiss(job.id)}
                style={{
                  fontSize: 13, padding: "6px 14px",
                  borderRadius: 8,
                  border: "1px solid var(--color-border-tertiary)",
                  background: "none",
                  color: "var(--color-text-secondary)",
                  cursor: acting === job.id ? "not-allowed" : "pointer",
                }}>
                Dismiss
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
