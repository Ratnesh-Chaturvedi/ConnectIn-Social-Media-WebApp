import { err } from "inngest/types";
import {ApiError} from "../utils/apiError.js"

export const protect =async (req,res,next)=>{

    try {
        const {userId}=await req.auth()
        if(!userId){
            throw new ApiError(400,"Not authenticated")
        }
        next();
    } catch (error) {
        throw new ApiError(400,error.message)
    }
}