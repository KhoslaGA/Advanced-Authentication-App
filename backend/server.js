import express from "express";
import { connectDB } from "./db/connection.js";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

//*Middlewares
const app = express();
dotenv.config();
const _dirname = path.resolve();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use(express.json());
//*ALlows use to Parse Incoming Requests with Json :req.body

app.use(cookieParser());
// * allows us to parse incoming cookies

app.listen(3000, () => {
  connectDB();
  console.log("server is listening on 3000");
});

app.use("/api/auth", authRoutes);

if (process.env.Node_Env === "production") {
  app.use(express.static(path.join(_dirname, "frontend/dist")));
  app.get("*",(req,res)=>{
    res.sendFile(path.resolve(_dirname,"frontend","dist","index.html"))
  })
}
