import { Request, Response } from 'express';
import { findAllSocialSignals, getSocialSummary } from './social.repository';

export const getSocialSignals = async (req: Request, res: Response) => {
  const hazardType = req.query.hazardType as string | undefined;
  const signals = await findAllSocialSignals(hazardType);
  res.json({ success: true, data: signals, meta: { isSynthetic: true, dataSource: 'sample_dataset' } });
};

export const getSocialSummaryEndpoint = async (req: Request, res: Response) => {
  const summary = await getSocialSummary();
  res.json({ success: true, data: summary });
};

export const getSocialTrends = async (req: Request, res: Response) => {
  // Mock trends based on the static sample data
  res.json({ 
    success: true, 
    data: {
      trends: [
        { hazardType: 'coastal_flooding', mentionCount: 45, trendDirection: 'up' },
        { hazardType: 'high_waves', mentionCount: 28, trendDirection: 'stable' },
      ],
      isSynthetic: true,
      dataSource: 'sample_dataset'
    } 
  });
};

export const getSocialMap = async (req: Request, res: Response) => {
  const signals = await findAllSocialSignals();
  const mapData = signals.map(s => ({
    id: s.id,
    latitude: s.latitude,
    longitude: s.longitude,
    hazardType: s.hazardType,
    platform: s.platform,
  }));
  res.json({ success: true, data: mapData, meta: { isSynthetic: true, dataSource: 'sample_dataset' } });
};