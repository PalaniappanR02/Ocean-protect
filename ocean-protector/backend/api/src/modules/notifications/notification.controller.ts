import { Response } from 'express';
import { pool } from '../../database/pool';
import { AuthedRequest } from '../../common/middleware/auth';
import { NotFoundError } from '../../common/errors/AppError';

export const getMyNotifications = async (req: AuthedRequest, res: Response) => {
  const result = await pool.query(`
    SELECT
      id, kind, title, body, entity_type AS "entityType", entity_id AS "entityId",
      is_read AS "isRead", created_at AS "createdAt"
    FROM notifications
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT 50
  `, [req.user!.id]);
  const unread = await pool.query(
    `SELECT COUNT(*)::int AS count FROM notifications WHERE user_id = $1 AND is_read = false`,
    [req.user!.id],
  );
  res.json({ success: true, data: result.rows, meta: { unread: unread.rows[0].count } });
};

export const markNotificationRead = async (req: AuthedRequest, res: Response) => {
  const result = await pool.query(
    `UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2 RETURNING id`,
    [req.params.notificationId, req.user!.id],
  );
  if (result.rowCount === 0) throw new NotFoundError('Notification not found');
  res.json({ success: true, data: { id: req.params.notificationId, isRead: true } });
};

export const markAllRead = async (req: AuthedRequest, res: Response) => {
  await pool.query(`UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false`, [req.user!.id]);
  res.json({ success: true, data: { updated: true } });
};
