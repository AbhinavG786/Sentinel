import type { Knex } from "knex";
import { config } from "./env";

const knexConfig:Knex.Config={
    client:"pg",
    migrations:{
        extension:"ts",
        directory:"../db/migrations"
    },
    seeds:{
        extension:"ts",
        directory:"../db/seeds"
    }
}


export default {
    development:{
        ...knexConfig,
        connection:config.DATABASE_URL
    },
    production:{
        ...knexConfig,
        connection:config.DATABASE_URL+ "?ssl=true"
    }
} as Record<string, Knex.Config>;