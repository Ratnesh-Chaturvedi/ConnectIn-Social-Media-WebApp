import express from "express"
import cors from "cors"
import 'dotenv/config'

import connectDB from "./config/mongdb.js";
// clerk 
import { clerkMiddleware } from '@clerk/express'
// setup the inngest 
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js"
import userRouter from "./routes/userRoutes.js";



const app=express();
app.use(express.json())
app.use(cors())
// clerk middleware
app.use(clerkMiddleware())

await connectDB();

app.get("/",(req,res)=>{
    res.send("server  hello bol rahah ")
    
})

// inngest route
app.use("/api/inngest", serve({ client: inngest, functions }));



//user routes

app.use("/api/user",userRouter);



const PORT=process.env.PORT || 3000;

app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`)
})