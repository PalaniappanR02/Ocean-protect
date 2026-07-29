import { ConfidenceFactor, NearbyReportMatch } from '../reports/report.types';
import { classifyText } from '../../services/classifier-client';
import { FRESHNESS_BANDS } from '../../config/constants';

export const calculateFreshnessBand = (delayMinutes: number): string => {
  if (delayMinutes <= FRESHNESS_BANDS.FRESH) return 'fresh';
  if (delayMinutes <= FRESHNESS_BANDS.RECENT) return 'recent';
  if (delayMinutes <= FRESHNESS_BANDS.DELAYED) return 'delayed';
  return 'stale';
};

export const calculateConfidence = async (
  reportData: any,
  nearbyMatch: NearbyReportMatch
): Promise<{ score: number, factors: ConfidenceFactor[], analysisMode: string }> => {
  const factors: ConfidenceFactor[] = [];
  const now = new Date().toISOString();

  // 1. Submission base (max 15)
  factors.push({
    code: 'submission_base',
    label: 'Submission Base',
    rawValue: 'valid_submission',
    pointsAwarded: 15,
    maximumPoints: 15,
    explanation: 'Base points awarded for a valid, structured report submission.',
    source: 'system',
    calculatedAt: now,
  });

  // 2. Hazard keyword relevance (max 20)
  let classification = null;
  try {
    classification = await classifyText(`${reportData.title} ${reportData.description}`, reportData.languageCode);
  } catch (e) {
    // Fallback handled in client, but just in case
    classification = null;
  }

  const keywordScore = classification && classification.isHazardRelevant 
    ? Math.round(classification.relevanceScore * 20) 
    : 0;
  
  factors.push({
    code: 'hazard_keyword_relevance',
    label: 'Hazard Keyword Relevance',
    rawValue: classification ? classification.predictedHazardType : 'none',
    pointsAwarded: keywordScore,
    maximumPoints: 20,
    explanation: classification && classification.isHazardRelevant
      ? `Matched keywords: ${classification.matchedKeywords.join(', ')}.`
      : 'No relevant hazard keywords identified.',
    source: 'classifier_microservice',
    calculatedAt: now,
  });

  // 3. Media evidence (max 10)
  const mediaCount = reportData.mediaUrls?.length || 0;
  const mediaPoints = Math.min(10, mediaCount * 5);
  factors.push({
    code: 'media_evidence',
    label: 'Media Evidence',
    rawValue: `${mediaCount} files`,
    pointsAwarded: mediaPoints,
    maximumPoints: 10,
    explanation: mediaCount > 0 ? `${mediaCount} media file(s) attached.` : 'No media attached.',
    source: 'system',
    calculatedAt: now,
  });

  // 4. Nearby-report corroboration (max 25)
  const corroborationPoints = Math.min(25, nearbyMatch.count * 8);
  factors.push({
    code: 'nearby_corroboration',
    label: 'Nearby Report Corroboration',
    rawValue: `${nearbyMatch.count} matches`,
    pointsAwarded: corroborationPoints,
    maximumPoints: 25,
    explanation: nearbyMatch.count > 0
      ? `${nearbyMatch.count} similar report(s) found within 20km and 3 hours. Nearest is ${nearbyMatch.nearestDistanceKm.toFixed(2)} km away.`
      : 'No nearby corroborating reports found.',
    source: 'postgis_query',
    calculatedAt: now,
  });

  // 5. Temporal freshness (max 15)
  const syncDelay = reportData.syncDelayMinutes;
  const freshnessPoints = syncDelay <= 30 ? 15 : syncDelay <= 120 ? 10 : syncDelay <= 360 ? 5 : 0;
  factors.push({
    code: 'temporal_freshness',
    label: 'Temporal Freshness',
    rawValue: `${syncDelay} min delay`,
    pointsAwarded: freshnessPoints,
    maximumPoints: 15,
    explanation: `Report observed ${syncDelay} minutes before synchronization.`,
    source: 'system',
    calculatedAt: now,
  });

  // 6. Coastal-region proximity (max 10)
  const coastalPoints = reportData.coastalRegionId ? 10 : 0;
  factors.push({
    code: 'coastal_proximity',
    label: 'Coastal Region Proximity',
    rawValue: reportData.coastalRegionId ? 'matched' : 'unmatched',
    pointsAwarded: coastalPoints,
    maximumPoints: 10,
    explanation: coastalPoints > 0 ? 'Report location matched an active coastal reference region.' : 'Report location is outside defined coastal reference zones.',
    source: 'postgis_query',
    calculatedAt: now,
  });

  // 7. Source diversity (max 5) - Mock for single citizen submission
  factors.push({
    code: 'source_diversity',
    label: 'Source Diversity',
    rawValue: 'single_source',
    pointsAwarded: 0,
    maximumPoints: 5,
    explanation: 'Single citizen report source.',
    source: 'system',
    calculatedAt: now,
  });

  // 8. Delayed-sync penalty (min -20)
  const delayPenalty = syncDelay > 360 ? -20 : syncDelay > 120 ? -10 : 0;
  if (delayPenalty < 0) {
    factors.push({
      code: 'delayed_sync_penalty',
      label: 'Delayed Sync Penalty',
      rawValue: `${syncDelay} min delay`,
      pointsAwarded: delayPenalty,
      maximumPoints: 0,
      explanation: `Penalty applied for severe reporting delay (> ${syncDelay > 360 ? '6' : '2'} hours).`,
      source: 'system',
      calculatedAt: now,
    });
  }

  // 9. Conflict penalty (min -15) - Mock rule for checkpoint
  const conflictPenalty = 0; // Assume no conflict initially
  if (conflictPenalty < 0) {
    factors.push({
      code: 'conflict_penalty',
      label: 'Conflict Penalty',
      rawValue: 'none',
      pointsAwarded: conflictPenalty,
      maximumPoints: 0,
      explanation: 'No conflicting reports identified.',
      source: 'system',
      calculatedAt: now,
    });
  }

  const rawScore = factors.reduce((sum, f) => sum + f.pointsAwarded, 0);
  const finalScore = Math.max(0, Math.min(100, rawScore));

  return {
    score: finalScore,
    factors,
    analysisMode: classification && classification.supportedLanguage ? 'rule_based' : 'not_analysed',
  };
};