import { Response, Router } from 'express';
import { queueUnavailableMessage, socialDlqQueue, socialQueue, supabase } from '../queues/socialQueue';
import { parseScheduledAt, sanitizePostPayload } from '../lib/postScheduling';
import { requireSupabaseAuth } from '../lib/auth';

export const postRouter = Router();
postRouter.use(requireSupabaseAuth);

const ensureQueues = (res: Response): boolean => {
  if (!socialQueue || !socialDlqQueue) {
    res.status(503).json({ error: queueUnavailableMessage });
    return false;
  }
  return true;
};

postRouter.post('/', async (req, res) => {
  if (!ensureQueues(res)) return;
  const queue = socialQueue;
  if (!queue) return;

  const payload = sanitizePostPayload(req.body);
  if (!payload || !payload.scheduledAt) {
    return res.status(422).json({ error: 'content, platforms, and a valid scheduledAt are required' });
  }

  const { platforms, scheduledAt, content } = payload;
  const userId = res.locals.authUserId as string;
  const { data: post } = await supabase.from('posts').insert({
    user_id: userId, content, scheduled_at: scheduledAt.scheduledAtIso
  }).select().single();

  const delay = Math.max(0, scheduledAt.scheduledAtMs - Date.now());
  const job = await queue.add('publish', { postId: post.id, userId, platforms, scheduledAt: scheduledAt.scheduledAtMs }, { delay, jobId: `post-${post.id}` });
  res.json({ post, jobId: job.id });
});

postRouter.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { scheduledAt, status } = req.body;
  const parsedScheduledAt =
    scheduledAt === undefined ? null : parseScheduledAt(scheduledAt);

  if (scheduledAt !== undefined && scheduledAt !== null && !parsedScheduledAt) {
    return res.status(422).json({ error: 'scheduledAt must be a valid ISO string or timestamp' });
  }

  const { data: post } = await supabase.from('posts').select('*').eq('id', id).single();
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }
  if (post.user_id !== res.locals.authUserId) {
    return res.status(403).json({ error: 'You do not have access to this post' });
  }

  if (status === 'scheduled' && parsedScheduledAt) {
    if (!ensureQueues(res)) return;
    const queue = socialQueue;
    if (!queue) return;

    const oldJob = await queue.getJob(`post-${id}`);
    if (oldJob && await oldJob.isActive() === false) await oldJob.remove();

    const delay = Math.max(0, parsedScheduledAt.scheduledAtMs - Date.now());
    await queue.add('publish', { postId: post.id, userId: post.user_id, platforms: post.platforms, scheduledAt: parsedScheduledAt.scheduledAtMs }, { delay, jobId: `post-${id}` });
  }

  const updatePayload: Record<string, unknown> = {};
  if (status) updatePayload.status = status;
  if (parsedScheduledAt) updatePayload.scheduled_at = parsedScheduledAt.scheduledAtIso;

  if (Object.keys(updatePayload).length > 0) {
    await supabase.from('posts').update(updatePayload).eq('id', id);
  }

  res.sendStatus(200);
});

postRouter.delete('/:id', async (req, res) => {
  if (!ensureQueues(res)) return;
  const queue = socialQueue;
  if (!queue) return;

  const { id } = req.params;
  const { data: post } = await supabase.from('posts').select('user_id').eq('id', id).single();
  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }
  if (post.user_id !== res.locals.authUserId) {
    return res.status(403).json({ error: 'You do not have access to this post' });
  }

  const job = await queue.getJob(`post-${id}`);
  if (job) {
    const state = await job.getState();
    if (state !== 'active') await job.remove();
  }
  await supabase.from('posts').update({ status: 'cancelled' }).eq('id', id);
  res.sendStatus(200);
});

postRouter.get('/health', async (req, res) => {
  if (!ensureQueues(res)) return;
  const queue = socialQueue;
  const dlq = socialDlqQueue;
  if (!queue || !dlq) return;
  const counts = await queue.getJobCounts();
  const dlqCounts = await dlq.getJobCounts();
  res.json({ waiting: counts.waiting, active: counts.active, failed: counts.failed, dlq: dlqCounts.waiting + dlqCounts.completed });
});
