import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/middleware";
import { db, customDomains } from "@/db";
import { eq } from "drizzle-orm";
import { generateTxtRecord } from "@/lib/domains/generateTxtRecord";
import { domainVerifyQueue } from "@/lib/queues";

// GET — fetch current domain for the logged-in user
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const [domain] = await db
    .select()
    .from(customDomains)
    .where(eq(customDomains.userId, auth.user.sub))
    .limit(1);

  return NextResponse.json({ domain: domain ?? null });
}

// POST — register a new domain and get TXT record
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const { domain } = await req.json();

  const domainRegex = /^(?!:\/\/)([a-zA-Z0-9-_]+\.)+[a-zA-Z]{2,}$/;
  if (!domain || !domainRegex.test(domain)) {
    return NextResponse.json(
      { error: { code: "VALIDATION", message: "Invalid domain format" } },
      { status: 400 }
    );
  }

  const appDomain = new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://placeholder.com').hostname;
  if (domain.endsWith(appDomain)) {
    return NextResponse.json(
      { error: { code: "VALIDATION", message: "Cannot use the app's own domain" } },
      { status: 400 }
    );
  }

  const [existing] = await db
    .select({ userId: customDomains.userId })
    .from(customDomains)
    .where(eq(customDomains.domain, domain))
    .limit(1);

  if (existing && existing.userId !== auth.user.sub) {
    return NextResponse.json(
      { error: { code: "CONFLICT", message: "Domain already registered" } },
      { status: 409 }
    );
  }

  const txtRecord = generateTxtRecord(auth.user.sub, domain);

  const [record] = await db
    .insert(customDomains)
    .values({
      userId:    auth.user.sub,
      domain:    domain.toLowerCase(),
      txtRecord,
      verified:  false,
    })
    .onConflictDoUpdate({
      target: customDomains.userId,
      set: {
        domain:     domain.toLowerCase(),
        txtRecord,
        verified:   false,
        verifiedAt: null,
      },
    })
    .returning();

  await domainVerifyQueue.add("verify", {
    userId:    auth.user.sub,
    domain:    record.domain,
    txtRecord: record.txtRecord,
  });

  return NextResponse.json({
    domain:         record.domain,
    txtRecord:      record.txtRecord,
    verified:       record.verified,
    instructions: {
      type:  "TXT",
      host:  "@",
      value: record.txtRecord,
      ttl:   "300",
      note:  "DNS changes can take up to 48 hours to propagate. We check every 5 minutes.",
    },
  }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  await db
    .delete(customDomains)
    .where(eq(customDomains.userId, auth.user.sub));

  return new NextResponse(null, { status: 204 });
}
