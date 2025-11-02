import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
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

    
export async function down(knex: Knex): Promise<void> {
    await knex.raw(`
        DROP TABLE IF EXISTS knowledge_policies CASCADE;
    `);
}

