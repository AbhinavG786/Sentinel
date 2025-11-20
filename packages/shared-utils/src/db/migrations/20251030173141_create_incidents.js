"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    await knex.raw(`
        CREATE TABLE IF NOT EXISTS incidents(
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        temp_id UUID UNIQUE NOT NULL,
        trace_id UUID NOT NULL,
        source VARCHAR(255) NOT NULL,
        sanitized_snippet JSONB NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        severity VARCHAR(20) CHECK (severity IN ('low','medium','high','critical')) DEFAULT 'low',
        status VARCHAR(255) CHECK (status IN ('open','in_progress','resolved','closed')) DEFAULT 'open',
        reported_by UUID REFERENCES users(id),
        assigned_to UUID REFERENCES users(id),
        team_id UUID REFERENCES teams(id),
        ai_summary JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
        )
        `);
}
async function down(knex) {
    await knex.raw(`
        DROP TABLE IF EXISTS incidents CASCADE;
    `);
}
