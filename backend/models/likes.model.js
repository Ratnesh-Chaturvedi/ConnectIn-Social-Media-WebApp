import mongoose, {Schema} from "mongoose";


const likesSchema=new Schema({

  user:{
    type:String,
    ref:"User",
    required:true,
  },
    post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required:true,
  },

},{timestamps:true})

export default Likes=mongoose.model("like",likesSchema)