import { Router } from 'express';
import { Queue } from 'bullmq';
import { redisConnection } from '../queues/socialQueue';

export const eventRouter = Router();
export const analyticsQueue = new Queue('analytics-ingest', { connection: redisConnection });

eventRouter.post('/batch', async (req, res) => {
  if (!Array.isArray(req.body)) {
     return res.status(422).json({ error: 'Payload must be an array' });
  }
  const events = req.body.slice(0, 100);
  if (events.length === 0) return res.status(422).json({ error: 'Empty batch' });

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const user_agent = req.headers['user-agent'];

  const jobs = events.map(e => ({
    name: 'track',
    data: { ...e, properties: { ip_country: ip, user_agent }, occurred_at: new Date().toISOString() },
    opts: { removeOnComplete: true }
  }));
  await analyticsQueue.addBulk(jobs);
  res.status(202).json({ accepted: true, processed: events.length });
});
