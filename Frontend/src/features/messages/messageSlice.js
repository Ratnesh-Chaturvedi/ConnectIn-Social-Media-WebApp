import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios.js";

const initialState = {
  messages: [],
};
export const fetchMessages = createAsyncThunk(
  "message/fetchMessages",
  async ({ token, userId }) => {
    try {
      const { data } = await api.post(
        "/api/message/get",
        { to_user_id: userId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return data.success ? data : null;
    } catch (error) {
      console.error(error);
    }
  },
);
const messageSlice = createSlice({
  name: "message",
  initialState,
  reducers: {
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessages: (state, action) => { 
      state.messages = [...state.messages, action.payload];
    },
    // when we open other message screen we have to reset the messages
    resetMessages: (state) => {
      state.messages = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchMessages.fulfilled, (state, action) => {
      if (action.payload) {
        state.messages = action.payload.messages;
      }
    });
  },
});
export const { setMessages, resetMessages, addMessages } = messageSlice.actions;
export default messageSlice.reducer;
