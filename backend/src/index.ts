import express from 'express';
import cors from 'cors';
import { postRouter } from './routes/posts';
import { eventRouter } from './routes/events';
import { dashboardRouter } from './routes/analytics';
import "./workers/domainVerifyWorker";

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/v1/posts', postRouter);
app.use('/api/v1/events', eventRouter);
app.use('/api/v1/analytics', dashboardRouter);

app.get('/health', (req, res) => {
  res.json({ status: "ok", worker: "running" });
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received — draining queue");
  process.exit(0);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`BullMQ Analytics Backend listening on port ${PORT}`);
});

import { log } from './lib/logger';

process.on('uncaughtException', (err: any) => {
  if (err.code === 'ECONNREFUSED') return;
  log("error", "Uncaught Exception", { error: String(err) });
});
process.on('unhandledRejection', (err: any) => {
  if (err.code === 'ECONNREFUSED') return;
});
