import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { db, failedJobs } from "@/db";
import { desc, eq } from "drizzle-orm";
import { Queue } from "bullmq";
import { redis } from "@/lib/redis";

const dlq = new Queue("social-publish-dlq", { connection: redis });

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(req.url);
  const page  = parseInt(searchParams.get("page")  ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const offset = (page - 1) * limit;

  // Jobs from Postgres failed_jobs table
  const jobs = await db
    .select()
    .from(failedJobs)
    .orderBy(desc(failedJobs.failedAt))
    .limit(limit)
    .offset(offset);

  // Live counts from BullMQ queues
  const [waiting, active, failed, delayed, dlqCount] =
    await Promise.all([
      new Queue("social-publish", { connection: redis }).getWaitingCount(),
      new Queue("social-publish", { connection: redis }).getActiveCount(),
      new Queue("social-publish", { connection: redis }).getFailedCount(),
      new Queue("social-publish", { connection: redis }).getDelayedCount(),
      dlq.getWaitingCount(),
    ]);

  return NextResponse.json({
    jobs,
    pagination: { page, limit, total: jobs.length },
    queueStats: { waiting, active, failed, delayed, dlq: dlqCount },
  });
}
