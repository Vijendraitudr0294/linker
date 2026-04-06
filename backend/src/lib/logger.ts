export function log(level: "info" | "error" | "warn", message: string, meta?: object) {
  const payload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  };

  if (process.env.BETTERSTACK_SOURCE_TOKEN) {
    fetch("https://in.logs.betterstack.com", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.BETTERSTACK_SOURCE_TOKEN}`,
      },
      body: JSON.stringify(payload),
    }).catch(() => {});
  }

  console[level](JSON.stringify(payload));
}
