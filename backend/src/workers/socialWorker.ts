import { Worker, Job } from 'bullmq';
import { redisConnection, supabase, SocialJobPayload } from '../queues/socialQueue';
import { decryptToken, refreshPlatformToken, publishToPlatform, encryptToken } from '../lib/socialUtils';

export const socialWorker = redisConnection
  ? new Worker<SocialJobPayload>(
      'social-publish',
      async (job: Job<SocialJobPayload>) => {
        const { postId, platforms, userId } = job.data;
        for (const platform of platforms) {
          const { data: record } = await supabase.from('post_platforms').select('status').eq('post_id', postId).eq('platform', platform).single();
          if (record?.status === 'published') continue;

          const { data: tokenRecord } = await supabase.from('oauth_tokens').select('*').eq('user_id', userId).eq('platform', platform).single();
          if (!tokenRecord) throw new Error(`Missing token for ${platform}`);

          let accessToken = decryptToken(tokenRecord.encrypted_token);

          if (new Date(tokenRecord.expires_at) < new Date()) {
            try {
              const refreshedTokenRes = await refreshPlatformToken(platform, tokenRecord.refresh_token);
              if (!refreshedTokenRes) {
                await supabase.from('post_platforms').update({ status: 'reconnect_required' }).eq('post_id', postId).eq('platform', platform);
                continue;
              }
              accessToken = refreshedTokenRes;
              // MANDATORY: Update the encrypted token in the database
              await supabase.from('oauth_tokens').update({
                encrypted_token: encryptToken(accessToken), 
                expires_at: new Date(Date.now() + 3600000).toISOString() // Default to 1h if not provided
              }).eq('id', tokenRecord.id);
            } catch (refreshErr) {
              await supabase.from('post_platforms').update({ status: 'reconnect_required' }).eq('post_id', postId).eq('platform', platform);
              continue; 
            }
          }

          try {
            await publishToPlatform(platform, accessToken, postId);
            await supabase.from('post_platforms').update({ status: 'published', published_at: new Date().toISOString() }).eq('post_id', postId).eq('platform', platform);
          } catch (error: any) {
            if (error.status === 429) {
              const retryAfterHeader = error.headers['retry-after'];
              const delayMs = retryAfterHeader ? parseInt(retryAfterHeader, 10) * 1000 : 300000;
              await job.moveToDelayed(Date.now() + delayMs, job.token!);
              return; 
            }
            if (error.status >= 500) throw new Error(`Platform ${platform} 5xx error: ${error.message}`);
            throw error;
          }
        }
      },
      { connection: redisConnection }
    )
  : null;
