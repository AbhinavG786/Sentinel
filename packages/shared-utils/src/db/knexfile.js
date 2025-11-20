"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const knexFile_1 = require("../knexFile");
const env_1 = require("../env");
const path_1 = __importDefault(require("path"));
const ROOT_DIR = path_1.default.resolve(__dirname, "..", ".."); // points to packages/shared-utils
const MIGRATIONS_DIR = path_1.default.resolve(ROOT_DIR, "src", "db", "migrations");
const knexConfig = {
    development: {
        ...knexFile_1.baseKnexConfig,
        connection: env_1.config.DATABASE_URL,
        migrations: {
            ...knexFile_1.baseKnexConfig.migrations,
            directory: MIGRATIONS_DIR,
        },
    },
    production: {
        ...knexFile_1.baseKnexConfig,
        connection: env_1.config.DATABASE_URL + "?ssl=true",
        migrations: {
            ...knexFile_1.baseKnexConfig.migrations,
            extension: "js",
            directory: path_1.default.resolve(ROOT_DIR, "dist", "packages", "shared-utils", "src", "db", "migrations"),
        },
    },
};
exports.default = knexConfig;
