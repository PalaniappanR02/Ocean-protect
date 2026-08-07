import { env } from '../../../config/env';
import { AppError } from '../../../common/errors/AppError';

/**
 * INCOIS (Indian National Centre for Ocean Information Services) warning feed
 * integration. Configure `INCOIS_FEED_URL` to pull official bulletins. When
 * unconfigured the status endpoint reports it honestly and fetches fail closed.
 */
export const incoisStatus = () => ({
  configured: Boolean(env.INCOIS_FEED_URL),
  feedUrl: env.INCOIS_FEED_URL || null,
  requiredEnv: ['INCOIS_FEED_URL'],
});

export const fetchLatestIncoisBulletin = async () => {
  if (!env.INCOIS_FEED_URL) {
    throw new AppError(503, 'INTEGRATION_NOT_CONFIGURED', 'INCOIS feed URL is not configured.');
  }

  const response = await fetch(env.INCOIS_FEED_URL, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(8000),
  });

  if (!response.ok) {
    throw new AppError(502, 'INTEGRATION_FETCH_FAILED', `INCOIS feed returned status ${response.status}`);
  }

  return response.json();
};
