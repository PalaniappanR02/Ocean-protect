import z from 'zod';

export const createReportSchema = z.object({
  clientReportId: z.string().uuid(),
  hazardType: z.enum([
    'high_waves', 'tsunami', 'coastal_flooding', 'storm_surge', 'oil_spill',
    'abnormal_tide', 'marine_pollution', 'coastal_erosion', 'damaged_vessel',
    'strong_current', 'person_in_danger', 'other',
  ]),
  title: z.string().min(5).max(255),
  description: z.string().min(10).max(2000),
  languageCode: z.string().min(2).max(10).default('en'),
  reporterName: z.string().max(150).optional(),
  reporterPhone: z.string().max(20).optional(),
  isAnonymous: z.boolean().default(false),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  locationAccuracyMetres: z.number().positive().transform(Math.round).optional(),
  locationSource: z.enum(['device_gps', 'manual', 'map_pin']).default('device_gps'),
  observedAt: z.string().datetime(),
  severity: z.enum(['low', 'advisory', 'warning', 'critical']).default('advisory'),
  mediaUrls: z.array(
    z.union([
      z.string().url(),
      z.object({
        url: z.string().url(),
        latitude: z.number().min(-90).max(90).optional(),
        longitude: z.number().min(-180).max(180).optional(),
      }),
    ]),
  ).optional().default([]),
});

export const updateReportStatusSchema = z.object({
  status: z.enum([
    'submitted', 'screening', 'under_review', 'verified', 'rejected',
    'duplicate', 'merged_into_incident', 'action_initiated', 'resolved',
  ]),
  reason: z.string().max(500).optional(),
  actorType: z.string().max(50).default('analyst'),
  actorName: z.string().max(100).default('system'),
});

export const reportQuerySchema = z.object({
  state: z.string().optional(),
  district: z.string().optional(),
  hazardType: z.string().optional(),
  severity: z.string().optional(),
  status: z.string().optional(),
  freshnessBand: z.string().optional(),
  minConfidence: z.coerce.number().min(0).max(100).optional(),
  observedFrom: z.string().datetime().optional(),
  observedTo: z.string().datetime().optional(),
  hasMedia: z.enum(['true', 'false']).optional(),
  isPublic: z.enum(['true', 'false']).optional(),
  search: z.string().max(200).optional(),
  sortBy: z.enum(['receivedAt', 'observedAt', 'confidenceScore', 'severity', 'createdAt']).default('receivedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;
export type UpdateReportStatusInput = z.infer<typeof updateReportStatusSchema>;
export type ReportQuery = z.infer<typeof reportQuerySchema>;
