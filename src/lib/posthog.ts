// Mock PostHog for FREE MVP Tracking (Step 4)
// This simulates the tracking described in the user's roadmap

export const posthog = {
  capture: (event: string, properties: any = {}) => {
    console.log(`[PostHog Capture] ${event}`, properties);
    
    // Persist event to local vault for analytics dashboard
    try {
      const events = JSON.parse(localStorage.getItem('posthog_events') || '[]');
      events.unshift({
        id: crypto.randomUUID(),
        event,
        properties,
        timestamp: new Date().toISOString()
      });
      // Keep only last 100 events
      localStorage.setItem('posthog_events', JSON.stringify(events.slice(0, 100)));
      
      // Sync to Supabase mock for durability
      // supabase.from('tracking_events').insert({ ... })
    } catch (e) {}
  },
  identify: (userId: string, properties: any = {}) => {
    console.log(`[PostHog Identify] ${userId}`, properties);
    localStorage.setItem('posthog_user_id', userId);
  }
};
