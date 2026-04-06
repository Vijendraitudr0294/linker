import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/requireAdmin";
import { Queue } from "bullmq";
import { redis } from "@/lib/redis";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const main = new Queue("social-publish",     { connection: redis });
  const dlq  = new Queue("social-publish-dlq", { connection: redis });

  const [waiting, active, failed, delayed, dlqCount, throughput] =
    await Promise.all([
      main.getWaitingCount(),
      main.getActiveCount(),
      main.getFailedCount(),
      main.getDelayedCount(),
      dlq.getWaitingCount(),
      main.getCompletedCount(),
    ]);

  return NextResponse.json({
    main:       { waiting, active, failed, delayed, completed: throughput },
    dlq:        { waiting: dlqCount },
    healthy:    failed === 0 && dlqCount === 0,
    checkedAt:  new Date().toISOString(),
  });
}
