"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    await knex.raw(`
  CREATE INDEX IF NOT EXISTS idx_system_events_processed ON system_events(processed);
  
  CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
        `);
}
async function down(knex) {
    await knex.raw(`
  DROP INDEX IF EXISTS idx_system_events_processed;
 
  DROP INDEX IF EXISTS idx_audit_logs_user_id;
    `);
}
