import express from "express"
import { toggleLikePost,getFeedPost,addPost, singlePost, deletePost } from "../controllers/postController.js"
import { protect } from "../middlewares/auth.js"
import { upload } from "../middlewares/multer.js"



const postRouter=express.Router()
postRouter.post("/addpost",upload.array("images",4),protect,addPost)
postRouter.patch("/togglelike",protect,toggleLikePost)
postRouter.post("/feed",protect,getFeedPost)
postRouter.delete("/delete",protect,deletePost)
postRouter.get("/single/:postId",protect,singlePost)


export default postRouter

