import { buildBackendUrl } from "@/lib/backendUrl";

export interface AnalyticsEventPayload {
  event_type: string;
  entity_id: string;
  user_id?: string;
  properties?: Record<string, unknown>;
}

const isValidAnalyticsEvent = (event: AnalyticsEventPayload | null | undefined): event is AnalyticsEventPayload => {
  return Boolean(event?.event_type?.trim() && event?.entity_id?.trim());
};

export const sendAnalyticsEvents = async (
  events: AnalyticsEventPayload | AnalyticsEventPayload[]
): Promise<boolean> => {
  const batch = (Array.isArray(events) ? events : [events]).filter(isValidAnalyticsEvent);
  if (batch.length === 0) return false;

  try {
    const response = await fetch(buildBackendUrl("/api/v1/events"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(batch.length === 1 ? batch[0] : batch),
    });

    return response.ok;
  } catch {
    return false;
  }
};
