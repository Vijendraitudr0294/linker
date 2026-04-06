export async function verifyDnsTxt(
  domain: string,
  expectedRecord: string
): Promise<{ verified: boolean; found: string[] }> {
  try {
    const res = await fetch(
      `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=TXT`,
      { next: { revalidate: 0 } }
    );

    if (!res.ok) return { verified: false, found: [] };

    const data = await res.json();
    const records: string[] = (data.Answer ?? [])
      .filter((a: { type: number }) => a.type === 16)
      .map((a: { data: string }) =>
        a.data.replace(/^"|"$/g, "").trim()
      );

    return {
      verified: records.includes(expectedRecord),
      found:    records,
    };
  } catch {
    return { verified: false, found: [] };
  }
}
