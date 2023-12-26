import React, {memo, useCallback, useEffect, useRef, useState} from "react";
import {videoInfo} from "./CreatorHomePage.tsx";
import {VideoComp} from "./VideoComp.tsx";
import {SHA256} from "crypto-js";
import { ref, uploadBytesResumable } from "firebase/storage";
import {database, fireStorage} from "../../utils/firebaseconf.ts";
import {doc, setDoc } from "firebase/firestore";

export const VideosPanel=memo(({videos,email,setVideos,editorEmailLogin}:{videos:videoInfo[],email:string,setVideos: React.Dispatch<React.SetStateAction<videoInfo[]>>,editorEmailLogin:string})=>{
    const [uploadloading,setuploadloading]=useState(false);
    const inputUploadRef=useRef<HTMLInputElement>(null)
    const uploadVideoFunc=useCallback(async ()=>{
        if(inputUploadRef.current && inputUploadRef.current.files){
            setuploadloading(true);
            const file=inputUploadRef.current.files[0];
            const filename=file.name;
            const arr=filename.split('.');
            const fileExt=arr[arr.length-1];
            const CurrDateTime=(new Date().getTime()).toString();
            const uniqueId=SHA256(CurrDateTime+email).toString();
            const filepath=uniqueId+"."+fileExt;
            const storeRef=ref(fireStorage,filepath);
            try{
                const myfileupload=async ()=>{
                    return new Promise((resolve, reject)=>{
                        const uploadtask=uploadBytesResumable(storeRef,file);
                        uploadtask.on('state_changed',
                            (snapshot) => {
                                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                                console.log('Upload is ' + progress + '% done');
                                if(progress==100){
                                    resolve("done");
                                }
                            }, (error) => {
                                reject(error);
                            }
                        );
                    })
                }
                await myfileupload();
                setuploadloading(false);

                console.log("uploaded")
                await setDoc(doc(database,"creators"+"/"+email+"/videos",CurrDateTime),{id:CurrDateTime,title:"new video",description:"",tags:"",thumbNailUrl:"",filepath});
                setVideos([...videos,{id:CurrDateTime,title:"new video",description:"",tags:"",thumbNailUrl:"",filepath,thumbNailPath:""}])
            }
            catch (err) {
                return new Promise((_resolve,reject)=>{
                    reject("error in uploading file");
                })
            }
        }

    },[email, setVideos, videos])
    useEffect(() => {
        const temp=inputUploadRef.current
        if(temp){
            inputUploadRef.current.addEventListener('change',uploadVideoFunc);
        }
        return ()=>{
            if(temp){
                temp.removeEventListener('change',uploadVideoFunc)
            }
        }
    }, [uploadVideoFunc]);
    return <div style={{display: "table-cell", minWidth: "600px", borderRadius: "10px", padding: "10px"}}>
        <input type={"file"} ref={inputUploadRef} hidden={true} accept={"video/*"}/>
        {email != "" ? <div style={{
            padding: "5px",
            backgroundColor: "blue",
            width: "fit-content",
            color: "white",
            borderRadius: "5px",
            marginBottom: "10px",
            cursor: "default"
        }} onClick={() => inputUploadRef.current?.click()}>{uploadloading ? "Uploading" : "Upload Video"}</div>:<></>}

        <div style={{
            backgroundColor: "skyblue",
            padding: "5px",
            borderRadius: "10px",
            marginBottom: "10px",
            fontWeight: "800"
        }}>Creator Videos
        </div>
        {email != "" ? <div style={{
            display: "flex",
            flexDirection: "column",
            gap: '10px',
            border: "solid 1px black", borderRadius: "10px", boxShadow: "0px 0px 2px 2px black"
        }}>
            {videos.map((value, index) => {
                return <VideoComp key={index} video={value} email={email} setVideos={setVideos} videos={videos} editorEmailLogin={editorEmailLogin}/>
            })}
        </div>:<></>}


    </div>
})