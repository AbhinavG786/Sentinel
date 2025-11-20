"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    await knex.raw(`
            CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
  CREATE INDEX IF NOT EXISTS idx_incidents_team_id ON incidents(team_id);
        `);
}
async function down(knex) {
    await knex.raw(`
     DROP INDEX IF EXISTS idx_incidents_status;
  DROP INDEX IF EXISTS idx_incidents_team_id;
    `);
}
