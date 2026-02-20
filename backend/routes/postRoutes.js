import express from "express"
import { toggleLikePost,getFeedPost,addPost } from "../controllers/postController.js"
import { protect } from "../middlewares/auth.js"
import { upload } from "../middlewares/multer.js"



const postRouter=express.Router()
postRouter.post("/addpost",upload.array("images",4),protect,addPost)
postRouter.patch("/toggleLike",protect,toggleLikePost)
postRouter.get("/feed",protect,getFeedPost)


export default postRouter

