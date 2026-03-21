import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import UserCard from "../components/UserCard.jsx";
import Loading from "../components/Loading.jsx";
import api from "../api/axios.js";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { fetchUser } from "../features/users/userSlice.js";

const Discover = () => {
  const { getToken } = useAuth();
  const currentUser = useSelector((state) => state.user.value);
  const dispatch = useDispatch();

  const [input, setInput] = useState("");
  const [searchUsers, setSearchUsers] = useState([]);
  const [randomUsers, setRandomUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch random users
  const fetchRandomUsers = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const { data } = await api.get("/api/user/random", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setRandomUsers(data.users);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Search users by input
  const handleSearch = async (e) => {
    if (e.key === "Enter") {
      try {
        setSearchUsers([]);
        setLoading(true);
        const token = await getToken();
        const { data } = await api.post(
          "/api/user/discover",
          { input },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (data.success) {
          setSearchUsers(data.filteredUsers);
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  // Load current user and random users on mount
  useEffect(() => {
    getToken().then((token) => {
      dispatch(fetchUser(token));
    });
    fetchRandomUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto p-6">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Discover People
          </h1>
          <p className="text-slate-600">
            Connect with amazing people and grow your network
          </p>
        </div>

        {/* Search Input */}
        <div className="mb-8 shadow-md rounded-md border border-slate-200/60 bg-white/80">
          <div className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search people by name, username, bio, location"
                className="pl-10 sm:pl-12 py-2 w-full border-gray-300 rounded-md max-sm:text-sm"
                onChange={(e) => setInput(e.target.value)}
                value={input}
                onKeyUp={handleSearch}
              />
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="flex flex-wrap gap-6">
          {searchUsers.length > 0
            ? searchUsers.map((user) => <UserCard key={user._id} user={user} />)
            : randomUsers.map((user) => <UserCard key={user._id} user={user} />)}
        </div>

        {/* Loading */}
        {loading && <Loading height="60vh" />}
      </div>
    </div>
  );
};

export default Discover;