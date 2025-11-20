"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    await knex.raw(`
        CREATE TABLE IF NOT EXISTS team_members(
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        role_in_team VARCHAR(50) DEFAULT 'member',
        joined_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(team_id,user_id)
        )
        `);
}
async function down(knex) {
    await knex.raw(`
        DROP TABLE IF EXISTS team_members CASCADE;
    `);
}
