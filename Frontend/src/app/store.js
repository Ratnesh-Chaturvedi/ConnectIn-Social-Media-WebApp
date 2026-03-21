import { configureStore } from '@reduxjs/toolkit'
import userReducer from "../features/users/userSlice.js"
import connectionReducer from "../features/connections/connectionSlice.js"
import messageReducer from "../features/messages/messageSlice.js"
import postReducer from "../features/post/postSlice.js"

export const store = configureStore({
  reducer: {
    user:userReducer,
    connections:connectionReducer,
    messages:messageReducer,
    posts:postReducer
  },
})