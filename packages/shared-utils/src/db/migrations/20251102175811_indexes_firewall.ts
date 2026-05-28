import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.raw(`
        CREATE INDEX IF NOT EXISTS idx_policy_logs_policy_id ON policy_logs(policy_id);
        `)

}


export async function down(knex: Knex): Promise<void> {
    await knex.raw(`
         DROP INDEX IF EXISTS idx_policy_logs_policy_id;
    `);
    
}

