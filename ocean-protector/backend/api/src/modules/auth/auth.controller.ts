import { Response } from 'express';
import { AuthedRequest } from '../../common/middleware/auth';

export const getMe = async (req: AuthedRequest, res: Response) => {
  res.json({
    success: true,
    data: {
      id: req.user!.id,
      email: req.user!.email,
      role: req.user!.role,
      accountStatus: req.user!.accountStatus,
      organisationName: req.user!.organisationName,
      jurisdictionStateCode: req.user!.jurisdictionStateCode,
    },
  });
};
