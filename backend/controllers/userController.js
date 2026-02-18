import fs from "fs";
import User from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import imagekit from "../config/imageKit.js";
import Connection from "../models/connection.model.js";


// controller to get the userData using userID
const getUserData = async (req, res) => {
  try {
    const { userId } = req.auth();
    if (!userId) {
      throw new ApiError(400, "Error while fetching userId");
    }
    const userData = await User.findById(userId);
    if (!userData) {
      throw new ApiError(400, "Error User not found");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, userData, "User data fetched successfully"));
  } catch (error) {
    console.log(error);
    throw new ApiError(400, error.message);
  }
};

const updateUserData = async (req, res) => {
  try {
    const { userId } = req.auth();
    let { username, bio, full_name, location } = req.body;

    const tempUser = await User.findById(userId);
    if (!tempUser) {
      throw new ApiError(400, "user not found");
    }

    // Fix username fallback
    if (!username) {
      username = tempUser.username;
    }

    if (tempUser.username !== username) {
      const tempUser2 = await User.findOne({ username });
      if (tempUser2) {
        username = tempUser.username;
      }
    }

    const updatedData = {
      username,
      bio,
      location,
      full_name,
    };

    // Safe file access
    const profile = req.files?.profile?.[0];
    const cover = req.files?.cover?.[0];

    console.log("Profile:", profile, "Cover:", cover);

    if (profile) {
      const buffer = fs.readFileSync(profile.path);

      const response = await imagekit.files.upload({
        file: buffer.toString("base64"),
        fileName: profile.originalname,
        folder: `/users/${userId}/profile`,
      });

      console.log("profile response:", response);

      if (!response?.url) {
        throw new Error("Profile upload failed");
      }

      updatedData.profile_picture = response.url;
    }

    if (cover) {
      const buffer = fs.readFileSync(cover.path);

      const response = await imagekit.files.upload({
        file: buffer.toString("base64"),
        fileName: cover.originalname,
        folder: `/users/${userId}/cover`,
      });

      console.log("cover response:", response);

      if (!response?.url) {
        throw new Error("Cover upload failed");
      }

      // 🔥 FIX: Use response.url directly
      updatedData.cover_photo = response.url;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {
      new: true,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, updatedUser, "User updated successfully"));
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// find user using username ,email,location,name

const discoverUser = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { input } = req.body;

    const allUsers = await User.find({
      $or: [
        { username: new RegExp(input, "i") },
        { email: new RegExp(input, "i") },
        { location: new RegExp(input, "i") },
        { full_name: new RegExp(input, "i") },
      ],
    });

    // now we show all the user expect the loggedin user
    const filteredUsers = allUsers.filter((user) => user._id !== userId);

    return res
      .status(200)
      .json(new ApiResponse(200, filteredUsers, "Fetched all users"));
  } catch (error) {
    console.log(error);
    throw new ApiError(400, error.message);
  }
};

// follow user

const followUser = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.body(); // id of the user we want to follow
    // here we should add the user in following list  and in that user followers list

    const currentUser = await User.findById(userId);

    //check that the user already followed it or not
    if (currentUser.following.includes(id)) {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            currentUser,
            "You are already following this user ",
          ),
        );
    }

    currentUser.following.push(id);
    await currentUser.save();

    const followedUser = await User.findById(id);
    followedUser.followers.push(userId);
    await followedUser.save();

    return res
      .status(200)
      .json(
        new ApiResponse(200, currentUser, "Now you are Following the user"),
      );
  } catch (error) {
    console.log(error);
    throw new ApiError(400, error.message);
  }
};

// unfollow the user

const UnfollowUser = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.body(); // id of the user we want to unfollow
    // here we should add the user in following list  and in that user followers list

    const currentUser = await User.findById(userId);
    // remove the id of the followed used
    currentUser.following = currentUser.following.filter(uid !== id);
    await currentUser.save();

    //remove from the followers list of the followed user
    const followedUser = await User.findById(id);
    followedUser.followers = followedUser.followers.filter(uid !== userId);
    await followedUser.save();

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          currentUser,
          "You are no longer following this user",
        ),
      );
  } catch (error) {
    console.log(error);
    throw new ApiError(400, error.message);
  }
};


//send Connection request 
const sendConnectionRequest=async (req,res)=>{
  try {

    // we also send a email to the user that we send a connection request 
    
    const {userId}=req.auth()
    const {id}=req.body

    // check if the user send more than 20 connection request in the last 24 hour 
 const last24hour=new Date(Date.now()-24*60*60*1000);
 const cnnectionRequests=await Connection.find({from_user_id:userId,
  created_at:{$gt:last24hour}
 });
 if(cnnectionRequests.length>20){
    throw new ApiError(400,"You can not send more than 20 Connection request in 24 hours")
 }
 // check if user is already connected
 const isConnected=await Connection.findOne({$or:[
  {from_user_id:userId,to_user_id:id},
  {from_user_id:id,to_user_id:userId}
 ]})
 if(!isConnected){

  const connect=await Connection.create({
    from_user_id:userId,
    to_user_id:id
  })
  
  return res.status(200).json(new ApiResponse(200,connect,"Connection request send Successfully"))

 }
 else if(isConnected && isConnected.status==="accepted" ){
  throw new ApiError(400,"User is already  connected")
 }
 
 return res.json({status:false,message:"Connection request is pending"})

    
  } catch (error) {
    console.log(error);
    throw new ApiError(400, error.message);
  }
}

// get all the user connection 

const getAllConnections=async (req,res)=>{
  try {
    const {userId}=req.auth()
    const user=await User.findById(userId).populate('connections followers following')

    const connections =user.connections
    const followers =user.followers
    const following =user.following

    const pendingConnection = (await Connection.find({to_user_id:userId,status:"pending"}).populate("from_user_id")).map(connection=>connection.from_user_id)

    return res.json({status:false,connections,followers,following,pendingConnection})


  } catch (error) {
     console.log(error);
    throw new ApiError(400, error.message);
  }
}

//accept the connection request 
const acceptConnectionRequest=async (req,res)=>{
  try {
    const {userId}=req.auth()
    const {id}=req.body

    const connection=await Connection.findOne({from_user_id:id,to_user_id:userId});

    if(!connection){
      throw new ApiError(400,"No connection Found")
    }
    const user=await User.findById(userId)
    user.connections.push(id)
    await  user.save();
    const toUser=await User.findById(id)
    toUser.connections.push(userId)
    await  toUser.save();

    connection.status="accepted"
    await connection.save();


    return res.json({status:true,message:"Connection accepted successfully"})
  } catch (error) {
       console.log(error);
    throw new ApiError(400, error.message);
  }
}





export { getUserData, updateUserData, followUser, UnfollowUser, discoverUser ,sendConnectionRequest,acceptConnectionRequest,getAllConnections};
