import React, {memo, useCallback, useRef, useState} from "react";
import {database, fireStorage} from "@/utilities/firebaseconf.ts";
import {deleteObject, getDownloadURL, ref} from "firebase/storage";
import {Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
import {LuLoader2} from "react-icons/lu";
import {GrUploadOption} from "react-icons/gr";
import {FiDownloadCloud} from "react-icons/fi";
import {MdDeleteForever} from "react-icons/md";
import {videoInfoType} from "@/utilities/getCreatorVideos.ts";
import {Rating} from "@/components/Rating.tsx";
import {deleteDoc, doc, updateDoc} from "firebase/firestore";
import {Textarea} from "@/components/ui/textarea.tsx";
export const VideoComp=memo(({video,dispatch,creatorEmail,userType}: {
    creatorEmail: string,
    dispatch:   React.Dispatch<{type: string, payload: videoInfoType | videoInfoType[] | string}>,
    userType: string,
    video: videoInfoType,
})=>{
    const promtInfo=useRef<HTMLButtonElement>(null)
    const [videoInfo,setVideoInfo]=useState({title:video.title,description:video.description,tags:video.tags})
    const [uploadingVideo,setUploadingVideo]=useState(false);
    const updateVideoInfoFunc=useCallback(()=>{
        updateDoc(doc(database, 'creators/' + creatorEmail + "/videos", video.id), videoInfo).then(()=>{
            dispatch({type:'updateVideoInfo',payload: {...video,...videoInfo}})
        })
        
    },[creatorEmail, dispatch, video, videoInfo])

    const downloadVideo=useCallback(()=>{
        getDownloadURL(ref(fireStorage,video.filepath)).then((url)=>{
            const a=document.createElement("a");
            a.href=url;
            a.target="_blank";
            a.click();
        })
    },[video.filepath])
    const deleteVideo=useCallback( ()=>{
        //delete from files database
        const pr1=deleteDoc(doc(database,"creators/"+creatorEmail+"/videos",video.id)).catch(()=>{
            console.log("error in deleting from files database");
        })
        //delete from storage
        const pr2=deleteObject(ref(fireStorage,video.filepath)).catch(()=>{
            console.log("error in deleting from storage");
        })
        Promise.all([pr1,pr2]).then(()=>{
            dispatch({type:'deleteVideo',payload:video.id})
        })

    },[creatorEmail, dispatch, video])
    const uploadToYoutube=useCallback(()=>{
        if(uploadingVideo){
            return;
        }
        setUploadingVideo(true);
        const data={id:video.id,email:creatorEmail};
        fetch(`${import.meta.env.VITE_BACKEND}/uploadVideo`,{
            method:'POST',
            headers:{
                'Content-Type': 'application/json'
            },
            body:JSON.stringify(data)
        }).then((res)=>{
            setUploadingVideo(false);
            return res.json();

        }).then(({data,error})=>{
            console.log(data||error)
        }).catch((err)=>{
            setUploadingVideo(false);
            console.log(err.message)
        })
    },[creatorEmail, uploadingVideo, video.id])

    return <>
        <Dialog>
            <DialogTrigger ref={promtInfo} hidden={true}>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Update Video Info</DialogTitle>
                    <DialogDescription>
                        Make changes to your video
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Title:
                        </Label>
                        <Input  className="col-span-3" placeholder="Enter video title" value={videoInfo.title} onChange={(e) => setVideoInfo({...videoInfo,title: e.target.value})}/>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Description:
                        </Label>
                        <Textarea className="col-span-3 resize-none" placeholder="Enter video description" value={videoInfo.description} onChange={(e) => setVideoInfo({...videoInfo,description: e.target.value})}/>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="username" className="text-right">
                            Tags:
                        </Label>
                        <Input  className="col-span-3" placeholder="Enter tags separated by ," value={videoInfo.tags} onChange={(e) => setVideoInfo({...videoInfo,tags: e.target.value})}/>
                    </div>
                </div>
                <DialogFooter className="sm:justify-end">
                    <DialogClose asChild>
                        <Button type="button" variant="default" onClick={updateVideoInfoFunc}>
                            Update
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <div className={"flex justify-between cursor-default p-2 rounded-md hover:bg-gray-200 items-center gap-2 max-sm:flex-col"} >
            <div className={"flex flex-col gap-1 max-sm:self-start"}
                 onClick={() => {
                     if(userType==="creator") {
                         promtInfo.current?.click()
                     }
                 }}>
                <p><span className={"font-bold"}>Title:</span> <i>{video.title}</i></p>
                <p className={"overflow-hidden overflow-ellipsis line-clamp-2"}><span className={"font-bold"}>Description:</span> <i>{video.description}</i></p>
            </div>

            <div className={"flex items-center gap-2 max-sm:self-center"}>
                {userType==="creator" && video.editedBy? <Rating dispatch={dispatch} video={video} creatorEmail={creatorEmail}/>  :<></>}
                {userType == "creator" ? <Button title={"Upload to YouTube"}  className={"w-16"} variant={"secondary"} disabled={uploadingVideo} onClick={uploadToYoutube}>{uploadingVideo ? <LuLoader2 className={"animate-spin w-full h-full"} />:<GrUploadOption className={"w-full h-full"}  />}</Button>:<></>}
                <Button className={"w-16"} onClick={downloadVideo}><FiDownloadCloud className={"w-full h-full"} /></Button>
                {userType == "creator" ? <Button variant={"destructive"} onClick={deleteVideo} className={"w-16"} ><MdDeleteForever className={"w-full h-full"}  /></Button>:<></>}

            </div>

        </div>
    </>


})