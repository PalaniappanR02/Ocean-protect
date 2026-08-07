import { Router } from 'express';
import {
  getSocialSignals,
  getSocialMap,
  getSocialTrends,
  getSocialHotspots,
  importSocialSignalEndpoint,
  reviewSocialSignal,
} from './social.controller';
import { verifyToken, requireRole } from '../../common/middleware/auth';
import { asyncHandler } from '../../common/utils/asyncHandler';

const router = Router();

router.get('/', asyncHandler(getSocialSignals));
router.get('/map', asyncHandler(getSocialMap));
router.get('/trends', asyncHandler(getSocialTrends));
router.get('/hotspots', asyncHandler(getSocialHotspots));
router.post('/import', verifyToken, requireRole('analyst'), asyncHandler(importSocialSignalEndpoint));
router.post('/:signalId/review', verifyToken, requireRole('analyst'), asyncHandler(reviewSocialSignal));

export default router;
