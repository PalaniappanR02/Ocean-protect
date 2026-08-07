import { Router } from 'express';
import { getPublicIncidents, getPublicIncident, getPublicMap, getPublicAlerts } from './public.controller';
import { asyncHandler } from '../../common/utils/asyncHandler';

const router = Router();

router.get('/incidents', asyncHandler(getPublicIncidents));
router.get('/incidents/:incidentId', asyncHandler(getPublicIncident));
router.get('/map', asyncHandler(getPublicMap));
router.get('/alerts', asyncHandler(getPublicAlerts));

export default router;