"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    await knex.raw(`
        CREATE TABLE IF NOT EXISTS policy_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    incident_id UUID REFERENCES incidents(id),
    policy_id UUID REFERENCES knowledge_policies(id),
    detected_violation TEXT,
    ai_response_snippet TEXT,
    action_taken VARCHAR(100) CHECK (action_taken IN ('blocked', 'redacted', 'warned')),
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
        `);
}
async function down(knex) {
    await knex.raw(`
        DROP TABLE IF EXISTS policy_logs CASCADE;
    `);
}
