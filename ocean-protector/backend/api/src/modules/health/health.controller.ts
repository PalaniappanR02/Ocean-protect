import { Request, Response } from 'express';
import { pool } from '../../database/pool';
import { env } from '../../config/env';
import { normaliseServiceUrl } from '../../config/urls';

const classifierBaseUrl = normaliseServiceUrl(env.CLASSIFIER_SERVICE_URL);

export const checkHealth = async (_req: Request, res: Response) => {
  let dbStatus = 'disconnected';
  let classifierStatus = 'disconnected';

  try {
    await pool.query('SELECT 1');
    dbStatus = 'connected';
  } catch (error) {
    console.error('DB health check failed', error);
  }

  try {
    const response = await fetch(`${classifierBaseUrl}/health`, {
      signal: AbortSignal.timeout(3000),
    });
    if (response.ok) classifierStatus = 'connected';
  } catch (error) {
    console.error('Classifier health check failed', error);
  }

  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: { database: dbStatus, classifier: classifierStatus },
    },
  });
};
