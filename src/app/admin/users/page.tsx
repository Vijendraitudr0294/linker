"use client";
import { useEffect, useState } from "react";

type User = {
  id: string; email: string; slug: string;
  isAdmin: boolean; createdAt: string;
};

export default function UsersPage() {
  const [users, setUsers]   = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((d) => { setUsers(d.users ?? []); setLoading(false); });
  }, []);

  if (loading) return (
    <p style={{ color: "var(--color-text-secondary)" }}>Loading...</p>
  );

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 500, marginBottom: 24 }}>
        Users ({users.length})
      </h1>
      <table style={{ width: "100%", borderCollapse: "collapse",
                      fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--color-border-tertiary)" }}>
            {["Email","Slug","Admin","Joined"].map((h) => (
              <th key={h} style={{ padding: "8px 12px", textAlign: "left",
                                   color: "var(--color-text-tertiary)",
                                   fontWeight: 500 }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}
              style={{ borderBottom: "1px solid var(--color-border-tertiary)" }}>
              <td style={{ padding: "10px 12px",
                           color: "var(--color-text-primary)" }}>
                {u.email}
              </td>
              <td style={{ padding: "10px 12px",
                           color: "var(--color-text-secondary)" }}>
                {u.slug}
              </td>
              <td style={{ padding: "10px 12px" }}>
                {u.isAdmin
                  ? <span style={{ fontSize: 11, padding: "2px 8px",
                      borderRadius: 99, fontWeight: 500,
                      background: "var(--color-background-info)",
                      color: "var(--color-text-info)" }}>Admin</span>
                  : <span style={{ color: "var(--color-text-tertiary)" }}>—</span>
                }
              </td>
              <td style={{ padding: "10px 12px",
                           color: "var(--color-text-tertiary)" }}>
                {new Date(u.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
