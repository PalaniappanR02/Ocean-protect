import z from 'zod';

export const createIncidentSchema = z.object({
  title: z.string().min(5).max(255),
  description: z.string().max(2000).optional(),
  hazardType: z.enum(['high_waves', 'tsunami', 'coastal_flooding', 'storm_surge', 'oil_spill', 'abnormal_tide', 'marine_pollution', 'coastal_erosion', 'damaged_vessel', 'strong_current', 'person_in_danger', 'other']),
  severity: z.enum(['low', 'advisory', 'warning', 'critical']),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  reportIds: z.array(z.string().uuid()).min(1, 'An incident must contain at least one report.'),
});

export const updateIncidentStatusSchema = z.object({
  status: z.enum(['candidate', 'under_review', 'verified', 'assigned', 'responding', 'monitoring', 'resolved', 'cancelled']),
  reason: z.string().max(500).optional(),
  actorType: z.string().default('authority'),
  actorName: z.string().default('system'),
});

export const attachReportSchema = z.object({
  reportId: z.string().uuid(),
});

export const assignTeamSchema = z.object({
  teamId: z.string().uuid(),
  actorName: z.string().default('authority'),
});