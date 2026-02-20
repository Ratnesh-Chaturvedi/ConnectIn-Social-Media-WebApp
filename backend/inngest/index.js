import { Inngest } from "inngest";
import User from "../models/user.model.js"
import Connection from "../models/connection.model.js";
import sendEmail from "../config/nodeMailer.js";
import Story from "../models/story.model.js";
import Message from "../models/message.model.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "connectin" });

//inngest function to save user data to database


const syncUserCreation = inngest.createFunction(
    {id:"sync-user-from-clerk"},
    {event:"clerk/user.created"},
    async ({event})=>{
      const {id,first_name,last_name,email_addresses,image_url}=event.data;  
      let username=email_addresses[0].email_address.split('@')[0]
        
      //check availability of the username 
      const user=await User.findOne({username})
      if(user){
        username=username+Math.floor(Math.random()*10000)
      }
      const userData={
        _id:id,
        full_name:first_name+" "+last_name,
        email:email_addresses[0].email_address,
        profile_picture:image_url,
        username
      }

      const createdUser =await User.create(userData)
      console.log("usercreated",createdUser);

    }
)


// inngest function to update userdata 

const syncUserUpdation=inngest.createFunction(
      {id:"update-user-from-clerk"},
    {event:"clerk/user.updated"},
    async ({event})=>{
      const {id,first_name,last_name,email_addresses,image_url}=event.data;  
    
      const updatedData={
        email:email_addresses[0].email_address,
        full_name:first_name+" "+last_name,
        profile_picture:image_url,
      }

      await User.findByIdAndUpdate(id,updatedData)
        
    }   
)

// inngest function to delete the user from the database
const syncUserDeletion=inngest.createFunction(
      {id:"delete-user-from-clerk"},
    {event:"clerk/user.deleted"},
    async ({event})=>{
      const {id}=event.data;  
      await User.findByIdAndDelete(id)
        

    }   
)


// create a function so when we send a new connection request it will send the email
// here we send 2 types of email 
//1->send instantly
//2->send after 24 hours 

const sendNewConnectionRequestReminder = inngest.createFunction(
  {id:"send-new-connection-request-reminder"},
  {event:"app/connection-request"},
  async ({event,step})=>{

    const {connectionId}=event.data;
    await step.run('send-connection-request-main',async()=>{
      const connection =await Connection.findById(connectionId).populate('from_user_id to_user_id')
      const subject=`🖐 New Connection Request`
      const body=`
      <div style="font-family:Arial,sens-serif ; padding:20px;">
      <h2>Hi ${connection.to_user_id.full_name},</h2>
      <p>You have a new connection request from ${connection.from_user_id.full_name}-@${connection.from_user_id.username}</p>
      <p>Click <a href="${process.env.FRONTEND_URL}/connections" style="color:#10b981 ;">here</a> to accept  or reject the request  </p>
      <br/>
      <p>Thanks,<br/> ConnectIn-Stay Connected </p>
      </div>
      `
      await sendEmail({
        to:connection.to_user_id.email,
        subject,
        body
      })
    })

    // send the email again after 24 hours if the request is not accepted
      const in24hours=new Date(Date.now()+24*60*60*1000)
      await step.sleepUntil("wait-for-24-hours",in24hours)
      await step.run('send-connection-request-reminder',async ()=>{
        const connection=await Connection.findById(connecionId).populate("from_user_id to_user_id")
        if(connection.status==="accepted"){
          return {message:"Already Accepted"}
        }
        const subject=`🖐 New Connection Request`
      const body=`
      <div style="font-family:Arial,sens-serif ; padding:20px;">
      <h2>Hi ${connection.to_user_id.full_name},</h2>
      <p>You have a new connection request from ${connection.from_user_id.full_name}-@${connection.from_user_id.username}</p>
      <p>Click <a href="${process.env.FRONTEND_URL}/connections" style="color:#10b981 ;">here</a> to accept  or reject the request  </p>
      <br/>
      <p>Thanks,<br/> ConnectIn-Stay Connected </p>
      </div>
      `
      await sendEmail({
        to:connection.to_user_id.email,
        subject,
        body
      })

      return {message:"Reminder send"}
      })
  }
)

// create a background job where after 24 hour the story will be deleted


const deleteStoryAfter24Hour=inngest.createFunction(
  {id:"story-delete"},
  {event:"app/story.delete"},
  async ({event,step})=>{
    const {storyId}=event.data;
    const in24hours=new Date(Date.now()+24*60*60*1000);
    await step.sleepUntil("wait-for-24-hour",in24hours)
    await step.run('delete-story',async()=>{
      await Story.findByIdAndDelete(storyId)
      return ({message:"Story Deleted"})
    })
  }
)


// send notification for unseen messages

const sendNotificationOfUnseenMessage=inngest.createFunction(
{id:"send-unseen-messages-notification"},
{cron:"TZ=America/New_York 0 9 * * *"}, //every day 9 AM
async({step})=>{
  const messages=await Message.find({seen:false}).populate("to_user_id");
  const unseenCount ={}
  
  messages.map(message=>{
    unseenCount[message.to_user_id._id]=(unseenCount[message.to_user_id._id] || 0)+1
  })

  for(const userId in unseenCount){
    const user=await User.findById(userId)

    const subject=`You have ${unseenCount[userId]} unseen Message`
    const body=`<div style="font-family:Arial,sens-serif ; padding:20px;">
      <h2>Hi ${connection.to_user_id.full_name},</h2>
      <p>You have a  ${unseenCount[userId]} unseen message</p>
      <p>Click <a href="${process.env.FRONTEND_URL}/connections" style="color:#10b981 ;">here</a> to view them  </p>
      <br/>
      <p>Thanks,<br/> ConnectIn - Stay Connected </p>
      </div>
      `;
      await sendEmail({
        to:user.email,
        subject,
        body
      })
  }
  return {message:"Notification Send"}

} 

)



// Create an empty array where we'll export future Inngest functions
export const functions = [
syncUserCreation,
syncUserUpdation,
syncUserDeletion,
sendNewConnectionRequestReminder,
deleteStoryAfter24Hour,
sendNotificationOfUnseenMessage

];