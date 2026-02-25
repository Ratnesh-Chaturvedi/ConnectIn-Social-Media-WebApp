import { configureStore } from '@reduxjs/toolkit'
import userReducer from "../features/users/userSlice.js"
import connectionReducer from "../features/connections/connectionSlice.js"
import messageReducer from "../features/messages/messageSlice.js"


export const store = configureStore({
  reducer: {
    user:userReducer,
    connections:connectionReducer,
    messages:messageReducer
  },
})