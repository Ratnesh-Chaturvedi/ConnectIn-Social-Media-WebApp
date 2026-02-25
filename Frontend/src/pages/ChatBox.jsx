import React, { useEffect, useRef, useState } from "react";
import { dummyMessagesData, dummyUserData } from "../assets/assets";
import { ImageIcon, SendHorizonal } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import {useAuth} from "@clerk/clerk-react"
import toast from "react-hot-toast";
import { addMessages, fetchMessages, resetMessages } from "../features/messages/messageSlice.js";
import api from "../api/axios.js"

const ChatBox = () => {
const  {messages}  = useSelector((state) => state.messages);
const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [user, setUser] = useState(null);
  const messageEndRef = useRef();

  const {userId}=useParams()
  const {getToken}=useAuth()
  const dispatch=useDispatch()

  const connections=useSelector((state)=>state.connections.connections)

const fetchUserMessages=async ()=>{
  try {
    const token=await getToken();
    dispatch(fetchMessages({token,userId}))
  } catch (error) {
    toast.error(error.message)
  }
}


  const sendMessages = async () => {
    try {
      if(!text && !image){
        toast.error("Add some message or image")
        return;
      }
      const token=await getToken();
      const formData=new FormData()
      formData.append("text",text)
      formData.append("to_user_id",userId)
      image && formData.append("media",image)
      const {data}=await api.post("/api/message/send",formData,{headers:{
        Authorization:`Bearer ${token}`
      }})
      if(data.success){
        // console.log(data.message)
        setImage(null)
        setText('')
        dispatch(addMessages(data.message))
      }else {
        throw new Error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
      console.log(error)
    }
  };

useEffect(()=>{
  fetchUserMessages()
  return ()=>{dispatch(resetMessages())}
},[userId])

useEffect(()=>{
  if(connections.length >0){
    const user=connections.find(connection=>connection._id===userId)
    setUser(user)
  }
},[connections,userId])


  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    user && (
      <div className="flex flex-col h-screen">
        <div className="flex items-center gap-2 p-2 md:px-10 xl:pl-42 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-300">
          <img
            src={user.profile_picture}
            alt=""
            className="size-8 rounded-full"
          />
          <div>
            <p className="font-medium">{user.full_name}</p>
            <p className="text-sm text-gray-500 -mt-1.5">@{user.username}</p>
          </div>
        </div>

        <div className="p-5 md:px-10 h-full overflow-y-scroll">
          <div className="space-y-4 mx-w-4xl mx-auto">
            {messages
              .toSorted((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
              .map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.to_user_id !== user._id ? "items-start" : "items-end"}`}
                >
                  <div
                    className={`p-2 text-sm max-w-sm bg-white text-slate-700  rounded-lg  shadow ${msg.to_user_id !== user._id ? "rounded-bl-none" : "rounded-br-none"}`}
                  >
                    {msg.message_type === "media" && (
                      <img
                        src={msg.media_url}
                        className="w-full max-w-sm rounded-lg mb-1"
                        alt=""
                      />
                    )}
                    <p>{msg.text}</p>
                  </div>
                </div>
              ))}

            <div ref={messageEndRef} />
          </div>
        </div>

        <div className="px-4">
          <div className="flex items-centergap-3 pl-5 p-1.5 bg-white w-full max-w-xl mx-auto border  border-gray-300 shadow rounded-full mb-5">
            <input
              type="text"
              className="flex-1  outline-none text-slate-700"
              placeholder="Type a message..."
              onKeyDown={(e) => e.key === "Enter" && sendMessages()}
              onChange={(e) => setText(e.target.value)}
              value={text}
            />
            <label htmlFor="images">
              {image ? (
                <img
                  src={URL.createObjectURL(image)}
                  className="h-8 rounded"
                  alt=""
                />
              ) : (
                <ImageIcon className="size-7 text-gray-400  cursor-pointer" />
              )}

              <input
                type="file"
                id="images"
                accept="images/*"
                hidden
                onChange={(e) => setImage(e.target.files[0])}
              />
            </label>
            <button 
            onClick={sendMessages}
            className="bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 cursor-pointer text-white p-2 rounded-full" >
              <SendHorizonal size={18}/>
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default ChatBox;
