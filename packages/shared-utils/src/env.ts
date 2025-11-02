import dotenv from 'dotenv';
import path from "path";

dotenv.config({
  path: path.resolve(__dirname, "../../../.env"),
});


export const config={
    DATABASE_URL:process.env.DATABASE_URL!,
    NODE_ENV:process.env.NODE_ENV||'development',
    GATEWAY_PORT:process.env.GATEWAY_PORT?parseInt(process.env.GATEWAY_PORT):3000
}
