import { PrismaClient } from "@prisma/client";
import express, {Router} from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { JWT_KEY } from "../utils/config";
import { zodSignup } from "../utils/zod";
import { adminMiddleware } from "../middleware/middleware";

const client = new PrismaClient();
const app = express();
const adminRouter = Router();
const JWT_SECRET = JWT_KEY || "default-key"
app.use(express.json());


adminRouter.post("/signup", async(req,res) => {
    try{
        const {username, password} = req.body;
        const zodParse = zodSignup.safeParse(req.body);
        if(!zodParse.success){
            res.status(403).json({message:"zod error "});
            return
        }
        const userCheck = await client.admin.findFirst({
            where: {username: username}
        })
        if(userCheck){
            res.status(403).json({message:"this user already exists"})
            return
        }
        const passwordHash = await bcrypt.hash(password, 5);
        await client.admin.create({
            data:{username, password: passwordHash}
        })
        res.json({message:"user created successfully"})

    }
    catch(error){
        console.log(error);
        res.status(500).json({message:"Server crashed in admin signup endpoint"})
    }
})

adminRouter.post("/signin",async(req,res) => {
    try{
        const {username, password} = req.body;
        const zodParse = zodSignup.safeParse(req.body);
        if(!zodParse.success){
            res.status(403).json({message:"zod error"});
            return
        }
        const userCheck = await client.admin.findFirst({
            where: {username: username}
        });
        if(!userCheck){
            res.status(403).json({message:"this user does not exist"});
            return
        }
        const passwordDecrypt = await bcrypt.compare(password, userCheck.password);
        if(!passwordDecrypt){
            res.status(403).json({message:"this password is incorrect"});
            return
        }
        const token = jwt.sign({userId: userCheck.id}, JWT_SECRET);
        res.json({token: token});
    }
    catch(error){
        console.log(error);
        res.status(500).json({message:"server crash in admin signin endpoint"})
    }
})

adminRouter.delete("/delete", adminMiddleware, async(req,res) => {
    try{
        //@ts-ignore
        const userId = req.userId;
        await client.admin.delete({
            where: {id: userId}
        })
        res.json({message:"admin deleted successfully"})
    }
    catch(error){
        console.log(error)
        res.status(500).json({message:"server crash in admin delete endpoint"})
    }
})

export default adminRouter