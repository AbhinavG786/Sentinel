import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
  CREATE INDEX IF NOT EXISTS idx_system_events_processed ON system_events(processed);
  
  CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
        `)
}

export async function down(knex: Knex): Promise<void> {
    await knex.raw(`
  DROP INDEX IF EXISTS idx_system_events_processed;
 
  DROP INDEX IF EXISTS idx_audit_logs_user_id;
    `);
}
