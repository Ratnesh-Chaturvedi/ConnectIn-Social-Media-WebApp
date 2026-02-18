import express , {Router } from "express"
import {upload} from "../middlewares/multer.js"
import {getUserData, updateUserData,followUser,UnfollowUser,discoverUser,sendConnectionRequest,acceptConnectionRequest,getAllConnections } from "../controllers/userController.js"

import { protect } from "../middlewares/auth.js"



const userRouter =express.Router()


userRouter.get("/data",protect,getUserData)
userRouter.patch("/update",upload.fields([{name:"profile",maxCount:1},{name:"cover",maxCount:1}]),protect,updateUserData)



userRouter.post("/discover",protect,discoverUser)
userRouter.post("/follow",protect,followUser)
userRouter.post("/unfollow",protect,UnfollowUser)
userRouter.post("/connection",protect,sendConnectionRequest)
userRouter.patch("/accept",protect,acceptConnectionRequest)
userRouter.get("/connections",protect,getAllConnections)

export default userRouter