import { Request, Response } from 'express';
import {
  findAllSocialSignals,
  findSocialHotspots,
  findSocialTrends,
  getSocialSummary,
  importSocialSignal,
  updateSocialReviewStatus,
} from './social.repository';
import { classifyText } from '../../services/classifier-client';
import { NotFoundError, ValidationError } from '../../common/errors/AppError';
import { io } from '../../realtime/socket';

const PLATFORMS = ['twitter', 'facebook', 'instagram', 'news', 'reddit', 'youtube'];

export const getSocialSignals = async (req: Request, res: Response) => {
  const hazardType = req.query.hazardType as string | undefined;
  const platform = req.query.platform as string | undefined;
  const minEngagement = req.query.minEngagement !== undefined ? Number(req.query.minEngagement) : undefined;
  const signals = await findAllSocialSignals({
    hazardType,
    platform: platform && PLATFORMS.includes(platform) ? platform : undefined,
    minEngagement: minEngagement !== undefined && Number.isFinite(minEngagement) ? minEngagement : undefined,
  });
  res.json({ success: true, data: signals });
};

export const getSocialMap = async (req: Request, res: Response) => {
  const signals = await findAllSocialSignals();
  const mapData = signals
    .filter((s) => s.latitude !== null && s.longitude !== null)
    .map((s) => ({
      id: s.id,
      platform: s.platform,
      latitude: s.latitude,
      longitude: s.longitude,
      severity: s.inferredSeverity,
      hazardType: s.hazardType,
      engagementScore: s.engagementScore,
    }));
  res.json({ success: true, data: mapData, meta: { isSynthetic: true, dataSource: 'sample_dataset' } });
};

export const importSocialSignalEndpoint = async (req: Request, res: Response) => {
  const body = req.body ?? {};
  if (!body.text || typeof body.text !== 'string' || body.text.trim().length < 5) {
    throw new ValidationError('Signal text is required (min 5 characters).');
  }

  const platform = typeof body.platform === 'string' && PLATFORMS.includes(body.platform) ? body.platform : 'twitter';

  // Run the multilingual NLP classifier for relevance, hazard type, urgency,
  // sentiment, engagement and misinformation indicators.
  const languageCode = typeof body.languageCode === 'string' ? body.languageCode.slice(0, 2) : 'en';
  const classification = await classifyText(body.text, languageCode);

  const severity = classification.urgencyScore >= 0.9 ? 'critical'
    : classification.urgencyScore >= 0.6 ? 'warning'
      : classification.urgencyScore >= 0.3 ? 'advisory' : 'low';

  // Simple credibility heuristic: relevant + supported language scores higher.
  const credibilityScore = Math.min(100, Math.round(
    (classification.isHazardRelevant ? 40 : 10) +
    (classification.supportedLanguage ? 25 : 5) +
    (platform === 'news' ? 20 : platform === 'twitter' ? 10 : 15) +
    (body.latitude !== undefined && body.longitude !== undefined ? 15 : 0),
  ));

  const signal = await importSocialSignal({
    platform,
    text: body.text.trim(),
    languageCode,
    locationName: body.locationName ?? null,
    latitude: body.latitude ?? null,
    longitude: body.longitude ?? null,
    hazardType: classification.isHazardRelevant ? classification.predictedHazardType : body.hazardType ?? null,
    inferredSeverity: severity,
    credibilityScore,
    sentimentScore: classification.sentimentScore ?? null,
    engagementScore: classification.engagementScore ?? null,
    misinfoScore: classification.misinfoScore ?? null,
    sourceUrl: body.sourceUrl ?? null,
    observedAt: body.observedAt ?? new Date().toISOString(),
    dataSource: 'manual',
  });

  io?.emit('signal.imported', { signalId: signal.id, hazardType: signal.hazardType, severity: signal.inferredSeverity });

  res.status(201).json({
    success: true,
    data: signal,
    meta: { classified: true, classifierVersion: classification.classifierVersion },
  });
};

export const getSocialTrends = async (req: Request, res: Response) => {
  const trends = await findSocialTrends();
  res.json({ success: true, data: trends });
};

export const getSocialHotspots = async (req: Request, res: Response) => {
  const epsKm = Number(req.query.epsKm) || 25;
  const minPoints = Number(req.query.minPoints) || 3;
  const hotspots = await findSocialHotspots(epsKm, minPoints);
  res.json({ success: true, data: hotspots });
};

export const reviewSocialSignal = async (req: Request, res: Response) => {
  const { reviewStatus, credibilityScore } = req.body ?? {};
  if (!['pending', 'confirmed', 'dismissed'].includes(reviewStatus)) {
    throw new ValidationError('reviewStatus must be pending, confirmed or dismissed.');
  }
  const signals = await findAllSocialSignals({ limit: 1000 });
  const existing = signals.find((s) => s.id === req.params.signalId);
  if (!existing) throw new NotFoundError('Social signal not found');

  await updateSocialReviewStatus(
    req.params.signalId,
    reviewStatus,
    credibilityScore === undefined ? undefined : Number(credibilityScore),
  );
  res.json({
    success: true,
    data: {
      id: req.params.signalId,
      reviewStatus,
      credibilityScore: credibilityScore === undefined ? existing.credibilityScore : Number(credibilityScore),
    },
  });
};

export { getSocialSummary };
