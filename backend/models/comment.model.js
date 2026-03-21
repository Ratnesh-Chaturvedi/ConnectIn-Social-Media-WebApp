import mongoose, { Schema} from "mongoose";


const commentSchema=new Schema({

  user:{
    type:String,
    ref:"User",
    required:true,
  },
  content:{
    type:String,
    required:true
  },
    post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post"
  },
  likes_count:[
    {type:Schema.Types.ObjectId,
      ref:"Likes"
    }
  ]
  

},{timestamps:true})


const  Comment=mongoose.model("Comment",commentSchema)
export default Comment