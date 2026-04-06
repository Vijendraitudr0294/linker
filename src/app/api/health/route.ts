import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function GET() {
  const checks: Record<string, string> = {};
  let overallStatus = 200;

  // DB check
  try {
    await db.execute(sql`SELECT 1`);
    checks.database = "up";
  } catch {
    checks.database = "down";
    overallStatus = 503;
  }

  // Queue check (ping Upstash)
  try {
    const res = await fetch(
      `${process.env.UPSTASH_REDIS_REST_URL}/ping`,
      {
        headers: {
          Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
        },
      }
    );
    checks.redis = res.ok ? "up" : "degraded";
  } catch {
    checks.redis = "down";
  }

  return NextResponse.json(
    {
      status:    overallStatus === 200 ? "ok" : "degraded",
      checks,
      timestamp: new Date().toISOString(),
      version:   process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local",
    },
    { status: overallStatus }
  );
}
