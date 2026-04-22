import { Request, Response, Router } from "express";
import rateLimit from "express-rate-limit";
import { analyticsQueue, supabase } from "../queues/socialQueue";
import { normalizeAnalyticsEvents } from "../lib/eventsPayload";

export const eventRouter = Router();

const eventsLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many analytics events. Please slow down." },
});
eventRouter.use(eventsLimiter);

const ingestEvents = async (req: Request, res: Response) => {
  const events = normalizeAnalyticsEvents(req.body);
  if (!events) return res.status(422).json({ error: "Payload must include at least one valid event" });

  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const user_agent = req.headers["user-agent"];

  const jobs = events.map((event) => ({
    name: "track",
    data: {
      ...event,
      properties: { ...(event.properties || {}), ip_country: ip, user_agent },
      occurred_at: event.occurred_at || new Date().toISOString(),
    },
    opts: { removeOnComplete: true },
  }));

  if (!analyticsQueue) {
    const payload = jobs.map((job) => ({
      event_type: job.data.event_type,
      entity_id: job.data.entity_id,
      user_id: job.data.user_id,
      properties: job.data.properties,
      occurred_at: job.data.occurred_at,
    }));

    const { error } = await supabase.from("analytics_events").insert(payload);
    if (error) {
      return res.status(500).json({ error: "Failed to store analytics events", details: error.message });
    }

    return res.status(202).json({ accepted: true, processed: events.length, mode: "direct" });
  }

  await analyticsQueue.addBulk(jobs);
  return res.status(202).json({ accepted: true, processed: events.length, mode: "queued" });
};

eventRouter.post("/", ingestEvents);
eventRouter.post("/batch", ingestEvents);
