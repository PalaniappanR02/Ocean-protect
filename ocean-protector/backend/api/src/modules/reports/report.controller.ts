import type { Request, Response } from 'express';
import {
  createReportService,
  recalculateReportConfidenceService,
  updateReportStatusService,
} from './report.service';
import {
  findAllReports,
  findReportById,
  findReportByTrackingId,
  getReportConfidenceRows,
  getReportHistoryRows,
} from './report.repository';
import { mapReportToResponse } from './report.mapper';
import { createReportSchema, reportQuerySchema, updateReportStatusSchema } from './report.schema';
import { NotFoundError } from '../../common/errors/AppError';

export const createReport = async (req: Request, res: Response) => {
  const candidate = {
    ...req.body,
    clientReportId: req.body.clientReportId ?? req.headers['idempotency-key'],
  };
  const validated = createReportSchema.parse(candidate);
  const { report, duplicatePrevented } = await createReportService(validated);

  res.status(duplicatePrevented ? 200 : 201).json({
    success: true,
    data: mapReportToResponse(report),
    meta: { duplicatePrevented },
  });
};

export const getReports = async (req: Request, res: Response) => {
  const filters = reportQuerySchema.parse(req.query);
  const { reports, total } = await findAllReports(filters);

  res.json({
    success: true,
    data: reports.map((report) => mapReportToResponse(report)),
    meta: {
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / filters.limit)),
    },
  });
};

export const getReport = async (req: Request, res: Response) => {
  const report = await findReportById(req.params.reportId);
  if (!report) throw new NotFoundError('Report not found');
  res.json({ success: true, data: mapReportToResponse(report) });
};

export const getReportByTrackingId = async (req: Request, res: Response) => {
  const report = await findReportByTrackingId(req.params.trackingId.toUpperCase());
  if (!report) throw new NotFoundError('Report not found');
  res.json({ success: true, data: mapReportToResponse(report) });
};

export const getReportConfidence = async (req: Request, res: Response) => {
  const report = await findReportById(req.params.reportId);
  if (!report) throw new NotFoundError('Report not found');
  const factors = await getReportConfidenceRows(req.params.reportId);
  res.json({
    success: true,
    data: {
      reportId: report.id,
      confidenceScore: report.confidenceScore,
      factors,
    },
  });
};

export const getReportHistory = async (req: Request, res: Response) => {
  const report = await findReportById(req.params.reportId);
  if (!report) throw new NotFoundError('Report not found');
  const history = await getReportHistoryRows(req.params.reportId);
  res.json({ success: true, data: history });
};

export const updateReportStatus = async (req: Request, res: Response) => {
  const validated = updateReportStatusSchema.parse(req.body);
  const report = await updateReportStatusService(
    req.params.reportId,
    validated.status,
    validated.reason || '',
    validated.actorType,
    validated.actorName,
  );
  res.json({ success: true, data: mapReportToResponse(report) });
};

export const recalculateConfidence = async (req: Request, res: Response) => {
  const report = await recalculateReportConfidenceService(req.params.reportId);
  res.json({ success: true, data: mapReportToResponse(report) });
};

export const getReportsMap = async (req: Request, res: Response) => {
  const filters = reportQuerySchema.parse({ ...req.query, limit: 100 });
  const { reports } = await findAllReports(filters);
  res.json({
    success: true,
    data: reports.map((report) => ({
      id: report.id,
      latitude: report.latitude,
      longitude: report.longitude,
      hazardType: report.hazardType,
      severity: report.severity,
      status: report.status,
      observedAt: report.observedAt,
    })),
  });
};
