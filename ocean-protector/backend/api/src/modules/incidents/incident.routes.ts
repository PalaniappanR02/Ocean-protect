import { Router } from 'express';
import { createIncidentEndpoint, getIncidents, getIncident, patchIncidentStatus, attachReport, detachReport, verifyIncident, assignTeam, resolveIncident, getResponseTeams } from './incident.controller';
import { verifyToken, requireRole } from '../../common/middleware/auth'; // add

const router = Router();

router.get('/', getIncidents);
router.post('/', verifyToken, requireRole('authority_operator'), createIncidentEndpoint);
router.get('/teams', getResponseTeams);
router.get('/:incidentId', getIncident);
router.patch('/:incidentId/status', verifyToken, requireRole('authority_operator'), patchIncidentStatus);
router.post('/:incidentId/attach-report', verifyToken, requireRole('authority_operator'), attachReport);
router.post('/:incidentId/detach-report', verifyToken, requireRole('authority_operator'), detachReport);
router.post('/:incidentId/verify', verifyToken, requireRole('authority_supervisor'), verifyIncident);
router.post('/:incidentId/assign-team', verifyToken, requireRole('authority_operator'), assignTeam);
router.post('/:incidentId/resolve', verifyToken, requireRole('authority_supervisor'), resolveIncident);

export default router;