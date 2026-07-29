import { pool } from '../../database/pool';

export const createAuditEvent = async (entityType: string, entityId: string, action: string, previousValue: any, newValue: any, reason: string, actorType: string, actorName: string, metadata: any = {}) => {
  await pool.query(`
    INSERT INTO audit_logs (entity_type, entity_id, action, previous_value, new_value, reason, actor_type, actor_name, metadata)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
  `, [entityType, entityId, action, previousValue, newValue, reason, actorType, actorName, metadata]);
};

export const getEntityAuditHistory = async (entityType: string, entityId: string) => {
  const result = await pool.query(`
    SELECT id, entity_type, entity_id, action, previous_value, new_value, reason, actor_type, actor_name, metadata, created_at
    FROM audit_logs 
    WHERE entity_type = $1 AND entity_id = $2
    ORDER BY created_at ASC
  `, [entityType, entityId]);
  return result.rows;
};