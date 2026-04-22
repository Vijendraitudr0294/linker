import { Worker } from "bullmq";
import { redisConnection, supabase } from "../queues/socialQueue";

export const domainVerifyWorker = redisConnection
  ? new Worker(
      "domain-verify",
      async (job) => {
        const { userId, domain, txtRecord } = job.data as { userId: string; domain: string; txtRecord: string };

        const res = await fetch(
          `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=TXT`
        );
        const data = (await res.json()) as {
          Answer?: Array<{ type: number; data: string }>;
        };

        const records: string[] = (data.Answer ?? [])
          .filter((a) => a.type === 16)
          .map((a) => a.data.replace(/^"|"$/g, "").trim());

        if (records.includes(txtRecord)) {
          await supabase
            .from("custom_domains")
            .update({ verified: true, verified_at: new Date().toISOString() })
            .eq("user_id", userId)
            .eq("domain", domain);

          console.log("[domain-verify] verified:", { userId, domain });
          await job.remove();
          return;
        }

        console.log("[domain-verify] pending:", {
          userId,
          domain,
          attempt: job.attemptsMade,
        });
        throw new Error(`DNS record not found for ${domain} (attempt ${job.attemptsMade})`);
      },
      { connection: redisConnection, concurrency: 10 }
    )
  : null;

