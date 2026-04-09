import { Router } from 'express';
import { supabase } from '../queues/socialQueue';
import { requireSupabaseAuth } from '../lib/auth';

export const dashboardRouter = Router();
dashboardRouter.use(requireSupabaseAuth);

dashboardRouter.get('/summary', async (req, res) => {
  const { entity_id, days = 30 } = req.query;
  if (!entity_id) return res.status(400).json({ error: 'entity_id is required '});

  const historicalBoundary = new Date();
  historicalBoundary.setDate(historicalBoundary.getDate() - Number(days));

  const { data, error } = await supabase
    .from('analytics_daily')
    .select('event_date, event_count')
    .eq('entity_id', entity_id)
    .gte('event_date', historicalBoundary.toISOString().split('T')[0])
    .order('event_date', { ascending: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});
