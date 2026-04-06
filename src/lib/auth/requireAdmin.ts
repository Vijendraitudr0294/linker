import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "./middleware";
import { db, users } from "@/db";
import { eq } from "drizzle-orm";

export async function requireAdmin(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const [user] = await db
    .select({ isAdmin: users.isAdmin })
    .from(users)
    .where(eq(users.id, auth.user.sub))
    .limit(1);

  if (!user?.isAdmin) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Admin access required" } },
      { status: 403 }
    );
  }

  return { user: auth.user };
}
