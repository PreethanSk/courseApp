import express, {Router} from "express";
import { PrismaClient } from "@prisma/client";
import { userMiddleware } from "../middleware/middleware";

const app = express();
const client = new PrismaClient();
const purchaseRoute = Router();
app.use(express.json());

purchaseRoute.post("/order/:courseId",userMiddleware,async(req, res) => {
    try{
        const courseId = parseInt(req.params.courseId);
        //@ts-ignore
        const userId = req.userId;
        await client.purchase.create({
            data:{
                courseId, userId
            }
        })
        res.json({messag:"purchase done"})

    }
    catch(error){
        console.log(error);
        res.status(500).json({message:"Server crash in new purchase endpoint"})
    }
})

purchaseRoute.get("/library",userMiddleware, async(req, res)=> {
    try{
        //@ts-ignore
        const userId = req.userId;
        const content =  await client.user.findUnique({
            where: {
                id: userId,
            },
            include: {
                purchases: {
                    include: {
                        course: true,
                    },
                },
            },
        });
        if(!content){
            res.status(403).json({message:"you have no purchases"})
            return
        }
        res.json({content: content})
    }
    catch(error){
        console.log(error);
        res.status(500).json({message:"server crashed in purchase library endpoint"})
    }
})


export default purchaseRoute