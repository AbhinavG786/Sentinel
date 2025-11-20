"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const knex_1 = __importDefault(require("knex"));
const knexfile_1 = __importDefault(require("./knexfile"));
const env_1 = require("../env");
const environment = env_1.config.NODE_ENV;
exports.db = (0, knex_1.default)(knexfile_1.default[environment]);
exports.db.raw("SELECT 1")
    .then(() => console.log(`Connected to DB in ${environment} mode`))
    .catch((err) => console.error("DB connection error:", err));
process.on("beforeExit", async () => {
    await exports.db.destroy();
});
