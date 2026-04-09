export function log(level: "info" | "error" | "warn", message: string, meta?: object) {
  const payload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  };

  // Use import.meta.env for Vite (process.env is a Node.js API, not available in browser)
  const betterStackToken = import.meta.env.VITE_BETTERSTACK_SOURCE_TOKEN;
  if (betterStackToken) {
    fetch("https://in.logs.betterstack.com", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${betterStackToken}`,
      },
      body: JSON.stringify(payload),
    }).catch(() => {});
  }

  console[level](JSON.stringify(payload));
}
