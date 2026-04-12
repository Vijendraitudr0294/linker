import { Worker } from "bullmq";
import { createClient } from "@supabase/supabase-js";
import { redisConnection } from "../queues/socialQueue";

const supabase = createClient(
  process.env.SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || "placeholder"
);

export const domainVerifyWorker = new Worker(
  "domain-verify",
  async (job) => {
    const { userId, domain, txtRecord } = job.data;

    const res  = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=TXT`
    );
    const data = await res.json();

    const records: string[] = (data.Answer ?? [])
      .filter((a: { type: number }) => a.type === 16)
      .map((a: { data: string }) =>
        a.data.replace(/^"|"$/g, "").trim()
      );

    if (records.includes(txtRecord)) {
      await supabase
        .from("custom_domains")
        .update({ verified: true, verified_at: new Date().toISOString() })
        .eq("user_id", userId)
        .eq("domain", domain);

      console.log("[domain-verify] ✅ Domain verified:", { userId, domain });

      // Remove remaining attempts since verification succeeded
      await job.remove();
      return;
    }

    console.log("[domain-verify] ⏳ Domain not yet verified:", {
      userId, domain, attempt: job.attemptsMade,
    });

    // Throw to trigger retry with backoff
    throw new Error(`DNS record not found for ${domain} (attempt ${job.attemptsMade})`);
  },
  { connection: redisConnection, concurrency: 10 }
);
