import { createHmac } from "crypto";

export function generateTxtRecord(userId: string, domain: string): string {
  const hmac = createHmac("sha256", process.env.JWT_SECRET || 'fallback_secret')
    .update(`${userId}:${domain}`)
    .digest("hex")
    .slice(0, 32);
  return `linktree-verify=${hmac}`;
}
