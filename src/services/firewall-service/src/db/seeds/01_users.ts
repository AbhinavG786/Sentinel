import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  await knex("users").del();
  await knex("users").insert([
    { name: "Admin", email: "admin@example.com", role: "admin" ,password_hash: 'hashed_password1'},
    { name: "John Doe", email: "john@example.com", role: "user" ,password_hash: 'hashed_password2'},
  ]);
}
