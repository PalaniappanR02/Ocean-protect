import { Router } from 'express';
import { getPublicIncidents, getPublicIncident, getPublicMap, getPublicAlerts } from './public.controller';

const router = Router();

router.get('/incidents', getPublicIncidents);
router.get('/incidents/:incidentId', getPublicIncident);
router.get('/map', getPublicMap);
router.get('/alerts', getPublicAlerts);

export default router;