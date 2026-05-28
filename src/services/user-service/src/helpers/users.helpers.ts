import { db } from "@shared/utils";

export interface User {
  id?: string;
  name: string;
  email: string;
  role?: string;
  password_hash: string;
  created_at?: Date;
  updated_at?: Date;
}

class UserService {
  createUser = async (user: User) => {
    const [newUser] = await db("users")
      .insert(user)
      .returning(["id", "name", "email", "role", "created_at"]);
    return newUser;
  };

  fetchAllUsers = async () => {
    return await db("users").select(
      "id",
      "name",
      "email",
      "role",
      "created_at"
    );
  };

  getUserById = async (id: string) => {
    return await db("users")
      .select("id", "name", "email", "role", "created_at")
      .where({ id })
      .first();
  };

  updateUser = async (id: string, updates: Partial<User>) => {
    const [updatedUser] = await db("users")
      .where({ id })
      .update({ ...updates, updated_at: db.fn.now() })
      .returning(["id", "name", "email", "role", "created_at", "updated_at"]);
    return updatedUser;
  };

  deleteUser = async (id: string) => {
    return await db("users").where({ id }).del();
  };

  getUserByEmail = async (email: string) => {
    return await db("users")
      .select("id", "role", "password_hash")
      .where({ email })
      .first();
  };
}

export default new UserService();
