import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
         CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID REFERENCES incidents(id),
    triggered_by UUID REFERENCES users(id),
    message TEXT,
    severity VARCHAR(20),
    acknowledged BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );
        `)
}


export async function down(knex: Knex): Promise<void> {
    await knex.raw(`
        DROP TABLE IF EXISTS alerts CASCADE;
    `);
}



