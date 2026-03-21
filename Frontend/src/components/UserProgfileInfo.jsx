import {
  Calendar,
  MapPin,
  MessageCircle,
  PenBox,
  UserMinus,
  UserPlus,
  UserRoundX,
  Verified,
  MoreVertical,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import moment from "moment";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import api from "../api/axios.js";

const UserProgfileInfo = ({ user, posts, profileId, setEdit, currentUser }) => {
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const [isConnected, setIsConnected] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isPendingRequest, setIsPendingRequest] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setIsConnected(user.connections.includes(currentUser._id));
      setIsFollowing(user.followers.includes(currentUser._id));
    }
  }, [user, currentUser]);

  // Connect to user
  const handleConnectionRequest = async () => {
    try {
      const token = await getToken();
      const { data } = await api.post(
        "/api/user/connect",
        { id: profileId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success("Request send");
        setIsPendingRequest(true);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Disconnect
  const disconnect = async () => {
    try {
      const token = await getToken();
      const { data } = await api.patch(
        `/api/user/disconnect/${profileId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success(data.message);
        setIsConnected(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Follow / Unfollow
  const toggleFollow = async () => {
    try {
      const token = await getToken();
      const { data } = await api.patch(
        `/api/user/togglefollow/${profileId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success(data.message);
        setIsFollowing((prev) => !prev);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="relative py-4 px-6 md:px-8 bg-white">
      <div className="flex flex-col md:flex-row items-start gap-6">
        {/* Profile Picture */}
        <div className="w-32 h-32 border-4 border-white shadow-lg absolute -top-16 rounded-full">
          <img
            src={user.profile_picture}
            alt="Profile"
            className="absolute rounded-full z-2 h-full w-full object-cover"
          />
        </div>

        <div className="w-full pt-15 md:pt-0 md:pl-36">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">
                  {user.full_name}
                </h1>
                <Verified className="w-6 h-6 text-indigo-600" />
              </div>
              <p className="text-gray-500">
                {user.username ? `@${user.username}` : `add a username`}
              </p>
            </div>

            {/* Edit Button */}
            {!profileId && (
              <button
                onClick={() => setEdit(true)}
                className="flex items-center gap-2 border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium transition-colors mt-4 md:mt-0 cursor-pointer"
              >
                <PenBox className="w-4 h-4" />
                Edit
              </button>
            )}

            {/* Actions */}
            {profileId && (
              <div className="absolute right-4 md:right-10">
                {/* Desktop Buttons */}
                <div className="hidden md:flex flex-col gap-2">
                  {isConnected ? (
                    <>
                      <div
                        className="flex items-center justify-center gap-1 bg-blue-400 rounded-xl p-2 text-white cursor-pointer"
                        onClick={() => navigate(`/messages/${profileId}`)}
                      >
                        <MessageCircle />
                        Message
                      </div>

                      <div
                        className="flex items-center gap-1 bg-red-400 rounded-xl p-2 text-white cursor-pointer"
                        onClick={disconnect}
                      >
                        <UserRoundX />
                        Disconnect
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        className="flex items-center justify-center gap-1 bg-blue-400 rounded-xl p-2 text-white cursor-pointer"
                        onClick={handleConnectionRequest}
                      >
                        {isPendingRequest ? "Pending" : "Connect"}
                      </div>

                      <div
                        className={`flex items-center justify-center gap-2 rounded-xl p-2 text-white cursor-pointer ${
                          isFollowing ? "bg-red-400" : "bg-blue-400"
                        }`}
                        onClick={toggleFollow}
                      >
                        {isFollowing ? (
                          <>
                            <UserMinus /> UnFollow
                          </>
                        ) : (
                          <>
                            <UserPlus /> Follow
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Mobile Menu */}
                <MobileMenu
                  isConnected={isConnected}
                  isFollowing={isFollowing}
                  isPendingRequest={isPendingRequest}
                  handleConnectionRequest={handleConnectionRequest}
                  disconnect={disconnect}
                  toggleFollow={toggleFollow}
                  navigate={navigate}
                  profileId={profileId}
                />
              </div>
            )}
          </div>

          {/* Bio */}
          <p className="text-gray-700 text-sm max-w-md mt-4">
            {user.bio}
          </p>

          {/* Info */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 mt-4">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {user.location || "Add Location"}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              Joined{" "}
              <span className="font-medium">
                {moment(user.createdAt).fromNow()}
              </span>
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mt-6 border-t border-gray-200 pt-4">
            <div>
              <span className="sm:text-xl font-bold text-gray-900">
                {posts.length}
              </span>
              <span className="text-xs sm:text-sm text-gray-500 ml-1.5">
                Posts
              </span>
            </div>
            <div>
              <span className="sm:text-xl font-bold text-gray-900">
                {user.followers.length}
              </span>
              <span className="text-xs sm:text-sm text-gray-500 ml-1.5">
                Followers
              </span>
            </div>
            <div>
              <span className="sm:text-xl font-bold text-gray-900">
                {user.following.length}
              </span>
              <span className="text-xs sm:text-sm text-gray-500 ml-1.5">
                Following
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Mobile Dropdown Component
const MobileMenu = ({
  isConnected,
  isFollowing,
  isPendingRequest,
  handleConnectionRequest,
  disconnect,
  toggleFollow,
  navigate,
  profileId,
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="md:hidden relative">
      <div
        className="p-2 rounded-full hover:bg-gray-200 cursor-pointer"
        onClick={() => setShowMenu((prev) => !prev)}
      >
        <MoreVertical />
      </div>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg border z-50">
          {isConnected ? (
            <>
              <div
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  navigate(`/messages/${profileId}`);
                  setShowMenu(false);
                }}
              >
                Message
              </div>

              <div
                className="p-2 hover:bg-gray-100 text-red-500 cursor-pointer"
                onClick={() => {
                  disconnect();
                  setShowMenu(false);
                }}
              >
                Disconnect
              </div>
            </>
          ) : (
            <>
              <div
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  handleConnectionRequest();
                  setShowMenu(false);
                }}
              >
                {isPendingRequest ? "Pending" : "Connect"}
              </div>

              <div
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  toggleFollow();
                  setShowMenu(false);
                }}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default UserProgfileInfo;