import { Request, Response } from "express";
import UserService from "../services/users.service";
import bcrypt from "bcrypt";
import { User } from "../services/users.service";

class UserController {
  createUser = async (req: Request, res: Response) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email and password are required" });
    }
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await UserService.createUser({
        name,
        email,
        password_hash: hashedPassword,
        role,
      });
      res.status(201).json({ message: "User created successfully", user });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  getAllUsers = async (req: Request, res: Response) => {
    try {
      const users: User[] = await UserService.fetchAllUsers();
      res.status(200).json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  getUserById = async (req: Request, res: Response) => {
    const { id } = req.params;
    if(!id){
      return res.status(400).json({ error: "User ID is required" });
    }
    try {
      const user: User | undefined = await UserService.getUserById(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.status(200).json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };

  updateUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    const updates: Partial<User> = req.body;
    if (!id) {
      return res.status(400).json({ error: "User ID is required" });
    }
    try {
      const updatedUser: User | undefined = await UserService.updateUser(id, updates);
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      res.status(200).json({ message: "User updated successfully", updatedUser });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "User ID is required" });
    }
    try {
      const deletedCount = await UserService.deleteUser(id);
      if (deletedCount === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
}

export default new UserController();
