import React, { useEffect, useRef, useState } from "react";
import { ImageIcon, SendHorizonal, Trash2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router";
import { useAuth, useUser } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import { 
  addMessages, 
  fetchMessages, 
  resetMessages, 
  removeMessage 
} from "../features/messages/messageSlice.js";
import api from "../api/axios.js";
import moment from "moment";

const ChatBox = () => {
  const { messages } = useSelector((state) => state.messages);
  const { user: currentUser } = useUser();
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [user, setUser] = useState(null); 
  const messageEndRef = useRef();

  const { userId } = useParams();
  const { getToken } = useAuth();
  const dispatch = useDispatch();
  const connections = useSelector((state) => state.connections.connections);

  /**
   * Helper: Group messages by date
   * This logic creates the date headers (Today, Yesterday, etc.)
   */
  const groupMessagesByDate = (msgs) => {
    const groups = {};
    // Use spread [...] to avoid mutating original state and for better browser support in deployment
    const sorted = [...msgs].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    
    sorted.forEach((msg) => {
      const date = moment(msg.createdAt).format("YYYY-MM-DD");
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    });
    return groups;
  };

  const fetchUserMessages = async () => {
    try {
      const token = await getToken();
      dispatch(fetchMessages({ token, userId }));
    } catch (error) {
      toast.error("Error loading chat history");
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm("Delete this message?")) return;

    try {
      const token = await getToken();
      const { data } = await api.delete("/api/message/delete", {
        headers: { Authorization: `Bearer ${token}` },
        data: { messageId }
      });

      if (data.success) {
        toast.success("Deleted");
        dispatch(removeMessage(messageId)); // Updates Redux state immediately
      }
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const sendMessages = async () => {
    if (!text && !image) return;
    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append("text", text);
      formData.append("to_user_id", userId);
      if (image) formData.append("media", image);
      
      const { data } = await api.post("/api/message/send", formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (data.success) {
        setImage(null);
        setText("");
        dispatch(addMessages(data.message));
      }
    } catch (error) {
      toast.error("Failed to send");
    }
  };

  useEffect(() => {
    fetchUserMessages();
    return () => { dispatch(resetMessages()); };
  }, [userId]);

  useEffect(() => {
    if (connections.length > 0) {
      setUser(connections.find(c => c._id === userId));
    }
  }, [connections, userId]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const groupedMessages = groupMessagesByDate(messages);

  return (
    user && (
      <div className="flex flex-col h-screen bg-white">
        {/* HEADER - Removed "Active Now" status */}
        <div className="flex items-center gap-3 p-3 md:px-10 bg-white border-b border-gray-200">
          <img src={user.profile_picture} alt="" className="size-10 rounded-full border border-gray-100" />
          <div className="flex flex-col">
            <p className="font-semibold text-slate-800 leading-tight">{user.full_name}</p>
            <p className="text-xs text-slate-400">@{user.username}</p>
          </div>
        </div>

        {/* MESSAGES LIST */}
        <div className="flex-1 overflow-y-scroll no-scrollbar bg-[#f8fafc] px-4 md:px-10 py-4">
          <div className="max-w-4xl mx-auto">
            {Object.keys(groupedMessages).map((date) => (
              <div key={date}>
                {/* Center Date Header */}
                <div className="flex justify-center my-8">
                  <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-widest shadow-sm">
                    {moment(date).calendar(null, {
                      lastDay: '[Yesterday]',
                      sameDay: '[Today]',
                      lastWeek: 'dddd',
                      sameElse: 'MMMM D, YYYY'
                    })}
                  </span>
                </div>

                <div className="space-y-4">
                  {groupedMessages[date].map((msg) => {
                    const isMine = msg.from_user_id === currentUser?.id || msg.from_user_id?._id === currentUser?.id;
                    return (
                      <div key={msg._id} className={`flex ${!isMine ? "justify-start" : "justify-end"} group relative`}>
                        <div className={`relative px-4 py-2.5 max-w-[85%] md:max-w-md shadow-sm transition-all ${
                          !isMine 
                            ? "bg-white text-slate-800 rounded-2xl rounded-tl-none border border-slate-100" 
                            : "bg-indigo-600 text-white rounded-2xl rounded-tr-none"
                        }`}>
                          {isMine && (
                            <button
                              onClick={() => handleDeleteMessage(msg._id)}
                              className="absolute -left-12 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all p-2 text-red-400 hover:text-red-600"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}

                          {msg.message_type === "media" && (
                            <img src={msg.media_url} className="w-full rounded-xl mb-2" alt="media" />
                          )}
                          
                          <p className="text-[14px] leading-relaxed break-words">{msg.text}</p>
                          
                          {/* Time inside the bubble */}
                          <div className={`text-[9px] flex justify-end mt-1.5 font-semibold opacity-70 ${isMine ? "text-indigo-100" : "text-slate-500"}`}>
                            {moment(msg.createdAt).format("h:mm A")}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            <div ref={messageEndRef} />
          </div>
        </div>

        {/* INPUT AREA */}
        <div className="p-4 bg-white border-t border-slate-100">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 w-full max-w-3xl mx-auto rounded-3xl border border-slate-200 focus-within:bg-white focus-within:border-indigo-300 transition-all">
            <input
              type="text"
              className="flex-1 bg-transparent outline-none text-slate-700 py-1 text-sm"
              placeholder="Type a message..."
              onKeyDown={(e) => e.key === "Enter" && sendMessages()}
              onChange={(e) => setText(e.target.value)}
              value={text}
            />
            <label htmlFor="images" className="cursor-pointer p-2 hover:bg-slate-200 rounded-full transition-colors relative">
              {image ? (
                <img src={URL.createObjectURL(image)} className="size-6 object-cover rounded-md" alt="" />
              ) : (
                <ImageIcon className="size-5 text-slate-500" />
              )}
              <input type="file" id="images" accept="image/*" hidden onChange={(e) => setImage(e.target.files[0])} />
            </label>
            <button
              onClick={sendMessages}
              className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-full shadow-lg transition-all active:scale-90"
            >
              <SendHorizonal size={18} />
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default ChatBox;