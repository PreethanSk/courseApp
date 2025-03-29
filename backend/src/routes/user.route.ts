import express, {Router} from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { JWT_KEY } from "../utils/config";
import { zodSignup } from "../utils/zod";
import { userMiddleware } from "../middleware/middleware";

const app = express();
const userRouter = Router();
const client = new PrismaClient();
const JWT_SECRET = JWT_KEY || "default-key";
app.use(express.json());

userRouter.post("/signup", async(req,res) => {
    try{
        const {username, password} = req.body;
        const zodParse = zodSignup.safeParse(req.body);
        if(!zodParse.success){
            res.status(403).json({message:"zod error"});
            return
        }
        const userCheck = await client.user.findFirst({
            where: {username: username}
        });
        if(userCheck){
            res.status(403).json({message:"this user already exists"});
            return
        }
        const passwordHash = await bcrypt.hash(password, 5);
        await client.user.create({
            data:{
                username: username,
                password: password
            }
        })
        res.json({message:"user created successfully"})
    }
    catch(error){
        console.log(error);
        res.status(500).json({message:"Server crashed in user signup endpoint"})
    }
})

userRouter.post("/signin", async(req,res) => {
    try{
        const {username, password} = req.body;
        const zodParse = zodSignup.safeParse(req.body);
        if(!zodParse.success){
            res.status(403).json({message:"zod error"});
            return
        }
        const userCheck = await client.user.findFirst({
            where: {username: username}
        })
        if(!userCheck){
            res.status(403).json({message:"this user does not exist"});
            return
        }
        const passwordDecrypt = await bcrypt.compare(password, userCheck.password);
        if(!passwordDecrypt){
            res.status(403).json({message:"your password is incorrect"})
            return
        }
        const token = jwt.sign({userId: userCheck.id}, JWT_SECRET);
        res.json(token);
    }
    catch(error){
        console.log(error);
        res.status(500).json({message:"server crashed in user signin endpoint"})
    }
})

userRouter.delete("/delete",userMiddleware,async(req,res) => {
    try{
        //@ts-ignore
        const userId = req.userId;
        await client.user.delete({
            where: {id: userId}
        })
        res.json({message:"user deleted successfully"})
    }
    catch(error){
        console.log(error);
        res.status(500).json({message:"server crashed"})
    }
})

export default userRouter