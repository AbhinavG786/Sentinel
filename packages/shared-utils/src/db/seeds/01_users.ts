import { Knex } from "knex";
import bcrypt from "bcrypt";

export async function seed(knex: Knex): Promise<void> {
  await knex("users").del();
  
  const adminHash = await bcrypt.hash("admin123", 10);
  const userHash = await bcrypt.hash("user123", 10);
  
  await knex("users").insert([
    { name: "Admin", email: "admin@example.com", role: "admin", password_hash: adminHash },
    { name: "John Doe", email: "john@example.com", role: "user", password_hash: userHash },
  ]);
}
