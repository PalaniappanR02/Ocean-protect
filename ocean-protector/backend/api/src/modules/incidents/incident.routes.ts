import { Router } from 'express';
import { createIncidentEndpoint, getIncidents, getIncident, patchIncidentStatus, attachReport, detachReport, verifyIncident, assignTeam, resolveIncident, getResponseTeams } from './incident.controller';

const router = Router();

router.get('/', getIncidents);
router.post('/', createIncidentEndpoint);
router.get('/teams', getResponseTeams); // Placed before /:incidentId to avoid route conflict
router.get('/:incidentId', getIncident);
router.patch('/:incidentId/status', patchIncidentStatus);
router.post('/:incidentId/attach-report', attachReport);
router.post('/:incidentId/detach-report', detachReport);
router.post('/:incidentId/verify', verifyIncident);
router.post('/:incidentId/assign-team', assignTeam);
router.post('/:incidentId/resolve', resolveIncident);

export default router;