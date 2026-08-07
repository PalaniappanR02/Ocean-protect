import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../../config/supabase';
import { pool } from '../../database/pool';

export interface AuthedUser {
  id: string;
  email: string | null;
  role: string;
  accountStatus: string;
  organisationName: string | null;
  jurisdictionStateCode: string | null;
}

export interface AuthedRequest extends Request {
  user?: AuthedUser;
}

const UPSERT_USER_SQL = `
  INSERT INTO users (id, email, role, account_status)
  VALUES ($1, $2, 'citizen', 'active')
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        updated_at = CURRENT_TIMESTAMP
  RETURNING
    id,
    email,
    role,
    account_status AS "accountStatus",
    organisation_name AS "organisationName",
    jurisdiction_state_code AS "jurisdictionStateCode"
`;

export async function verifyToken(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Missing token' } });
  }

  // Identity always comes from a valid Supabase JWT — clients can never mint
  // their own role. The role itself is read from the internal users table.
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) {
    return res.status(401).json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Invalid token' } });
  }

  try {
    const { rows } = await pool.query<{
      id: string;
      email: string | null;
      role: string;
      accountStatus: string;
      organisationName: string | null;
      jurisdictionStateCode: string | null;
    }>(UPSERT_USER_SQL, [data.user.id, data.user.email ?? '']);

    const row = rows[0];
    req.user = {
      id: row.id,
      email: row.email,
      role: row.role,
      accountStatus: row.accountStatus,
      organisationName: row.organisationName,
      jurisdictionStateCode: row.jurisdictionStateCode,
    };
    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'AUTH_INIT_ERROR', message: 'Unable to initialise user profile' },
    });
  }
}

/**
 * Optional auth: resolves and attaches the user when a valid Bearer token is
 * present, but lets the request through untouched for anonymous visitors.
 * Used by the citizen report POST so signed-in reporters have their reports
 * attributed ("My Reports") while anonymous reporting stays fully supported.
 */
export async function attachUserIfPresent(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    return next();
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) {
    // Stale or invalid token: treat as anonymous rather than rejecting the report.
    return next();
  }

  try {
    const { rows } = await pool.query<{
      id: string;
      email: string | null;
      role: string;
      accountStatus: string;
      organisationName: string | null;
      jurisdictionStateCode: string | null;
    }>(UPSERT_USER_SQL, [data.user.id, data.user.email ?? '']);

    const row = rows[0];
    req.user = {
      id: row.id,
      email: row.email,
      role: row.role,
      accountStatus: row.accountStatus,
      organisationName: row.organisationName,
      jurisdictionStateCode: row.jurisdictionStateCode,
    };
    next();
  } catch (err) {
    // User-profile init failure must not block a citizen's emergency report.
    next();
  }
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
