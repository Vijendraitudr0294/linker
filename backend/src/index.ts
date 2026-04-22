import express from "express";
import cors from "cors";
import { postRouter } from "./routes/posts";
import { eventRouter } from "./routes/events";
import { dashboardRouter } from "./routes/analytics";
import { formUploadRouter } from "./routes/formUploads";
import { formsRouter } from "./routes/forms";
import { resolveBackendRuntimeConfig } from "./lib/runtimeConfig";
import { log } from "./lib/logger";
import "./workers/domainVerifyWorker";
import "./workers/analyticsWorker";
import "./workers/socialWorker";

const app = express();
const runtime = resolveBackendRuntimeConfig(process.env);
const allowedOrigins = runtime.corsOrigins;

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const isOriginAllowed = (origin: string) =>
  allowedOrigins.some((candidate) => {
    if (candidate === "*") return true;
    if (candidate === origin) return true;
    if (!candidate.includes("*")) return false;
    const pattern = `^${candidate.split("*").map(escapeRegex).join(".*")}$`;
    return new RegExp(pattern).test(origin);
  });

app.set("trust proxy", 1);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || isOriginAllowed(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Origin not allowed"));
    },
  })
);
app.use(express.json());

app.use("/api/v1/posts", postRouter);
app.use("/api/v1/events", eventRouter);
app.use("/api/v1/analytics", dashboardRouter);
app.use("/api/v1/forms/uploads", formUploadRouter);
app.use("/api/v1/forms", formsRouter);

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    worker: "running",
    queuesEnabled: runtime.queuesEnabled,
    redisConfigured: Boolean(runtime.redisUrl),
    corsOrigins: runtime.corsOrigins,
    publicSiteUrl: runtime.publicSiteUrl,
  });
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received - draining queue");
  process.exit(0);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`BullMQ Analytics Backend listening on port ${PORT}`);
});

process.on("uncaughtException", (err: Error & { code?: string }) => {
  if (err.code === "ECONNREFUSED") return;
  log("error", "Uncaught Exception", { error: String(err) });
});
process.on("unhandledRejection", (err: unknown) => {
  if (typeof err === "object" && err !== null && "code" in err && (err as { code?: string }).code === "ECONNREFUSED") return;
});
