"use client";
import { useEffect, useState } from "react";

type DomainRecord = {
  domain:     string;
  txtRecord:  string;
  verified:   boolean;
  verifiedAt: string | null;
};

type Instructions = {
  type: string; host: string;
  value: string; ttl: string; note: string;
};

export default function DomainsSettingsPage() {
  const [record,       setRecord]       = useState<DomainRecord | null>(null);
  const [instructions, setInstructions] = useState<Instructions | null>(null);
  const [input,        setInput]        = useState("");
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [checking,     setChecking]     = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [message,      setMessage]      = useState<string | null>(null);

  async function load() {
    const res  = await fetch("/api/domains");
    const data = await res.json();
    setRecord(data.domain);
    setLoading(false);
  }

  async function submit() {
    setError(null); setMessage(null); setSaving(true);
    const res  = await fetch("/api/domains", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ domain: input.trim() }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error?.message ?? "Failed"); }
    else {
      setRecord({ domain: data.domain, txtRecord: data.txtRecord,
                  verified: false, verifiedAt: null });
      setInstructions(data.instructions);
      setMessage("Domain registered. Add the TXT record below to your DNS provider.");
    }
    setSaving(false);
  }

  async function checkVerification() {
    setChecking(true); setMessage(null); setError(null);
    const res  = await fetch("/api/domains/verify", { method: "POST" });
    const data = await res.json();
    if (data.verified) {
      setRecord((r) => r ? { ...r, verified: true,
                             verifiedAt: data.verifiedAt } : r);
      setMessage("Domain verified successfully.");
    } else {
      setError(data.message);
    }
    setChecking(false);
  }

  async function removeDomain() {
    if (!confirm("Remove this domain?")) return;
    await fetch("/api/domains", { method: "DELETE" });
    setRecord(null); setInstructions(null);
    setMessage("Domain removed.");
  }

  useEffect(() => { load(); }, []);

  if (loading) return (
    <p style={{ color: "var(--color-text-secondary)",
                padding: 32 }}>Loading...</p>
  );

  return (
    <div style={{ maxWidth: 560, padding: 32 }}>
      <h1 style={{ fontSize: 22, fontWeight: 500, marginBottom: 8 }}>
        Custom domain
      </h1>
      <p style={{ fontSize: 14, color: "var(--color-text-secondary)",
                  marginBottom: 32, lineHeight: 1.6 }}>
        Point your own domain to your profile page.
        Your visitors will see <code>myname.com</code> instead
        of <code>yourapp.com/yourname</code>.
      </p>

      {message && (
        <div style={{ padding: "12px 16px", marginBottom: 16,
                      borderRadius: 8,
                      background: "var(--color-background-success)",
                      color: "var(--color-text-success)",
                      fontSize: 13 }}>
          {message}
        </div>
      )}

      {error && (
        <div style={{ padding: "12px 16px", marginBottom: 16,
                      borderRadius: 8,
                      background: "var(--color-background-danger)",
                      color: "var(--color-text-danger)",
                      fontSize: 13 }}>
          {error}
        </div>
      )}

      {!record ? (
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="myname.com"
            style={{ flex: 1, padding: "8px 12px", fontSize: 14,
                     border: "1px solid var(--color-border-secondary)",
                     borderRadius: 8, background: "none",
                     color: "var(--color-text-primary)" }}
          />
          <button
            onClick={submit}
            disabled={saving || !input.trim()}
            style={{ padding: "8px 18px", fontSize: 14,
                     fontWeight: 500, borderRadius: 8,
                     border: "none",
                     background: "var(--color-text-primary)",
                     color: "var(--color-background-primary)",
                     cursor: saving ? "not-allowed" : "pointer" }}>
            {saving ? "Saving..." : "Add domain"}
          </button>
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", alignItems: "center",
                        gap: 12, marginBottom: 24 }}>
            <code style={{ fontSize: 15, fontWeight: 500,
                           color: "var(--color-text-primary)" }}>
              {record.domain}
            </code>
            <span style={{
              fontSize: 11, padding: "2px 10px", borderRadius: 99,
              fontWeight: 500,
              background: record.verified
                ? "var(--color-background-success)"
                : "var(--color-background-warning)",
              color: record.verified
                ? "var(--color-text-success)"
                : "var(--color-text-warning)",
            }}>
              {record.verified ? "Verified" : "Pending verification"}
            </span>
            <button onClick={removeDomain}
              style={{ marginLeft: "auto", fontSize: 12,
                       color: "var(--color-text-danger)",
                       background: "none", border: "none",
                       cursor: "pointer", padding: 0 }}>
              Remove
            </button>
          </div>

          {!record.verified && (
            <div style={{ border: "1px solid var(--color-border-tertiary)",
                          borderRadius: 12, padding: 20,
                          marginBottom: 20 }}>
              <p style={{ fontSize: 13, fontWeight: 500,
                          marginBottom: 16,
                          color: "var(--color-text-primary)" }}>
                Add this TXT record to your DNS provider
              </p>
              <table style={{ width: "100%", fontSize: 12,
                              borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Type","Host","Value","TTL"].map((h) => (
                      <th key={h} style={{
                        textAlign: "left", padding: "4px 8px",
                        color: "var(--color-text-tertiary)",
                        fontWeight: 500, borderBottom:
                        "1px solid var(--color-border-tertiary)"
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: "8px 8px",
                                 color: "var(--color-text-secondary)" }}>
                      TXT
                    </td>
                    <td style={{ padding: "8px 8px",
                                 color: "var(--color-text-secondary)" }}>
                      @
                    </td>
                    <td style={{ padding: "8px 8px" }}>
                      <code style={{ fontSize: 11,
                        background: "var(--color-background-secondary)",
                        padding: "2px 6px", borderRadius: 4,
                        color: "var(--color-text-primary)",
                        wordBreak: "break-all" }}>
                        {record.txtRecord}
                      </code>
                    </td>
                    <td style={{ padding: "8px 8px",
                                 color: "var(--color-text-secondary)" }}>
                      300
                    </td>
                  </tr>
                </tbody>
              </table>
              <p style={{ fontSize: 12,
                          color: "var(--color-text-tertiary)",
                          marginTop: 12, marginBottom: 16 }}>
                DNS changes can take up to 48 hours to propagate.
                We check automatically every 5 minutes.
              </p>
              <button
                onClick={checkVerification}
                disabled={checking}
                style={{ fontSize: 13, padding: "6px 16px",
                         borderRadius: 8,
                         border: "1px solid var(--color-border-secondary)",
                         background: "none",
                         color: "var(--color-text-primary)",
                         cursor: checking ? "not-allowed" : "pointer" }}>
                {checking ? "Checking..." : "Check now"}
              </button>
            </div>
          )}

          {record.verified && record.verifiedAt && (
            <p style={{ fontSize: 12,
                        color: "var(--color-text-tertiary)" }}>
              Verified on {new Date(record.verifiedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
