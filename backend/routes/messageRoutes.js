
import express from "express"
import { deleteMessage, getMessage, sendMessage, sseController } from "../controllers/messageController.js"
import { upload } from "../middlewares/multer.js"
import { protect } from "../middlewares/auth.js"


const messageRouter =express.Router()


messageRouter.get("/:userId",sseController)
messageRouter.post("/send",upload.single('media'),protect,sendMessage)
messageRouter.post("/get",protect,getMessage)
messageRouter.delete("/delete",protect,deleteMessage)


export default messageRouter