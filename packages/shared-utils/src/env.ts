import * as dotenv from 'dotenv';
import * as path from "path";


// const rootPath = path.resolve(__dirname, "..", "..");  // moves from dist/env.js → packages/shared-utils
// const envPath = path.resolve(rootPath, "..", ".env"); 


dotenv.config({
  path: path.resolve(__dirname, "../../../.env"),
});

// dotenv.config({ path: envPath });

export const config={
    DATABASE_URL:process.env.DATABASE_URL!,
    NODE_ENV:process.env.NODE_ENV||'development',
    GATEWAY_PORT:process.env.GATEWAY_PORT?parseInt(process.env.GATEWAY_PORT):3000
}
