import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
    CREATE TABLE IF NOT EXISTS teams (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) UNIQUE NOT NULL,
      description TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
}


export async function down(knex: Knex): Promise<void> {
    await knex.raw(`
        DROP TABLE IF EXISTS teams CASCADE;
    `);
}

