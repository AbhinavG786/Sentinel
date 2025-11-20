"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    await knex.raw(`
        CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    entity_type VARCHAR(100),
    entity_id UUID,
    action VARCHAR(100),
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
        `);
}
async function down(knex) {
    await knex.raw(`
        DROP TABLE IF EXISTS audit_logs CASCADE;
    `);
}
