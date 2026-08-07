import { Request, Response } from 'express';
import { createAlert, deactivateAlert, findAllAlerts, notifyAllUsers } from './alert.repository';
import { NotFoundError, ValidationError } from '../../common/errors/AppError';
import { createAuditEvent } from '../audit/audit.repository';
import { AuthedRequest } from '../../common/middleware/auth';

export const createAlertEndpoint = async (req: Request, res: Response) => {
  const { incidentId, title, message, severity, expiresAt } = req.body ?? {};
  if (!incidentId || !title || !message || !severity) {
    throw new ValidationError('incidentId, title, message and severity are required.');
  }

  const alert = await createAlert({ incidentId, title, message, severity, expiresAt });
  await notifyAllUsers('alert', title, message, 'alert', alert.id);
  await createAuditEvent(
    'alert',
    alert.id,
    'PUBLISHED',
    null,
    { incidentId, severity },
    'Public alert published.',
    'authority',
    (req as AuthedRequest).user?.email ?? 'authority',
  );
  res.status(201).json({ success: true, data: alert });
};

export const getAlerts = async (req: Request, res: Response) => {
  const activeOnly = req.query.active === 'true';
  const alerts = await findAllAlerts(activeOnly);
  res.json({ success: true, data: alerts });
};

export const deactivateAlertEndpoint = async (req: Request, res: Response) => {
  const updated = await deactivateAlert(req.params.alertId);
  if (!updated) throw new NotFoundError('Active alert not found');
  res.json({ success: true, data: { id: req.params.alertId, isActive: false } });
};
