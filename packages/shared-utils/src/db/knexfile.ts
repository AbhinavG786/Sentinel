  import { Knex } from "knex";
import { baseKnexConfig } from "../knexFile";
import { config } from "../env";
import path from "path";

const ROOT_DIR = path.resolve(__dirname, "..", ".."); // points to packages/shared-utils
const MIGRATIONS_DIR = path.resolve(ROOT_DIR, "src", "db", "migrations");

const knexConfig: Record<string, Knex.Config> = {
  development: {
    ...baseKnexConfig,
    connection: config.DATABASE_URL, 
    migrations: {
      ...baseKnexConfig.migrations,
      directory: MIGRATIONS_DIR,
    },
  },
  production: {
    ...baseKnexConfig,
    connection: config.DATABASE_URL + "?ssl=true",
    migrations: {
      ...baseKnexConfig.migrations,
      extension: "js",
      directory:path.resolve(ROOT_DIR, "dist", "packages", "shared-utils", "src", "db", "migrations"),
    },
  },
};

export default knexConfig;
