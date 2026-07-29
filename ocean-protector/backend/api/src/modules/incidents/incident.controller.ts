import { Request, Response } from 'express';
import { createIncident, findIncidentById, findAllIncidents, updateIncidentStatus, attachReportToIncident, detachReportFromIncident, getIncidentReports, getAllResponseTeams, assignTeamToIncident } from './incident.repository';
import { mapIncidentToResponse, mapTeamToResponse } from './incident.mapper';
import { createIncidentSchema, updateIncidentStatusSchema, attachReportSchema, assignTeamSchema } from './incident.schema';
import { ConflictError, NotFoundError, ValidationError } from '../../common/errors/AppError';
import { io } from '../../realtime/socket';
import { findReportById } from '../reports/report.repository';

export const createIncidentEndpoint = async (req: Request, res: Response) => {
  const validated = createIncidentSchema.parse(req.body);
  
  // Verify reports exist
  for (const rid of validated.reportIds) {
    const r = await findReportById(rid);
    if (!r) throw new NotFoundError(`Report ${rid} not found`);
    if (r.status !== 'verified') throw new ValidationError('All reports in an incident must be verified.');
  }

  const incident = await createIncident(validated);
  
  if (io) io.emit('incident.created', { incidentId: incident.id, hazardType: incident.hazardType });
  
  res.status(201).json({ success: true, data: mapIncidentToResponse(incident) });
};

export const getIncidents = async (req: Request, res: Response) => {
  const filters = {
    status: req.query.status as string | undefined,
    stateCode: req.query.stateCode as string | undefined,
    isPublic: req.query.isPublic !== undefined ? req.query.isPublic === 'true' : undefined,
    page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
    limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
  };
  
  const { incidents, total } = await findAllIncidents(filters);
  res.json({
    success: true,
    data: incidents.map(i => mapIncidentToResponse(i)),
    meta: { page: filters.page, limit: filters.limit, total, totalPages: Math.ceil(total / filters.limit) },
  });
};

export const getIncident = async (req: Request, res: Response) => {
  const incident = await findIncidentById(req.params.incidentId);
  if (!incident) throw new NotFoundError('Incident not found');
  
  const reports = await getIncidentReports(incident.id);
  res.json({ success: true, data: { ...mapIncidentToResponse(incident), reports } });
};

export const patchIncidentStatus = async (req: Request, res: Response) => {
  const validated = updateIncidentStatusSchema.parse(req.body);
  
  try {
    const result = await updateIncidentStatus(req.params.incidentId, validated.status, validated.reason || '', validated.actorType, validated.actorName);
    if (io) io.emit('incident.statusChanged', { incidentId: req.params.incidentId, ...result });
    res.json({ success: true, data: result });
  } catch (err: any) {
    throw new ConflictError(err.message);
  }
};

export const attachReport = async (req: Request, res: Response) => {
  const validated = attachReportSchema.parse(req.body);
  const incident = await findIncidentById(req.params.incidentId);
  if (!incident) throw new NotFoundError('Incident not found');
  
  await attachReportToIncident(incident.id, validated.reportId);
  res.json({ success: true, data: { attached: true } });
};

export const detachReport = async (req: Request, res: Response) => {
  const validated = attachReportSchema.parse(req.body);
  await detachReportFromIncident(req.params.incidentId, validated.reportId);
  res.json({ success: true, data: { detached: true } });
};

export const verifyIncident = async (req: Request, res: Response) => {
  const validated = updateIncidentStatusSchema.parse({ status: 'verified', actorName: req.body.actorName || 'analyst' });
  try {
    const result = await updateIncidentStatus(req.params.incidentId, 'verified', 'Incident verified by analyst', 'analyst', validated.actorName);
    if (io) io.emit('incident.statusChanged', { incidentId: req.params.incidentId, ...result });
    res.json({ success: true, data: result });
  } catch (err: any) {
    throw new ConflictError(err.message);
  }
};

export const assignTeam = async (req: Request, res: Response) => {
  const validated = assignTeamSchema.parse(req.body);
  await assignTeamToIncident(req.params.incidentId, validated.teamId);
  if (io) io.emit('incident.teamAssigned', { incidentId: req.params.incidentId, teamId: validated.teamId });
  res.json({ success: true, data: { assigned: true } });
};

export const resolveIncident = async (req: Request, res: Response) => {
  const validated = updateIncidentStatusSchema.parse({ status: 'resolved', actorName: req.body.actorName || 'authority' });
  try {
    const result = await updateIncidentStatus(req.params.incidentId, 'resolved', 'Incident resolved', 'authority', validated.actorName);
    if (io) io.emit('incident.statusChanged', { incidentId: req.params.incidentId, ...result });
    res.json({ success: true, data: result });
  } catch (err: any) {
    throw new ConflictError(err.message);
  }
};

// Response Teams Controller
export const getResponseTeams = async (req: Request, res: Response) => {
  const teams = await getAllResponseTeams();
  res.json({ success: true, data: teams.map(mapTeamToResponse) });
};