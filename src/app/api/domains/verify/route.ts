import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/middleware";
import { db, customDomains } from "@/db";
import { eq } from "drizzle-orm";
import { verifyDnsTxt } from "@/lib/domains/verifyDnsTxt";

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  const [record] = await db
    .select()
    .from(customDomains)
    .where(eq(customDomains.userId, auth.user.sub))
    .limit(1);

  if (!record) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "No domain registered" } },
      { status: 404 }
    );
  }

  if (record.verified) {
    return NextResponse.json({
      verified:   true,
      verifiedAt: record.verifiedAt,
      message:    "Domain already verified",
    });
  }

  const { verified, found } = await verifyDnsTxt(
    record.domain,
    record.txtRecord
  );

  if (verified) {
    await db
      .update(customDomains)
      .set({ verified: true, verifiedAt: new Date() })
      .where(eq(customDomains.userId, auth.user.sub));
  }

  return NextResponse.json({
    verified,
    domain:      record.domain,
    expected:    record.txtRecord,
    found,
    message: verified
      ? "Domain verified successfully"
      : "TXT record not found yet. DNS changes can take up to 48 hours.",
  });
}
