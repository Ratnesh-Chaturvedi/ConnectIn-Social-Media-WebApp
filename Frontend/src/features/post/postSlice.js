import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  feeds: [],      // Stores all posts loaded so far
  seenPosts: [],  // Stores IDs to avoid duplicates from backend
  hasMore: true,  // Tracks if there are more posts to fetch
};

const postSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    // Main action to add new posts to the global list
    setFeeds: (state, action) => {
      const incomingPosts = action.payload;
      
      // Filter: only add posts that aren't already in our Redux list
      const uniqueNewPosts = incomingPosts.filter(
        newPost => !state.feeds.some(existing => existing._id === newPost._id)
      );

      if (uniqueNewPosts.length > 0) {
        state.feeds = [...state.feeds, ...uniqueNewPosts];
        // Track seen IDs so the backend knows what to skip next time
        state.seenPosts = [...new Set([...state.seenPosts, ...uniqueNewPosts.map(p => p._id)])];
      }

      // If backend sends empty array, we reached the end
      if (incomingPosts.length === 0) {
        state.hasMore = false;
      }
    },
    // Reset feed if you ever need to refresh from scratch
    resetFeed: (state) => {
      state.feeds = [];
      state.seenPosts = [];
      state.hasMore = true;
    }
  }
});

export const { setFeeds, resetFeed } = postSlice.actions;
export default postSlice.reducer;