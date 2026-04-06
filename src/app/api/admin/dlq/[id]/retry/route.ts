import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { db, failedJobs, socialPosts } from "@/db";
import { eq } from "drizzle-orm";
import { Queue } from "bullmq";
import { redis } from "@/lib/redis";

const queue = new Queue("social-publish", { connection: redis });

export async function POST(
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

  // Re-enqueue the original payload
  await queue.add("retry", job.payload, {
    attempts: 3,
    backoff: { type: "exponential", delay: 60_000 },
  });

  // Reset the post status so the worker can update it
  await db
    .update(socialPosts)
    .set({ status: "scheduled" })
    .where(eq(socialPosts.id, (job.payload as any).postId));

  // Remove from failed_jobs
  await db.delete(failedJobs).where(eq(failedJobs.id, params.id));

  return NextResponse.json({ retried: true, jobId: params.id });
}
