import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { db, failedJobs, socialPosts } from "@/db";
import { eq } from "drizzle-orm";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const [job] = await db
    .select()
    .from(failedJobs)
    .where(eq(failedJobs.id, params.id))
    .limit(1);

  if (!job)
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Job not found" } },
      { status: 404 }
    );

  // Mark post as permanently failed
  await db
    .update(socialPosts)
    .set({ status: "permanently_failed" })
    .where(eq(socialPosts.id, (job.payload as any).postId));

  await db.delete(failedJobs).where(eq(failedJobs.id, params.id));

  return NextResponse.json({ dismissed: true });
}
