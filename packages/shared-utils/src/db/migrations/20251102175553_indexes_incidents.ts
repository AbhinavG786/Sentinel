import { type Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
            CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
  CREATE INDEX IF NOT EXISTS idx_incidents_team_id ON incidents(team_id);
        `);
}

export async function down(knex: Knex): Promise<void> {
await knex.raw(`
     DROP INDEX IF EXISTS idx_incidents_status;
  DROP INDEX IF EXISTS idx_incidents_team_id;
    `);
}
