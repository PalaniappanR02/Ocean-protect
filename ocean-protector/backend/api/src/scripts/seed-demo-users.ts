import { supabaseAdmin } from '../config/supabase';
import { pool } from '../database/pool';

/**
 * One-time local demo seed: creates confirmed Supabase Auth users for the
 * analyst and authority portals and grants them roles in the internal users
 * table. Citizen signups are NOT created here — citizens sign up themselves.
 *
 * Demo credentials (local development only):
 *   analyst@oceanguard.demo     / OceanGuard#Analyst
 *   authority@oceanguard.demo   / OceanGuard#Authority
 *   supervisor@oceanguard.demo  / OceanGuard#Supervisor
 *
 * Run: npm run seed:demo
 */

const DEMO_USERS: Array<{ email: string; password: string; role: string; displayName: string; organisationName?: string; jurisdictionStateCode?: string }> = [
  { email: 'analyst@oceanguard.demo', password: 'OceanGuard#Analyst', role: 'analyst', displayName: 'Demo Analyst', organisationName: 'Kadalkavach Analysis Unit' },
  { email: 'authority@oceanguard.demo', password: 'OceanGuard#Authority', role: 'authority_operator', displayName: 'Demo Authority Operator', organisationName: 'Tamil Nadu Disaster Management', jurisdictionStateCode: 'TN' },
  { email: 'supervisor@oceanguard.demo', password: 'OceanGuard#Supervisor', role: 'authority_supervisor', displayName: 'Demo Authority Supervisor', organisationName: 'Tamil Nadu Disaster Management', jurisdictionStateCode: 'TN' },
];

const upsertInternalUser = async (supabaseUserId: string, email: string, role: string, displayName: string, organisationName?: string, jurisdictionStateCode?: string) => {
  await pool.query(
    `INSERT INTO users (id, email, role, account_status, display_name, organisation_name, jurisdiction_state_code)
     VALUES ($1, $2, $3, 'active', $4, $5, $6)
     ON CONFLICT (id) DO UPDATE
       SET role = EXCLUDED.role,
           display_name = EXCLUDED.display_name,
           organisation_name = EXCLUDED.organisation_name,
           jurisdiction_state_code = EXCLUDED.jurisdiction_state_code,
           updated_at = CURRENT_TIMESTAMP`,
    [supabaseUserId, email, role, displayName, organisationName ?? null, jurisdictionStateCode ?? null],
  );
};

const run = async () => {
  try {
    console.log('[demo-seed] Starting demo user seeding (idempotent)...');
    for (const demo of DEMO_USERS) {
      // Reuse the existing auth user if the email is already registered.
      const { data: existing } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const found = existing?.users.find((u) => u.email?.toLowerCase() === demo.email.toLowerCase());

      let authUserId: string;
      if (found) {
        authUserId = found.id;
        console.log(`Auth user already exists: ${demo.email}`);
      } else {
        const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
          email: demo.email,
          password: demo.password,
          email_confirm: true,
          user_metadata: { display_name: demo.displayName, demo: true },
        });
        if (error) {
          console.error(`Failed to create auth user ${demo.email}:`, error.message);
          continue;
        }
        authUserId = created!.user.id;
        console.log(`Created auth user: ${demo.email}`);
      }

      await upsertInternalUser(authUserId, demo.email, demo.role, demo.displayName, demo.organisationName, demo.jurisdictionStateCode);
      console.log(`Role ${demo.role} granted to ${demo.email}`);
    }
    console.log('[demo-seed] Demo user seeding complete.');
  } catch (error) {
    console.error('[demo-seed] Failed:', error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

void run();
