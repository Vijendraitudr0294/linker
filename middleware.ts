import { NextRequest, NextResponse } from "next/server";

// In-memory store for edge rate limiting
const RATE_LIMITS: Record<string, { count: number; resetAt: number }> = {};

const LIMITS: Record<string, { max: number; windowMs: number }> = {
  "/api/auth/login":    { max: 10,   windowMs: 60_000  },
  "/api/auth/register": { max: 5,    windowMs: 60_000  },
  "/api/events/batch":  { max: 60,   windowMs: 60_000  },
  "/api/qr":            { max: 30,   windowMs: 60_000  },
  "default":            { max: 120,  windowMs: 60_000  },
};

export async function middleware(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]
             ?? req.headers.get("x-real-ip")
             ?? "unknown";

  const path   = req.nextUrl.pathname;
  const limit  = LIMITS[path] ?? LIMITS["default"];
  const key    = `${ip}:${path}`;
  const now    = Date.now();

  if (!RATE_LIMITS[key] || RATE_LIMITS[key].resetAt < now) {
    RATE_LIMITS[key] = { count: 1, resetAt: now + limit.windowMs };
  } else {
    RATE_LIMITS[key].count++;
  }

  if (RATE_LIMITS[key].count > limit.max) {
    return NextResponse.json(
      { error: { code: "RATE_LIMITED", message: "Too many requests" } },
      {
        status: 429,
        headers: {
          "Retry-After":       String(Math.ceil((RATE_LIMITS[key].resetAt - now) / 1000)),
          "X-RateLimit-Limit": String(limit.max),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  // Block all /admin routes for non-admins at the edge
  if (req.nextUrl.pathname.startsWith("/admin")) {
    const token = req.cookies.get("token")?.value
                  ?? req.headers.get("authorization")?.slice(7);
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    try {
      // @ts-ignore dynamic import for edge environments
      const { verifyToken } = await import("@/lib/auth/jwt");
      const payload = await verifyToken(token);
      if (!payload) throw new Error();
    } catch {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  const res = NextResponse.next();
  res.headers.set("X-RateLimit-Limit",     String(limit.max));
  res.headers.set("X-RateLimit-Remaining", String(limit.max - RATE_LIMITS[key].count));
  return res;
}

export const config = {
  matcher: ["/api/:path*", "/admin/:path*"],
};
