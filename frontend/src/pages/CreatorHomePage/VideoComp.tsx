import React, {memo, useCallback, useRef, useState} from "react";
import {videoInfo} from "./CreatorHomePage.tsx";
import "./videoComp.css"
import {Button, Dialog, Flex, TextField,Text} from "@radix-ui/themes";
import {deleteDoc, doc, updateDoc} from "firebase/firestore";
import {database, fireStorage} from "../../utils/firebaseconf.ts";
import {deleteObject, getDownloadURL, ref} from "firebase/storage";
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
        <Dialog.Root>
            <Dialog.Trigger>
               <button hidden={true} ref={promtInfo}></button>
            </Dialog.Trigger>

            <Dialog.Content style={{maxWidth: 450}}>
                <Dialog.Title>Update Video Info</Dialog.Title>
                <Dialog.Description size="2" mb="4">
                    Make changes to your video.
                </Dialog.Description>

                <Flex direction="column" gap="3">
                    <label>
                        <Text as="div" size="2" mb="1" weight="bold">
                            Title
                        </Text>
                        <TextField.Input placeholder="Enter video title" value={title} onChange={(e)=>setTitle(e.target.value)}/>
                    </label>
                    <label>
                        <Text as="div" size="2" mb="1" weight="bold">
                            Description
                        </Text>
                        <TextField.Input placeholder="Enter video description" value={description} onChange={(e)=>setDescription(e.target.value)}/>
                    </label>
                    <label>
                        <Text as="div" size="2" mb="1" weight="bold">
                            Tags
                        </Text>
                        <TextField.Input placeholder="Enter tags separated by ," value={tags} onChange={(e)=>setTags(e.target.value)}/>
                    </label>


                </Flex>

                <Flex gap="3" mt="4" justify="end">
                    <Dialog.Close>
                        <Button onClick={updateVideoInfoFunc}>Update</Button>
                    </Dialog.Close>
                </Flex>
            </Dialog.Content>
        </Dialog.Root>
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