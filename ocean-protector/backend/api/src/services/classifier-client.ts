import { env } from '../config/env';
import { normaliseServiceUrl } from '../config/urls';

export interface ClassificationResult {
  isHazardRelevant: boolean;
  predictedHazardType: string;
  relevanceScore: number;
  urgencyScore: number;
  sentimentScore?: number;
  engagementScore?: number;
  misinfoScore?: number;
  topKeywords?: string[];
  matchedKeywords: string[];
  supportedLanguage: boolean;
  analysisMode: string;
  classifierVersion: string;
}

const classifierBaseUrl = normaliseServiceUrl(env.CLASSIFIER_SERVICE_URL);

export const classifyText = async (
  text: string,
  languageCode: string,
): Promise<ClassificationResult> => {
  try {
    const response = await fetch(`${classifierBaseUrl}/classify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, languageCode }),
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error(`Classifier service responded with status: ${response.status}`);
    }

    return await response.json() as ClassificationResult;
  } catch {
    return {
      isHazardRelevant: false,
      predictedHazardType: 'other',
      relevanceScore: 0,
      urgencyScore: 0,
      matchedKeywords: [],
      supportedLanguage: false,
      analysisMode: 'not_analysed',
      classifierVersion: 'fallback-v0',
    };
  }
};
