import { Router } from 'express';
import { createIncidentEndpoint, getIncidents, getIncident, patchIncidentStatus, attachReport, detachReport, verifyIncident, assignTeam, resolveIncident, getResponseTeams } from './incident.controller';
import { verifyToken, requireRole } from '../../common/middleware/auth';
import { asyncHandler } from '../../common/utils/asyncHandler';

const router = Router();

router.get('/', asyncHandler(getIncidents));
router.post('/', verifyToken, requireRole('authority_operator'), asyncHandler(createIncidentEndpoint));
router.get('/teams', asyncHandler(getResponseTeams));
router.get('/:incidentId', asyncHandler(getIncident));
router.patch('/:incidentId/status', verifyToken, requireRole('authority_operator'), asyncHandler(patchIncidentStatus));
router.post('/:incidentId/attach-report', verifyToken, requireRole('authority_operator'), asyncHandler(attachReport));
router.post('/:incidentId/detach-report', verifyToken, requireRole('authority_operator'), asyncHandler(detachReport));
router.post('/:incidentId/verify', verifyToken, requireRole('authority_supervisor'), asyncHandler(verifyIncident));
router.post('/:incidentId/assign-team', verifyToken, requireRole('authority_operator'), asyncHandler(assignTeam));
router.post('/:incidentId/resolve', verifyToken, requireRole('authority_supervisor'), asyncHandler(resolveIncident));

export default router;