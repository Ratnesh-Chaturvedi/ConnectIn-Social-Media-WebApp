import imagekit from "../config/imageKit.js";
import { inngest } from "../inngest/index.js";
import Story from "../models/story.model.js";
import User from "../models/user.model.js";
import fs from "fs";

const addUserStory = async (req, res) => {
  try {
    const { userId } = req.auth();
  
    const { content, media_type, background_color } = req.body;
    let media = req.file;
    let media_url ='';
    if (media_type==="image" || media_type==="video") {
      
          const fileBuffer = fs.readFileSync(media.path);
          const response = await imagekit.files.upload({
            file: fileBuffer.toString("base64"),
            fileName: media.originalname,
            folder: `story`,
        })
        media_url=response.url
  
    }
    const story = await Story.create({
      user: userId,
      content,
      background_color,
      media_url,
      media_type,
    });



    //schedule the story deletion after 24 hours
    await inngest.send({
      name:"app/story.delete",
      data:{storyId:story._id}
    })



    return res.status(201).json({success:true,message:"Story Created",story})


  } catch (error) {
    console.log(error);
    res.status(400).json({success:false, message: error.message });
  }
};


const getStory =async (req,res)=>{
    try {
    const {userId}=req.auth()
    const user=await User.findById(userId)
    const userIds=[user._id,...user.connections,...user.following]
    const stories=await  Story.find({user:{$in:userIds}}).populate('user').sort({createdAt:-1})
   
return res.status(200).json({success:true,message:"Stories fetched",stories})
    } catch (error) {
         console.log(error);
    res.status(400).json({success:false, message: error.message });
    }
}



export {
    addUserStory,getStory
}