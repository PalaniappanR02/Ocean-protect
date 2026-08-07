import { Request, Response } from 'express';
import { voiceProvidersStatus, placeTwilioVoiceReportCall } from './adapters/voice.adapter';
import { incoisStatus, fetchLatestIncoisBulletin } from './adapters/incois.adapter';
import { ValidationError } from '../../common/errors/AppError';

export const getIntegrationStatus = async (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      voice: voiceProvidersStatus(),
      incois: incoisStatus(),
      earlyWarning: incoisStatus(),
    },
  });
};

export const placeVoiceReport = async (req: Request, res: Response) => {
  const { to, message } = req.body ?? {};
  if (!to || typeof to !== 'string' || !/^\+?[0-9]{7,15}$/.test(to)) {
    throw new ValidationError('A valid phone number is required (E.164 preferred).');
  }

  const spoken = typeof message === 'string' && message.trim().length >= 5
    ? message.trim().slice(0, 400)
    : 'Kadalkavach emergency report. A coastal hazard report has been filed and requires attention.';

  const call = (await placeTwilioVoiceReportCall(to, spoken)) as { sid?: string };
  res.status(202).json({ success: true, data: { status: 'placed', callSid: call.sid, to } });
};

export const getIncoisLatest = async (_req: Request, res: Response) => {
  const bulletin = await fetchLatestIncoisBulletin();
  res.json({ success: true, data: bulletin });
};
