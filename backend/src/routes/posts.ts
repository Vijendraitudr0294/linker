import { Router } from 'express';
import { socialQueue, socialDlqQueue, supabase } from '../queues/socialQueue';

export const postRouter = Router();

postRouter.post('/', async (req, res) => {
  const { userId, platforms, scheduledAt, content } = req.body;
  const { data: post } = await supabase.from('posts').insert({
    user_id: userId, content, scheduled_at: new Date(scheduledAt).toISOString()
  }).select().single();

  const delay = Math.max(0, scheduledAt - Date.now());
  const job = await socialQueue.add('publish', { postId: post.id, userId, platforms, scheduledAt }, { delay, jobId: `post-${post.id}` });
  res.json({ post, jobId: job.id });
});

postRouter.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { scheduledAt, status } = req.body;
  if (status === 'scheduled' && scheduledAt) {
    const oldJob = await socialQueue.getJob(`post-${id}`);
    if (oldJob && await oldJob.isActive() === false) await oldJob.remove();

    const { data: post } = await supabase.from('posts').select('*').eq('id', id).single();
    const delay = Math.max(0, scheduledAt - Date.now());
    await socialQueue.add('publish', { postId: post.id, userId: post.user_id, platforms: post.platforms, scheduledAt }, { delay, jobId: `post-${id}` });
  }
  await supabase.from('posts').update({ scheduled_at: new Date(scheduledAt).toISOString() }).eq('id', id);
  res.sendStatus(200);
});

postRouter.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const job = await socialQueue.getJob(`post-${id}`);
  if (job) {
    const state = await job.getState();
    if (state !== 'active') await job.remove();
  }
  await supabase.from('posts').update({ status: 'cancelled' }).eq('id', id);
  res.sendStatus(200);
});

postRouter.get('/health', async (req, res) => {
  const counts = await socialQueue.getJobCounts();
  const dlqCounts = await socialDlqQueue.getJobCounts();
  res.json({ waiting: counts.waiting, active: counts.active, failed: counts.failed, dlq: dlqCounts.waiting + dlqCounts.completed });
});
