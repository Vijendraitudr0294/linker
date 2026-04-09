import express from 'express';
import cors from 'cors';
import { postRouter } from './routes/posts';
import { eventRouter } from './routes/events';
import { dashboardRouter } from './routes/analytics';
import { formUploadRouter } from './routes/formUploads';
import { formsRouter } from './routes/forms';
import "./workers/domainVerifyWorker";
import "./workers/analyticsWorker";
import "./workers/socialWorker";

const app = express();
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:8080,http://127.0.0.1:8080")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error("Origin not allowed"));
  },
}));
app.use(express.json());

app.use('/api/v1/posts', postRouter);
app.use('/api/v1/events', eventRouter);
app.use('/api/v1/analytics', dashboardRouter);
app.use('/api/v1/forms/uploads', formUploadRouter);
app.use('/api/v1/forms', formsRouter);

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

process.on('uncaughtException', (err: Error & { code?: string }) => {
  if (err.code === 'ECONNREFUSED') return;
  log("error", "Uncaught Exception", { error: String(err) });
});
process.on('unhandledRejection', (err: unknown) => {
  if (typeof err === 'object' && err !== null && 'code' in err && (err as { code?: string }).code === 'ECONNREFUSED') return;
});
