import fs from "fs";
import imagekit from "../config/imageKit.js";
import Message from "../models/message.model.js";

// we r doing this to send and receive messages instantly

// create an object to store the serverside event connection
const connections = {};

//create a controller function for server side event endpoint

const sseController = async (req, res) => {
  const { userId } = req.params;
  console.log("New client Connected", userId);

  //set sse header
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

   res.flushHeaders(); 
  //add the client's response object to the connection object
  connections[userId] = res;
  //send and initial event to the client
  res.write("log:connected to SSE stream\n\n");
  //handle client disconnection
  req.on("close", () => {
    //remove the client's response object from the connections array
    delete connections[userId];
    console.log("Client Disconnected");
  });
};

const sendMessage = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { to_user_id ,text } = req.body;
    const media = req.file;
    let media_url = "";

    if (!text && !media) {
   return res.status(400).json({success:false, message:"Message required"});
}

    const message_type = media ? "media" : "text";
    if (message_type === "media") {
      const fileBuffer = fs.readFileSync(media.path);
      const response = await imagekit.files.upload({
        file: fileBuffer.toString("base64"),
        fileName: media.originalname,
        folder: `messagemedia`,
      });
      media_url = response.url;
    }

    const message = await Message.create({
      from_user_id: userId,
      to_user_id,
      text,
      message_type,
      media_url,
    });

    res.status(200).json({ success:true, message });

    //send this message to to_user_id using SSE

    const messageWithUserData = await Message.findById(message._id).populate(
      "from_user_id",
    );

    if (connections[to_user_id]) {
      connections[to_user_id].write(
        `data:${JSON.stringify(messageWithUserData)}\n\n`,
      );
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ success:false,message: error.message });
  }
};

// Delete message 


const deleteMessage =async (req,res)=>{
try {
    const { messageId } = req.body;
    const { userId } = req.auth(); // Current user ID

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    // Only the sender can delete their message
    if (message.from_user_id !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized to delete this message" });
    }

    const to_user_id = message.to_user_id;
    await Message.findByIdAndDelete(messageId);

    // Notify the recipient via SSE that a message was deleted
    if (connections[to_user_id]) {
      connections[to_user_id].write(
        `data: ${JSON.stringify({ action: "delete", messageId })}\n\n`
      );
    }

    res.status(200).json({ success: true, message: "Message deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ success: false, message: error.message });
  }
}




//get chat messages

const getMessage = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { to_user_id } = req.body;

    const messages = await Message.find({
      $or: [
        { from_user_id: userId, to_user_id },
        { from_user_id: to_user_id, to_user_id: userId },
      ],
    }).sort({ createdAt: -1 });

    //mark the messages as seen
    await Message.updateMany(
      { from_user_id: to_user_id, to_user_id: userId },
      { seen: true },
    );

    res.status(200).json({success:true, messages });
  } catch (error) {
    console.log(error);
    res.status(400).json({success:false, message: error.message });
  }
};

const getUserRecentMessages = async (req, res) => {
  try {
    const {userId}=req.auth()
    const messages=await Message.find({to_user_id:userId}).populate('from_user_id to_user_id').sort({createdAt:-1}) 
        res.status(200).json({success:true, messages });

  } catch (error) {
    console.log(error);
    res.status(400).json({success:false, message: error.message });
  }
};




export {
    getUserRecentMessages,
    getMessage,
    sendMessage,sseController,
    deleteMessage
}