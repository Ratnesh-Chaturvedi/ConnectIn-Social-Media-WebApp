import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../api/axios.js";


const initialState={
    connections:[],
    pendingConnection:[],
    followers:[],
    following:[]
}

export const fetchConnections=createAsyncThunk("connections/fetchConnections",async(token)=>{
    try {
        
        const {data}=await api.get("/api/user/connections",{headers:{Authorization:`Bearer ${token}`}})
        
        return data.success?data:null
    } catch (error) {
        
    }
})


const connectionSlice=createSlice({
    name:"connection",
    initialState,
    reducers:{},
    extraReducers:(builder)=>{
        builder.addCase(fetchConnections.fulfilled,(state,action)=>{
            if(action.payload){
                state.connections=action.payload.connections
                state.followers=action.payload.followers
                state.following=action.payload.following
                state.pendingConnection=action.payload.pendingConnection
            }
        })
    }
})

export  default connectionSlice.reducer