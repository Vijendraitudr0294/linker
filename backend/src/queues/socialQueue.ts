import { Queue, QueueEvents, Worker } from "bullmq";
import { createClient } from "@supabase/supabase-js";
import Redis from "ioredis";
import dotenv from "dotenv";
import { resolveBackendRuntimeConfig } from "../lib/runtimeConfig";

dotenv.config();

const runtime = resolveBackendRuntimeConfig(process.env);

export const queuesEnabled = runtime.queuesEnabled;
export const queueUnavailableMessage =
  "Queue service unavailable. Set REDIS_URL to enable scheduling and analytics queues.";

export const redisConnection = runtime.redisUrl
  ? new Redis(runtime.redisUrl, {
      maxRetriesPerRequest: null,
      retryStrategy: (times) => Math.min(times * 100, 5000),
    })
  : null;

if (!redisConnection) {
  console.warn("\x1b[33m%s\x1b[0m", `WARNING: ${queueUnavailableMessage}`);
} else {
  redisConnection.on("error", (err: unknown) => {
    const code =
      typeof err === "object" && err !== null && "code" in err
        ? String((err as { code?: unknown }).code)
        : "";

    if (code === "ECONNREFUSED" && !(global as { __redisError?: boolean }).__redisError) {
      console.warn("\x1b[33m%s\x1b[0m", "WARNING: Redis unreachable. Queue workers are idle until Redis is available.");
      (global as { __redisError?: boolean }).__redisError = true;
    }
  });
}

export const supabase = createClient(runtime.supabaseUrl, runtime.supabaseServiceKey);

export interface SocialJobPayload {
  postId: string;
  platforms: string[];
  userId: string;
  scheduledAt: number;
}

export const socialQueue = redisConnection
  ? new Queue<SocialJobPayload>("social-publish", {
      connection: redisConnection,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 60000 },
        removeOnComplete: true,
      },
    })
  : null;

export const socialDlqQueue = redisConnection
  ? new Queue<SocialJobPayload & { error: string }>("social-publish-dlq", {
      connection: redisConnection,
    })
  : null;

export const analyticsQueue = redisConnection
  ? new Queue("analytics-ingest", { connection: redisConnection })
  : null;

export const domainVerifyQueue = redisConnection
  ? new Queue("domain-verify", {
      connection: redisConnection,
      defaultJobOptions: {
        attempts: 288,
        backoff: { type: "fixed", delay: 300_000 },
        removeOnComplete: true,
        removeOnFail: true,
      },
    })
  : null;

export const dlqWorker =
  redisConnection && socialDlqQueue
    ? new Worker(
        "social-publish-dlq",
        async (job) => {
          await supabase.from("failed_jobs").insert({
            original_job_id: job.id || "unknown",
            payload: job.data,
            error: job.data.error,
          });
        },
        { connection: redisConnection }
      )
    : null;

if (redisConnection && socialQueue && socialDlqQueue) {
  const queueEvents = new QueueEvents("social-publish", { connection: redisConnection });
  queueEvents.on("failed", async ({ jobId, failedReason }) => {
    const job = await socialQueue.getJob(jobId);
    if (job && job.attemptsMade >= (job.opts.attempts || 3)) {
      await socialDlqQueue.add("dlq-event", {
        ...job.data,
        error: failedReason,
      });
    }
  });
}
