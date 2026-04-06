import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/jwt";
import { db, users } from "@/db";
import { eq } from "drizzle-orm";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = cookies().get("token")?.value;
  if (!token) redirect("/login");

  try {
    const payload = await verifyToken(token);
    const [user]  = await db
      .select({ isAdmin: users.isAdmin })
      .from(users)
      .where(eq(users.id, payload.sub))
      .limit(1);

    if (!user?.isAdmin) redirect("/dashboard");
  } catch {
    redirect("/login");
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <nav style={{
        width: 220,
        borderRight: "1px solid var(--color-border-tertiary)",
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}>
        <p style={{
          fontSize: 11,
          fontWeight: 500,
          color: "var(--color-text-tertiary)",
          marginBottom: 8,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}>
          Admin
        </p>
        <a href="/admin"
          style={{ fontSize: 14, color: "var(--color-text-primary)",
                   padding: "6px 10px", borderRadius: 6,
                   textDecoration: "none" }}>
          Overview
        </a>
        <a href="/admin/dlq"
          style={{ fontSize: 14, color: "var(--color-text-primary)",
                   padding: "6px 10px", borderRadius: 6,
                   textDecoration: "none" }}>
          Failed jobs
        </a>
        <a href="/admin/users"
          style={{ fontSize: 14, color: "var(--color-text-primary)",
                   padding: "6px 10px", borderRadius: 6,
                   textDecoration: "none" }}>
          Users
        </a>
      </nav>
      <main style={{ flex: 1, padding: 32 }}>{children}</main>
    </div>
  );
}
