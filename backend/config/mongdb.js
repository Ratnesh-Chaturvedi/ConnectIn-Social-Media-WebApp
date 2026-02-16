import mongoose from "mongoose";
import dotenv, { configDotenv } from "dotenv"
 dotenv.config()

const DB_NAME="ConnectIn"

const connectDB =async ()=>{

    try {
        
         const connectionInstance=await mongoose.connect(`${process.env.MONGODB_URL}`)
        console.log("host name:",connectionInstance.connection.host)

        console.log("DB Connected")
    } catch (error) {
        console.log("Error while connecting to the DB:",error.message)
    }
}

export default connectDB;