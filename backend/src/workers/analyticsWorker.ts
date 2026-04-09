import { Worker, Job } from 'bullmq';
import { redisConnection, supabase } from '../queues/socialQueue';

const BATCH_SIZE = 500;
const BATCH_FLUSH_MS = 500;

let eventBuffer: any[] = [];
let flushTimeout: NodeJS.Timeout | null = null;

import { log } from '../lib/logger';

const flushBuffer = async () => {
  if (eventBuffer.length === 0) return;
  // Atomically swap the buffer to prevent data loss
  const payload = eventBuffer;
  eventBuffer = [];
  try {
    const { error } = await supabase.from('analytics_events').insert(payload);
    if (error) throw error;
  } catch (err) {
    log("error", "Analytics Flush Failed", { error: String(err), lostEvents: payload.length });
  }
};

export const analyticsWorker = new Worker(
  'analytics-ingest',
  async (job: Job) => {
    eventBuffer.push({
      event_type: job.data.event_type,
      entity_id: job.data.entity_id,
      user_id: job.data.user_id,
      properties: job.data.properties,
      occurred_at: job.data.occurred_at
    });
    if (eventBuffer.length >= BATCH_SIZE) {
      if (flushTimeout) clearTimeout(flushTimeout);
      await flushBuffer();
    } else if (!flushTimeout) {
      flushTimeout = setTimeout(async () => {
        flushTimeout = null;
        await flushBuffer();
      }, BATCH_FLUSH_MS);
    }
  },
  // IMPORTANT: concurrency must be 1 — the shared eventBuffer is not thread-safe
  { connection: redisConnection, concurrency: 1 }
);

// GRACEFUL SHUTDOWN: Flush buffer on process exit
const handleExit = async () => {
  if (eventBuffer.length > 0) {
    console.log(`[Worker] Flushing ${eventBuffer.length} events before shutdown...`);
    await flushBuffer();
  }
  process.exit(0);
};

process.on('SIGTERM', handleExit);
process.on('SIGINT', handleExit);
