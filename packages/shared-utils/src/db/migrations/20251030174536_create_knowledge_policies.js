"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    await knex.raw(`
    CREATE TABLE IF NOT EXISTS knowledge_policies (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      description TEXT,
    blocked_keywords TEXT[],
    allowed_domains TEXT[],
      created_by UUID REFERENCES users(id),
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
}
async function down(knex) {
    await knex.raw(`
        DROP TABLE IF EXISTS knowledge_policies CASCADE;
    `);
}
