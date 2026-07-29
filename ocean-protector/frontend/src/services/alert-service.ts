import type { PublicAlert } from '@/types';
import { mockAlerts } from '@/mock/alerts';
import { delay, generateAlertCode } from '@/lib/utils';

const alerts: PublicAlert[] = [...mockAlerts];

const mockAlertService = {
  async list(): Promise<PublicAlert[]> {
    await delay(200);
    return alerts.filter((a) => a.isActive).sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());
  },

  async getById(id: string): Promise<PublicAlert | null> {
    await delay(200);
    return alerts.find((a) => a.id === id) || null;
  },

  async create(input: {
    incidentId: string;
    incidentTitle: string;
    hazardType: PublicAlert['hazardType'];
    severity: PublicAlert['severity'];
    stateCode: string;
    districtName: string;
    messageTitle: string;
    messageBody: string;
    safetyInstructions: string[];
    affectedAreas: string[];
    channels: PublicAlert['channels'];
    estimatedReach: number;
    expiresAt?: string;
  }): Promise<PublicAlert> {
    await delay(400);
    const now = new Date().toISOString();
    const alert: PublicAlert = {
      id: `ALR-${Date.now()}`,
      alertCode: generateAlertCode(),
      incidentId: input.incidentId,
      incidentTitle: input.incidentTitle,
      hazardType: input.hazardType,
      severity: input.severity,
      stateCode: input.stateCode,
      districtName: input.districtName,
      messageTitle: input.messageTitle,
      messageBody: input.messageBody,
      safetyInstructions: input.safetyInstructions,
      affectedAreas: input.affectedAreas,
      channels: input.channels,
      estimatedReach: input.estimatedReach,
      issuedAt: now,
      expiresAt: input.expiresAt,
      acknowledgedCount: 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    alerts.unshift(alert);
    return alert;
  },

  async acknowledge(id: string): Promise<PublicAlert | null> {
    await delay(200);
    const alert = alerts.find((a) => a.id === id);
    if (!alert) return null;
    alert.acknowledgedCount++;
    alert.updatedAt = new Date().toISOString();
    return alert;
  },

  async deactivate(id: string): Promise<PublicAlert | null> {
    await delay(200);
    const alert = alerts.find((a) => a.id === id);
    if (!alert) return null;
    alert.isActive = false;
    alert.updatedAt = new Date().toISOString();
    return alert;
  },
};

export { mockAlertService };