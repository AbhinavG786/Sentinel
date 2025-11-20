"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    await knex.raw(`
        CREATE INDEX IF NOT EXISTS idx_policy_logs_policy_id ON policy_logs(policy_id);
        `);
}
async function down(knex) {
    await knex.raw(`
         DROP INDEX IF EXISTS idx_policy_logs_policy_id;
    `);
}
