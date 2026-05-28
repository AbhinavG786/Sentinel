import type { Knex } from "knex";

export const baseKnexConfig: Knex.Config = {
  client: "pg",
  migrations: {
    extension: "ts",
    directory: "src/db/migrations",
  },
  seeds: {
    extension: "ts",
    directory: "src/db/seeds",
  },
};
