import fs from "fs";
import imagekit from "../config/imageKit.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Comment from "../models/comment.model.js";

// add a post

const addPost = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { content, post_type } = req.body;
    const images = req.files;
    let image_urls = [];

    if (images) {
      image_urls = await Promise.all(
        images.map(async (image) => {
          const fileBuffer = fs.readFileSync(image.path);
          const response = await imagekit.files.upload({
            file: fileBuffer.toString("base64"),
            fileName: image.originalname,
            folder: `posts`,
          });

          return response.url;
        }),
      );
    }
    const post = await Post.create({
      user: userId,
      content,
      image_urls,
      post_type,
    });

    return res.status(201).json({success:true, post, message: "Post created" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};


const getFeedPost = async (req, res) => {
  try {
    const { userId } = req.auth(); // Clerk user ID
    const { seenPosts = [] } = req.body;

    // Ensure seenPosts is always array of strings
    const seenPostsArr = Array.isArray(seenPosts)
      ? seenPosts.filter(id => typeof id === "string")
      : [];

    const LIMIT = 10;

    const user = await User.findById(userId);
    const priorityUsers = [userId, ...(user.connections || []), ...(user.following || [])];

    // ------------------- STEP 1: Priority posts -------------------
    let priorityPosts = await Post.find({
      user: { $in: priorityUsers },
      _id: { $nin: seenPostsArr }
    })
      .sort({ createdAt: -1 })
      .limit(Math.ceil(LIMIT / 2))
      .populate("user");

    priorityPosts = priorityPosts.filter(p => p.user);

    // ------------------- STEP 2: Random posts -------------------
    const remaining = LIMIT - priorityPosts.length;
    let randomPosts = [];

    if (remaining > 0) {
      const randomRaw = await Post.aggregate([
        { $match: { user: { $nin: priorityUsers }, _id: { $nin: seenPostsArr } } },
        { $sample: { size: remaining * 2 } } // fetch extra to avoid duplicates
      ]);

      const populated = await Post.populate(randomRaw, { path: "user" });
      randomPosts = populated.filter(p => p.user);
    }

    // ------------------- STEP 3: Fill remaining if needed -------------------
    let finalPosts = [...priorityPosts, ...randomPosts];
    if (finalPosts.length < LIMIT) {
      const extra = await Post.find({
        _id: { $nin: [...seenPostsArr, ...finalPosts.map(p => p._id)] }
      })
        .sort({ createdAt: -1 })
        .limit(LIMIT - finalPosts.length)
        .populate("user");

      finalPosts = [...finalPosts, ...extra.filter(p => p.user)];
    }

    // ------------------- STEP 4: Remove duplicates -------------------
    finalPosts = finalPosts.filter(
      (post, index, self) =>
        index === self.findIndex(p => p._id.toString() === post._id.toString())
    );

    // ------------------- STEP 5: Shuffle final feed -------------------
    finalPosts = finalPosts.sort(() => Math.random() - 0.5);

    return res.status(200).json({ success: true, posts: finalPosts });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

const toggleLikePost = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { postId } = req.body;

    const post = await Post.findById(postId);

    // check whether it is already liked or not by the user
    // if it is like make it unlike or like
    if (post.likes_count.includes(userId)) {
      post.likes_count = post.likes_count.filter((user) => user !== userId);
      await post.save();
      return res.status(200).json({success:true, message: "Post Unliked" });
    } else {
      post.likes_count.push(userId);
      await post.save();
      return res.status(200).json({success:true, message: "Post liked" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

// get the post for the comment page 
const singlePost=async (req,res)=>{
  try {
    const {userId}=req.auth()
    if(!userId){
 return res
        .status(401)
        .json({ success: false, message: "Not Authenticated" });
    }
    const {postId}=req.params
    if(!postId){
      return res.status(404).json({success:false,message:"Postid is mandatory"})
    }
    const post=await Post.findById(postId);
    if(!post){
     return  res.status(404).json({ success: false, message: "Post not found" });
    }

    return res.status(200).json({success:true,post,message:"Post fetched"})
  } catch (error) {
    console.log(error.message);
      res.status(400).json({ success: false, message: error.message });
  }
}


const deletePost=async (req,res)=>{
  try {
    const {userId}=req.auth()
    if(!userId){
 return res
        .status(401)
        .json({ success: false, message: "Not Authenticated" });
    }
    const {postId}=req.body;
    
    const delPost= await Post.findByIdAndDelete(postId);
    
    if(!delPost){
      return res.status(400).json({success:false,message:"Error in deleting "})
    }
    // delete all the comments of the post
    await Comment.deleteMany({post:postId});
    
    return res.status(200).json({success:true,message:"Post Deleted"})
  } catch (error) {
    console.log(error.message);
      res.status(400).json({ success: false, message: error.message });
  }
}




export { addPost, getFeedPost, toggleLikePost,singlePost,deletePost };
