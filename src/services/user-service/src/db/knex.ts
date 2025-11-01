import knex, { Knex } from "knex";
import knexFile from "shared-utils/src/knexFile";
import { config } from "shared-utils/src/env";

const environment = config.NODE_ENV;

export const db: Knex = knex(knexFile[environment]);

process.on("beforeExit", async () => {
  await db.destroy();
});
