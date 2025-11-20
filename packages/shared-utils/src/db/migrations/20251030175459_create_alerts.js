"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
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
        `);
}
async function down(knex) {
    await knex.raw(`
        DROP TABLE IF EXISTS alerts CASCADE;
    `);
}
