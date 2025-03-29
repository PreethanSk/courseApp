import express, {Router} from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { JWT_KEY } from "../utils/config";
import { adminMiddleware } from "../middleware/middleware";
import { courseCreateZod, updateCourseZod} from "../utils/zod";

const app = express();
const courseRoute = Router();
const client = new PrismaClient();
app.use(express.json())

courseRoute.post("/create", adminMiddleware, async(req, res) => {
    try{
        const{name, description, price , courseContent} = req.body;
        const zodParse = courseCreateZod.safeParse(req.body);
        if(!zodParse.success){
            res.status(403).json({message:"zod error"});
            return
        }
        //@ts-ignore
        const adminId = req.userId;
        const courseCreate = await client.course.create({
            data: {
                name, description, price, courseContent, adminId
            }
        })
        res.json({message: `course id: ${courseCreate.id}`})
    }
    catch(error){
        console.log(error);
        res.status(500).json({message:"Server crashed at course create endpoint"})
    }
})

courseRoute.put("/update", adminMiddleware, async(req, res) => {
    try{
        const {id ,name, description, price , courseContent } = req.body;
        const zodParse = updateCourseZod.safeParse(req.body);
        if(!zodParse.success){
            res.status(403).json({message:"zod error"});
            return
        }
        //@ts-ignore
        const adminId = req.userId;
        const adminCheck = await client.course.findFirst({
            where: {id: id, adminId: adminId}
        })
        if(!adminCheck){
            res.status(403).json({message:"you dont have access to this content"});
            return
        }
        await client.course.update({
            where: {id: id, adminId: adminId},
            data:{
                name, description, price, courseContent
            }
        })
        res.json({message:"course updated successfully"})
    }
    catch(error){
        console.log(error);
        res.status(500).json({message:"server crashed in course update endpoint"})
    }
})

courseRoute.delete("/delete/:id", adminMiddleware, async(req, res) => {
    try{
        const id = parseInt(req.params.id)
        //@ts-ignore
        const adminId = req.userId
        const adminCheck = await client.course.findFirst({
            where: {id: id, adminId: adminId}
        })
        if(!adminCheck){
            res.status(403).json({message: "you dont have access to this course"})
            return
        }
        await client.course.delete({
            where: {id: id}
        })
        res.json({messaeg:"this course has been deleted successfully"})
    }
    catch(error){
        console.log(error)
        res.status(500).json({message:"server crashed in delete course endpoint "})
    }
})

courseRoute.get("/viewAll", async(req, res) => {
    try{
        const courses = await client.course.findMany();
        if(!courses){
            res.status(403).json({message:"theres no courses yet"});
            return
        }
        res.json({courses: courses})
    }
    catch(error){
        console.log(error);
        res.status(500).json({message:"server crash in course viewAll"})
    }
})

courseRoute.get("/view/:admin", async(req, res) => {
    try{
        const admin = req.params.admin;
        const courses = await client.admin.findUnique({
            where: {username: admin},
            include: {course: true}
        })
        if(!courses){
            res.status(403).json({messagE:"this admin does not exist or this admin does not have any courses available yet"});
            true
        }
        res.json({courses: courses})
    }
    catch(error){
        console.log(error)
        res.status(500).json({message:"Server crash in view specific admin endpoint"})
    }
})

courseRoute.get("/view/:id",async(req, res) => {
    try{
        const id = parseInt(req.params.id);
        const content = await client.course.findFirst({
            where: {id: id}
        })
        if(!content){
            res.status(403).json({message:"thers no courses in this id"})
            return
        }
        res.json({content: content})
    }
    catch(error){
        console.log(error);
        res.status(500).json({message:"Server crash in course view by id endpoint"})
    }
})

export default courseRoute