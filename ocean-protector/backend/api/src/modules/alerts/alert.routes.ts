import { Router } from 'express';
import { createAlertEndpoint, deactivateAlertEndpoint, getAlerts } from './alert.controller';
import { verifyToken, requireRole } from '../../common/middleware/auth';
import { asyncHandler } from '../../common/utils/asyncHandler';

const router = Router();

router.get('/', verifyToken, requireRole('analyst'), asyncHandler(getAlerts));
router.post('/', verifyToken, requireRole('authority_operator'), asyncHandler(createAlertEndpoint));
router.patch('/:alertId/deactivate', verifyToken, requireRole('authority_operator'), asyncHandler(deactivateAlertEndpoint));

export default router;
