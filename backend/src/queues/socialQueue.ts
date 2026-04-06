import { Queue, QueueEvents, Worker } from 'bullmq';
import { createClient } from '@supabase/supabase-js';
import Redis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();

export const redisConnection = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
  maxRetriesPerRequest: null,
  retryStrategy: (times) => Math.min(times * 100, 5000)
});
redisConnection.on('error', (err: any) => {
  if (err.code === 'ECONNREFUSED' && !(global as any).__redisError) {
    console.warn('\x1b[33m%s\x1b[0m', '⚠️ Local Redis connection absent. Analytics / Social Workers are idling until port :6379 is available locally!');
    (global as any).__redisError = true;
  }
});
export const supabase = createClient(
  process.env.SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.SUPABASE_SERVICE_KEY || 'placeholder'
);

export interface SocialJobPayload {
  postId: string;
  platforms: string[];
  userId: string;
  scheduledAt: number;
}

export const socialQueue = new Queue<SocialJobPayload>('social-publish', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 60000 },
    removeOnComplete: true,
  },
});

export const socialDlqQueue = new Queue<SocialJobPayload & { error: string }>('social-publish-dlq', {
  connection: redisConnection,
});

export const domainVerifyQueue = new Queue("domain-verify", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts:  288,           // 48h ÷ 10min = 288 attempts
    backoff:   { type: "fixed", delay: 300_000 }, // 5 min
    removeOnComplete: true,
    removeOnFail:     true,
  },
});

export const dlqWorker = new Worker(
  'social-publish-dlq',
  async (job) => {
    await supabase.from('failed_jobs').insert({
      original_job_id: job.id || 'unknown',
      payload: job.data,
      error: job.data.error,
    });
  },
  { connection: redisConnection }
);

const queueEvents = new QueueEvents('social-publish', { connection: redisConnection });
queueEvents.on('failed', async ({ jobId, failedReason }) => {
  const job = await socialQueue.getJob(jobId);
  if (job && job.attemptsMade >= (job.opts.attempts || 3)) {
    await socialDlqQueue.add('dlq-event', {
      ...job.data,
      error: failedReason,
    });
  }
});
