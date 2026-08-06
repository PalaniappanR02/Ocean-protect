import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../../config/supabase';

export interface AuthedRequest extends Request {
  user?: { id: string; role: string };
}

export async function verifyToken(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Missing token' } });
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Invalid token' } });
  }

  const { data: roleRow } = await supabaseAdmin
    .from('user_roles')
    .select('role')
    .eq('user_id', data.user.id)
    .single();

  req.user = { id: data.user.id, role: roleRow?.role ?? 'citizen' };
  next();
}

const roleRank: Record<string, number> = {
  citizen: 0,
  analyst: 1,
  authority_operator: 2,
  authority_supervisor: 3,
};

export function requireRole(minRole: keyof typeof roleRank) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    const userRank = roleRank[req.user?.role ?? 'citizen'];
    if (userRank === undefined || userRank < roleRank[minRole]) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Insufficient role' } });
    }
    next();
  };
}