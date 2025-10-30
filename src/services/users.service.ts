import { db } from "../db/knex";

class UserService {
    fetchAllUsers=async()=>{
        return await db("users").select("*");
    }


}

export default new UserService();