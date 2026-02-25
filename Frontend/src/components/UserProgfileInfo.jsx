import { Calendar, MapPin, MessageCircle, PenBox, UserMinus, UserPlus, UserRoundX, Verified } from "lucide-react";
import React from "react";
import moment from "moment";
const UserProgfileInfo = ({ user, posts, profileId, setEdit }) => {
    // are we following the current user that we are viewing
    const isFollowingToUser=false;
    const isConnectedToUser=false;

    // if(user.following.includes(profileId)) isFollowingToUser=true;
    // if(user.connection.includes(profileId)) isConnectedToUser=true;
    
    



  return (
    <div className="relative py-4 px-6 md:px-8 bg-white ">
      <div className="flex flex-col md:flex-row items-start gap-6">
        <div className="w-32  h-32 border-4 border-white shadow-lg absolute -top-16 rounded-full">
          <img
            src={user.profile_picture}
            alt=""
            className="absolute rounded-full z-2 h-full  w-full object-cover"
          />
        </div>

        <div className="w-full pt-15 md:pt-0 md:pl-36">
          <div className="flex flex-col md:flex-row  items-start justify-between">
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
            {/* if user is on his profile we give him the edit button */}
            {!profileId && (
              <button
                onClick={() => setEdit(true)}
                className="flex items-center  gap-2 border border-gray-300 hover:bg-gray-50 px-4 py-2 rounded-lg font-medium  transition-colors mt-4 md:mt-0 cursor-pointer"
              >
                <PenBox className="w-4 h-4" />
                Edit
              </button>
            )}
            {profileId && (
                <div className="flex flex-col  gap-1 absolute right-10">
                     {isConnectedToUser && ( <div className="flex items-center justify-center gap-1 bg-blue-400 rounded-xl p-2 text-white cursor-pointer">
                        <MessageCircle className="inline" />Message
                        </div>  )}
                    
                    <div className={`flex items-center justify-center gap-2  ${isFollowingToUser ?"bg-blue-400":"bg-red-400"}  rounded-xl p-2 text-white cursor-pointer text-center`}>
                         {isFollowingToUser ? <p className="text-center"><UserPlus className="inline" /> Follow </p>:<p><UserMinus className="inline" /> Unfollow</p>}
                    </div>
                    {isConnectedToUser ? <div className="flex items-center gap-1  bg-blue-400 rounded-xl p-2 text-white cursor-pointer"><UserRoundX className="inline" />Disconnect</div>: <p>Hello</p>}
                    
                    
                    
                </div>
            )}
          </div>
          <p className="text-gray-700 text-sm max-w-md mt-4">{user.bio}</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 mt-4">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              {user.location ? user.location : "Add Location"}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              Joined
              <span className="font-medium">
                {moment(user.createdAt).fromNow()}
              </span>
            </span>
          </div>

          {/* number of post,follower,following */}
          <div className="flex items-center gap-6 mt-6 border-t border-gray-200 pt-4">
            <div>
              <span className="sm:text-xl font-bold text-gray-900">
                {posts.length}
              </span>
              <span className="text-xs sm:text-sm text-gray-500 ml-1.5  ">
                Posts
              </span>
            </div>
            <div>
              <span className="sm:text-xl font-bold text-gray-900">
                {user.followers.length}
              </span>
              <span className="text-xs sm:text-sm text-gray-500 ml-1.5  ">
                Followers
              </span>
            </div>
            <div>
              <span className="sm:text-xl font-bold text-gray-900">
                {user.following.length}
              </span>
              <span className="text-xs sm:text-sm text-gray-500 ml-1.5  ">
                Following
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProgfileInfo;
