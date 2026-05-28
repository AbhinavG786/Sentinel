import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
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

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
        DROP TABLE IF EXISTS policy_logs CASCADE;
    `);
}
