import { Router } from 'express';
import {
  createReport, getMyReports, getReport, getReportByTrackingId, getReportConfidence,
  getReportHistory, getReports, getReportsMap, recalculateConfidence, updateReportStatus,
} from './report.controller';
import { asyncHandler } from '../../common/utils/asyncHandler';
import { verifyToken, requireRole, attachUserIfPresent } from '../../common/middleware/auth';

const router = Router();

router.post('/', attachUserIfPresent, asyncHandler(createReport));
router.get('/', asyncHandler(getReports));
router.get('/mine', verifyToken, asyncHandler(getMyReports));
router.get('/map', asyncHandler(getReportsMap));
router.get('/tracking/:trackingId', asyncHandler(getReportByTrackingId));
router.get('/:reportId', asyncHandler(getReport));
router.get('/:reportId/confidence', asyncHandler(getReportConfidence));
router.get('/:reportId/history', asyncHandler(getReportHistory));
router.patch('/:reportId/status', verifyToken, requireRole('analyst'), asyncHandler(updateReportStatus));
router.post('/:reportId/recalculate-confidence', verifyToken, requireRole('analyst'), asyncHandler(recalculateConfidence));

export default router;