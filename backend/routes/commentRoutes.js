import express from 'express'
import { addComment,deleteComment, getComments } from "../controllers/commentController.js"
import { protect } from "../middlewares/auth.js"


const commentRouter=express.Router()

commentRouter.post('/add',protect,addComment)
commentRouter.delete('/delete',protect,deleteComment)
commentRouter.get("/get/:postId",protect,getComments)

export default commentRouter