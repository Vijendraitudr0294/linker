import { Queue } from "bullmq";
import { redis } from "./redis";

export const domainVerifyQueue = new Queue("domain-verify", {
  connection: redis,
  defaultJobOptions: {
    attempts:  288,
    backoff:   { type: "fixed", delay: 300_000 },
    removeOnComplete: true,
    removeOnFail:     true,
  },
});
