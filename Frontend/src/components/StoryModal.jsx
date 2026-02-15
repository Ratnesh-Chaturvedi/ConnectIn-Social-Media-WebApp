import { ArrowLeft, Sparkle, TextIcon, Upload } from 'lucide-react';
import React, { useState } from 'react'
import toast from 'react-hot-toast';

const StoryModal = ({setShowModal,fetchStory}) => {
    const bgColors=["#FFF7CD","#0992C2","#DA3D20","#B7BDF7","#F075AE","#C5D89D"]
    const [mode,setMode]=useState("text")
    const [background,setBackground]=useState(bgColors[0]);
    const [text,setText]=useState("")
    const [media,setMedia]=useState(null)
    const [previewUrl,setPreviewUrl]=useState(null)
    const handleMediaUpload =(e)=>{
        const file=e.target.files?.[0]
        if(file){
            setMedia(file);
            setPreviewUrl(URL.createObjectURL(file))
            console.log(previewUrl)
        }
    }

const handleCreateStory = async ()=>{}





  return (
    <div className='fixed inset-0  z-110 min-h-screen bg-black/80  backdrop-blur  text-white flex items-center justify-center p-4'>
        <div className='w-full max-w-md'>
            <div className='text-center mb-4 flex  items-center justify-between'>
                <button onClick={()=>setShowModal(false)} className='text-white p-2 cursor-pointer'>
                    <ArrowLeft/> 
                </button>
                <h2 className='text-lg  font-semibold'>Create Story</h2>
                <span className='w-10'></span>
            </div>

            <div className='rounded-lg h-96 flex items-center justify-center relative' style={{backgroundColor:background}}>
    {
        mode==="text" && (
            <textarea className=' bg-transparent text-black  w-full h-full p-6 text-lg resize-none focus:outline-none' placeholder='Babu kya hai tumare maan mai ?  ' value={text}  onChange={(e)=>setText(e.target.value)} />
        )
    }{
        mode==="media" && previewUrl && (
            media?.type.startsWith('image')? (
                <img src={previewUrl} alt="hello"  className='object-contain max-h-full'/>
            ):(
                <video src={previewUrl}  className='object-contain max-h-full' />
            )
        )
    }

            </div>

            <div className='flex mt-4 gap-2'>
           {
            bgColors.map((colors)=>(
                <button key={colors} className={` w-6 h-6  rounded-full ring  cursor-pointer `} style={{backgroundColor:colors}} onClick={()=>setBackground(colors)} />
            ))
           }
            </div>

            <div className='flex gap-2 mt-4'>
                <button onClick={()=> {setMode("text"); setMedia(null); setPreviewUrl(null)}} className={`flex-1  flex items-center  justify-center gap-2 p-2 rounded cursor-pointer ${mode==="text"?"bg-white text-black":"bg-zinc-800"}`}>
                    <TextIcon size={18}/> Text
                </button>
                <label className={`flex-1  flex items-center  justify-center  gap-2 p-2 rounded cursor-pointer ${mode==="media"?"bg-white text-black" : "bg-zinc-800"}`}>
                    <input onChange={(e)=>{handleMediaUpload(e) ; setMode("media");}} type="file" accept='image/* , video/*' className='hidden' />
                    <Upload size={18} />Photo/Video
                </label>
            </div>
                <button 
                onClick={()=>toast.promise(handleCreateStory(),{
                    loading:"Saving...",
                    success:<p>Story Added</p>,
                    error:e=><p>{e.message}</p>
                })}
                className='w-full flex items-center justify-center gap-2 text-white py-3 mt-4 rounded bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-blue-500 hover:to-indigo-500 transition-all duration-150  cursor-pointer active:scale-95'>
                 <Sparkle size={18} />Create Story
                </button>
        </div>
    </div>
  )
}

export default StoryModal