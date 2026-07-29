import { Router } from 'express';
import { getSocialSignals, getSocialSummaryEndpoint, getSocialTrends, getSocialMap } from './social.controller';

const router = Router();

router.get('/', getSocialSignals);
router.get('/summary', getSocialSummaryEndpoint);
router.get('/trends', getSocialTrends);
router.get('/map', getSocialMap);

export default router;