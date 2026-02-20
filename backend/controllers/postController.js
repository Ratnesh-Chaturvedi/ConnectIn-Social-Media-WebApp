import fs from "fs";
import imagekit from "../config/imageKit.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";

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

    return res.status(201).json({ data: post, message: "Post created" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// get post
const getFeedPost = async (req, res) => {
  try {
    const { userId } = req.auth();
    const user = await User.findById(userId);
    // user connection and following
    const userIds = [userId, ...user.connections, ...user.following];
    const posts = await Post.find({ user: { $in: userIds } })
      .populate("user")
      .sort({ createdAt: -1 });

    return res.status(200).json({ message: "Post fetched", data: posts });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
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
      return res.status(200).json({ message: "Post Unliked" });
    } else {
      post.likes_count.push(userId);
      await post.save();
      return res.status(200).json({ message: "Post liked" });
    }
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

export { addPost, getFeedPost, toggleLikePost };
