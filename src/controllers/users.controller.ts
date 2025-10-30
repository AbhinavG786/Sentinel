import { Request,Response } from "express";
import UserService from "../services/users.service";

class UserController{

    getAllUsers=async(req:Request,res:Response)=>{
      try {
          const users=await UserService.fetchAllUsers();
          res.status(200).json(users);
      } catch (error) {
            console.error("Error fetching users:", error);
          res.status(500).json({ error: "Internal Server Error" });
      }

    }
}

export default new UserController();