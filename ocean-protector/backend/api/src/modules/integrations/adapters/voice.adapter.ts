import { env } from '../../../config/env';
import { AppError } from '../../../common/errors/AppError';

/**
 * Emergency voice reporting. The Twilio path uses Twilio's REST API directly
 * (no SDK required); VAPI is supported as a configured provider for richer
 * conversational flows. When no credentials are configured the adapter fails
 * closed with a clear 503 — the feature is never silently claimed to work.
 */
export interface VoiceProviderStatus {
  configured: boolean;
  requiredEnv: string[];
}

export const voiceProvidersStatus = (): { twilio: VoiceProviderStatus; vapi: VoiceProviderStatus } => ({
  twilio: {
    configured: Boolean(env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_FROM_NUMBER),
    requiredEnv: ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_FROM_NUMBER'],
  },
  vapi: {
    configured: Boolean(env.VAPI_API_KEY),
    requiredEnv: ['VAPI_API_KEY'],
  },
});

export const isVoiceConfigured = (): boolean =>
  Object.values(voiceProvidersStatus()).some((provider) => provider.configured);

/**
 * Places a voice report call via Twilio. Throws 503 when unconfigured.
 * `twimlMessage` is spoken to the answering emergency line.
 */
export const placeTwilioVoiceReportCall = async (to: string, twimlMessage: string) => {
  const status = voiceProvidersStatus().twilio;
  if (!status.configured) {
    throw new AppError(503, 'INTEGRATION_NOT_CONFIGURED', 'Twilio voice reporting is not configured.');
  }

  const accountSid = env.TWILIO_ACCOUNT_SID!;
  const authToken = env.TWILIO_AUTH_TOKEN!;
  const fromNumber = env.TWILIO_FROM_NUMBER!;

  const body = new URLSearchParams({
    To: to,
    From: fromNumber,
    Twiml: `<Response><Say language="en-IN">${twimlMessage}</Say></Response>`,
  });

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
      signal: AbortSignal.timeout(10000),
    },
  );

  if (!response.ok) {
    const detail = await response.text().catch(() => response.statusText);
    throw new AppError(502, 'VOICE_CALL_FAILED', `Twilio rejected the call: ${detail.slice(0, 200)}`);
  }

  return response.json();
};
