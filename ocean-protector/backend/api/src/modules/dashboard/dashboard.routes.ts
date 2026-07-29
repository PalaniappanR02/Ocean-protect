import { Router } from 'express';
import { getDashboardSummary, getStateComparison, getTimeline } from './dashboard.controller';
import { asyncHandler } from '../../common/utils/asyncHandler';

const router = Router();
router.get('/summary', asyncHandler(getDashboardSummary));
router.get('/timeline', asyncHandler(getTimeline));
router.get('/state-comparison', asyncHandler(getStateComparison));
export default router;
