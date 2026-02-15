import express from "express"
import cors from "cors"
import 'dotenv/config'

import connectDB from "./config/mongdb.js";

// setup the inngest 
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js"


const app=express();
app.use(express.json())
app.use(cors())

await connectDB();

app.get("/",(req,res)=>{
    res.send("server  hello bol rahah ")
    
})
 

// inngest route
app.use("/api/inngest", serve({ client: inngest, functions }));

const PORT=process.env.PORT || 3000;

app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`)
})