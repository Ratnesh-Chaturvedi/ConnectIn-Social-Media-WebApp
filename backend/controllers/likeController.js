import likesModel from "../models/likes.model.js";

const toggleLike = async (req, res) => {
  try {
    const { userId } = req.auth();
    const {commentId}=req.body
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Not Authenticated" });
    }

   



  } catch (error) {
    console.log(error);
    res.status(400).json({ success: false, message: error.message });
  }
};


export {
  toggleLike
}