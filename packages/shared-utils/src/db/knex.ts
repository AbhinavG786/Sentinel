import knex, { Knex } from "knex";
import knexConfig from "./knexfile";
import { config } from "../env"

const environment = config.NODE_ENV;

export const db: Knex = knex(knexConfig[environment]);

db.raw("SELECT 1")
  .then(() => console.log(`Connected to DB in ${environment} mode`))
  .catch((err) => console.error("DB connection error:", err));

process.on("beforeExit", async () => {
  await db.destroy();
});
