"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seed = seed;
async function seed(knex) {
    await knex("users").del();
    await knex("users").insert([
        { name: "Admin", email: "admin@example.com", role: "admin", password_hash: 'hashed_password1' },
        { name: "John Doe", email: "john@example.com", role: "user", password_hash: 'hashed_password2' },
    ]);
}
