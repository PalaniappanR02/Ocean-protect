import { Router } from 'express';
import {
  createReport,
  getReport,
  getReportByTrackingId,
  getReportConfidence,
  getReportHistory,
  getReports,
  getReportsMap,
  recalculateConfidence,
  updateReportStatus,
} from './report.controller';
import { asyncHandler } from '../../common/utils/asyncHandler';

const router = Router();

router.post('/', asyncHandler(createReport));
router.get('/', asyncHandler(getReports));
router.get('/map', asyncHandler(getReportsMap));
router.get('/tracking/:trackingId', asyncHandler(getReportByTrackingId));
router.get('/:reportId', asyncHandler(getReport));
router.get('/:reportId/confidence', asyncHandler(getReportConfidence));
router.get('/:reportId/history', asyncHandler(getReportHistory));
router.patch('/:reportId/status', asyncHandler(updateReportStatus));
router.post('/:reportId/recalculate-confidence', asyncHandler(recalculateConfidence));

export default router;
