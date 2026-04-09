import { Request, Response, Router } from 'express';
import { Queue } from 'bullmq';
import rateLimit from 'express-rate-limit';
import { redisConnection } from '../queues/socialQueue';
import { normalizeAnalyticsEvents } from '../lib/eventsPayload';

export const eventRouter = Router();
export const analyticsQueue = new Queue('analytics-ingest', { connection: redisConnection });

// SECURITY: Rate limit analytics ingestion to prevent queue flooding
const eventsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,            // 100 requests per IP per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many analytics events. Please slow down.' },
});
eventRouter.use(eventsLimiter);

const ingestEvents = async (req: Request, res: Response) => {
  const events = normalizeAnalyticsEvents(req.body);
  if (!events) return res.status(422).json({ error: 'Payload must include at least one valid event' });

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const user_agent = req.headers['user-agent'];

  const jobs = events.map(e => ({
    name: 'track',
    data: {
      ...e,
      properties: { ...(e.properties || {}), ip_country: ip, user_agent },
      occurred_at: e.occurred_at || new Date().toISOString(),
    },
    opts: { removeOnComplete: true }
  }));
  await analyticsQueue.addBulk(jobs);
  res.status(202).json({ accepted: true, processed: events.length });
};

eventRouter.post('/', ingestEvents);
eventRouter.post('/batch', ingestEvents);
