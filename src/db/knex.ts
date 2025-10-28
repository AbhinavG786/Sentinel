import knex,{Knex} from "knex";
import knexFile from "../config/knexFile";
import {config} from "../config/env";

const environment=config.NODE_ENV;

export const db:Knex=knex(knexFile[environment]);

process.on('beforeExit',async()=>{
    await db.destroy();
})