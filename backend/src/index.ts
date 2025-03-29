import express from "express";
import adminRouter from "./routes/admin.route";
import courseRouter from "./routes/course.route";
import userRouter from "./routes/user.route";

const app = express();
app.use(express.json());
app.use("/admin", adminRouter);
app.use("/course", courseRouter);
app.use("/user", userRouter);


app.listen(3000)