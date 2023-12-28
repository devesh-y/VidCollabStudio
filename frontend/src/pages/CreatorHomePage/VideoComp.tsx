import React, {memo, useCallback, useRef, useState} from "react";
import {videoInfo} from "./CreatorHomePage.tsx";
import "./videoComp.css"

import {deleteDoc, doc, updateDoc} from "firebase/firestore";
import {database, fireStorage} from "@/utils/firebaseconf.ts";
import {deleteObject, getDownloadURL, ref} from "firebase/storage";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";
export const VideoComp=memo(({video,email,setVideos,videos,editorEmailLogin}:{video:videoInfo,email:string,setVideos: React.Dispatch<React.SetStateAction<videoInfo[]>>,videos:videoInfo[],editorEmailLogin:string})=>{
    const promtInfo=useRef<HTMLButtonElement>(null)
    const [title,setTitle]=useState(video.title);
    const [description,setDescription]=useState(video.description);
    const [tags,setTags]=useState(video.tags);
    const [uploadloading,setuploadloading]=useState(false);
    const updateVideoInfoFunc=useCallback(()=>{
        updateDoc(doc(database,'creators/'+email+"/videos",video.id),{
            title, description,tags
        }).then(()=>{
            const newvideos=videos.filter((tmp)=>{
                return tmp!=video
            })
            const finalvideos=[...newvideos,{title,description,tags,id:video.id,filepath:video.filepath,thumbNailUrl:video.thumbNailUrl,thumbNailPath:video.thumbNailPath}]
            setVideos(finalvideos);
        }).catch(()=>{
            
        })
    },[description, email, setVideos, tags, title, video, videos])
    const DownloadFunc=useCallback(()=>{
        getDownloadURL(ref(fireStorage,video.filepath)).then((url)=>{
            const a=document.createElement("a");
            a.href=url;
            a.target="_blank";
            a.click();
        })
    },[video.filepath])
    const DeleteFunc=useCallback( ()=>{
       
        //delete from files database
        deleteDoc(doc(database,"creators/"+email+"/videos",video.id)).catch(()=>{
            console.log("error in deleting from files database");
        })
        
        //delete from storage
        const deleteRef=ref(fireStorage,video.filepath);
        deleteObject(deleteRef).catch(()=>{
            console.log("error in deleting from storage");
        })
        const index=videos.indexOf(video);
        if(index!=-1){
            const temp=Array.from(videos);
            temp.splice(index,1);
            setVideos(temp);
            
        }

    },[email, setVideos, video, videos])
    const uploadToYoutube=useCallback(()=>{
        if(uploadloading){
            return;
        }
        setuploadloading(true);
        const data={id:video.id,email:email};
        fetch(`${import.meta.env.VITE_BACKEND}/uploadVideo`,{
            method:'POST',
            headers:{
                'Content-Type': 'application/json'
            },
            body:JSON.stringify(data)
        }).then((res)=>{
            setuploadloading(false);
            if(!res.ok){
                throw new Error("error occured")
            }
            return res.text();

        }).then((output)=>{
            console.log(output)
        }).catch((err)=>{
            setuploadloading(false);
            console.log(err.message)
        })
    },[email, uploadloading, video.id])

    return <>
        <Dialog>
            <DialogTrigger>
                <button hidden={true} ref={promtInfo}></button>
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
                        <Input  className="col-span-3" placeholder="Enter video title" value={title} onChange={(e) => setTitle(e.target.value)}/>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Description:
                        </Label>
                        <Input  className="col-span-3" placeholder="Enter video description" value={description} onChange={(e) => setDescription(e.target.value)}/>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="username" className="text-right">
                            Tags:
                        </Label>
                        <Input  className="col-span-3" placeholder="Enter tags separated by ," value={tags} onChange={(e) => setTags(e.target.value)}/>
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

        <div className={"videoinfo"} style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            cursor: "default",
            padding: "10px",
            borderRadius: "10px"
        }}>
            <div style={{display: "flex", flexDirection: "column", gap: "5px"}}
                 onClick={() => {
                     if(editorEmailLogin=="") {
                         promtInfo.current?.click()
                     }

                 }}>
                <div style={{fontWeight: "500"}}>{video.title} </div>
                <i style={{fontSize: '15px'}}>Description: {video.description}</i>
            </div>

            <div style={{display: "flex", alignItems: "center", gap: "10px"}}>
                {editorEmailLogin == "" ? <div style={{
                    borderRadius: "5px",
                    backgroundColor: "blue",
                    width: "fit-content",
                    padding: "5px",
                    color: "white"
                }} onClick={uploadToYoutube}>{uploadloading ? "Uploading" : "Upload"}</div>:<></>}

                <div style={{
                    borderRadius: "5px",
                    backgroundColor: "greenyellow",
                    width: "fit-content",
                    padding: "5px"
                }} onClick={DownloadFunc}>Download
                </div>
                {editorEmailLogin == "" ? <div style={{
                    borderRadius: "5px",
                    backgroundColor: "red",
                    width: "fit-content",
                    padding: "5px",
                    color: "white"
                }}
                                               onClick={DeleteFunc}>Delete
                </div>:<></>}

            </div>

        </div>
    </>


})