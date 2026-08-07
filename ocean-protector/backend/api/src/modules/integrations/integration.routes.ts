import { Router } from 'express';
import { getIntegrationStatus, placeVoiceReport, getIncoisLatest } from './integration.controller';
import { verifyToken } from '../../common/middleware/auth';
import { asyncHandler } from '../../common/utils/asyncHandler';

const router = Router();

router.get('/status', asyncHandler(getIntegrationStatus));
router.get('/incois/latest', asyncHandler(getIncoisLatest));
router.post('/voice/report', verifyToken, asyncHandler(placeVoiceReport));

export default router;
