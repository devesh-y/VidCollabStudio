import React, {memo, useCallback, useRef, useState} from "react";
import {deleteDoc, doc, updateDoc} from "firebase/firestore";
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
export const VideoComp=memo(({video,setVideos,videos,editorEmail,creatorEmail}:{video:videoInfoType,setVideos: React.Dispatch<React.SetStateAction<videoInfoType[]>>,videos:videoInfoType[],editorEmail:string,creatorEmail:string})=>{
    const promtInfo=useRef<HTMLButtonElement>(null)
    const [videoInfo,setVideoInfo]=useState({title:video.title,description:video.description,tags:video.tags})
    const [uploadingVideo,setUploadingVideo]=useState(false);
    const updateVideoInfoFunc=useCallback(()=>{
        updateDoc(doc(database,'creators/'+creatorEmail+"/videos",video.id),{
            title:videoInfo.title, description:videoInfo.description,tags:videoInfo.tags
        }).then(()=>{
            const otherVideos=videos.filter((tmp)=>{
                return tmp!=video
            })
            const finalVideos=[...otherVideos,{title:videoInfo.title, description:videoInfo.description,tags:videoInfo.tags,id:video.id,filepath:video.filepath,thumbNailUrl:video.thumbNailUrl,thumbNailPath:video.thumbNailPath}]
            setVideos(finalVideos);
        })
    },[creatorEmail, setVideos, video, videoInfo.description, videoInfo.tags, videoInfo.title, videos])

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
        deleteDoc(doc(database,"creators/"+creatorEmail+"/videos",video.id)).catch(()=>{
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

    },[creatorEmail, setVideos, video, videos])
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
            if(!res.ok){
                throw new Error("error occured")
            }
            return res.text();

        }).then((output)=>{
            console.log(output)
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
                        <Input  className="col-span-3" placeholder="Enter video description" value={videoInfo.description} onChange={(e) => setVideoInfo({...videoInfo,description: e.target.value})}/>
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

        <div className={"flex justify-between cursor-default p-2 rounded-md hover:bg-gray-200 items-center"} >
            <div className={"flex flex-col gap-1"}
                 onClick={() => {
                     if(editorEmail=="") {
                         promtInfo.current?.click()
                     }
                 }}>
                <div className={"font-bold"}>{video.title} </div>
                <i>Description: {video.description}</i>
            </div>

            <div className={"flex items-center gap-2"}>
                {editorEmail == "" ? <Button title={"Upload to YouTube"}  className={"w-16"} variant={"secondary"} disabled={uploadingVideo} onClick={uploadToYoutube}>{uploadingVideo ? <LuLoader2 className={"animate-spin w-full h-full"} />:<GrUploadOption className={"w-full h-full"}  />}</Button>:<></>}
                <Button className={"w-16"} onClick={downloadVideo}><FiDownloadCloud className={"w-full h-full"} /></Button>
                {editorEmail == "" ? <Button variant={"destructive"} onClick={deleteVideo}><MdDeleteForever className={"w-full h-full"}  /></Button>:<></>}

            </div>

        </div>
    </>


})