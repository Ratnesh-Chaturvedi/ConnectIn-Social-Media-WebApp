import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import { useAuth, useUser } from "@clerk/clerk-react";
import api from "../api/axios.js";
import toast from "react-hot-toast";

const RecentMessages = () => {
  const [messages, setMessages] = useState([]);
  const { getToken } = useAuth();
  const { user } = useUser();

  const fetchMessages = async () => {
    try {
      const token = await getToken();
      const { data } = await api.get("/api/user/recent-messages", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        // Group by the "Other Person" (so you don't group by yourself)
        const groupedMessages = data.messages.reduce((acc, message) => {
          // Determine who the "other" person in the chat is
          const otherUser = 
            message.from_user_id._id === user.id 
              ? message.to_user_id 
              : message.from_user_id;

          // If there's no other user (data mismatch), skip
          if (!otherUser) return acc;

          const conversationId = otherUser._id;

          // Only keep the latest message for this specific conversation
          if (
            !acc[conversationId] ||
            new Date(message.createdAt) > new Date(acc[conversationId].createdAt)
          ) {
            acc[conversationId] = {
              ...message,
              displayUser: otherUser, // Attach the user info we want to show
            };
          }
          return acc;
        }, {});

        // Convert to array and sort by most recent
        const sortedMessages = Object.values(groupedMessages).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setMessages(sortedMessages);
      }
    } catch (error) {
      console.error("Message Fetch Error:", error);
    }
  };

  useEffect(() => {
    let interval;
    if (user) {
      fetchMessages();
      // Set interval and store reference
      interval = setInterval(fetchMessages, 30000);
    }

    return () => {
      if (interval) clearInterval(interval); // Properly clear the timer
    };
  }, [user]);

  if (messages.length === 0) return null; // Don't show the box if empty

  return (
    <div className="bg-white w-full max-w-xs mt-4 p-4 rounded-md shadow text-xs">
      <h3 className="font-semibold text-slate-800 mb-4 border-b pb-2">Recent Messages</h3>
      <div className="flex flex-col max-h-64 overflow-y-auto no-scrollbar space-y-1">
        {messages.map((message) => (
          <Link
            to={`/messages/${message.displayUser._id}`}
            key={message._id}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <img
              src={message.displayUser.profile_picture || "/default-avatar.png"}
              alt="profile"
              className="w-9 h-9 rounded-full object-cover border border-slate-100"
            />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <p className="font-semibold text-slate-900 truncate">
                  {message.displayUser.full_name}
                </p>
                <p className="text-[9px] text-slate-400 whitespace-nowrap ml-2">
                  {moment(message.createdAt).fromNow(true)}
                </p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-slate-500 truncate pr-2">
                  {message.from_user_id._id === user.id ? "You: " : ""}
                  {message.text ? message.text : "Sent an attachment"}
                </p>
                {/* Show dot if unread AND the message is NOT from current user */}
                {!message.seen && message.from_user_id._id !== user.id && (
                  <span className="bg-indigo-500 w-2 h-2 rounded-full flex-shrink-0" />
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RecentMessages;