import React, { useRef, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Connection from "./pages/Connection";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Feed from "./pages/Feed";
import Messages from "./pages/Messages";
import CreatePost from "./pages/CreatePost";
import Discover from "./pages/Discover";
import ChatBox from "./pages/ChatBox";
import { useUser, useAuth } from "@clerk/clerk-react";
import Layout from "./pages/Layout";
import { Toaster ,toast } from "react-hot-toast";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { fetchUser } from "./features/users/userSlice.js";
import { fetchConnections } from "./features/connections/connectionSlice.js";
import { addMessages } from "./features/messages/messageSlice.js";
import Notification from "./components/Notification.jsx";
import ProfileOther from "./pages/ProfileOther.jsx";

const App = () => {
  const { user } = useUser();
  // printing the token of user
  const { getToken } = useAuth();

  const dispatch = useDispatch();

  //  we are doing this to get the message instantly
  const { pathname } = useLocation();
  const pathnameRef = useRef(pathname);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const token = await getToken();
        dispatch(fetchUser(token));
        dispatch(fetchConnections(token));
      }
    };
    fetchData();
  }, [user, getToken, dispatch]);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    if (user) {
      const eventSource = new EventSource(
        import.meta.env.VITE_BACKEND_URL + "/api/message/" + user.id,
      );

      eventSource.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (pathnameRef.current === "/messages/" + message.from_user_id._id) {
          dispatch(addMessages(message));
        } else {
          // we will add the notification component
          toast.custom((t)=>(
            <Notification t={t} message={message}/>
          ),{position:"bottom-right"})
        }
      };
      return () => {
        eventSource.close();
      };
    }
  }, [user, dispatch]);

  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/" element={!user ? <Login /> : <Layout />}>
          <Route index element={<Feed />} />
          <Route path="messages" element={<Messages />} />
          <Route path="messages/:userId" element={<ChatBox />} />
          <Route path="connections" element={<Connection />} />
          <Route path="profile" element={<Profile />} />
          <Route path="discover" element={<Discover />} />
          <Route path="profile/:profileId" element={<ProfileOther />} />
          <Route path="create-post" element={<CreatePost />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
