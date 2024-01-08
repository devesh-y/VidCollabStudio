import {memo, useCallback, useEffect, useRef, useState} from "react";
import {SHA256} from "crypto-js";
import { ref, uploadBytesResumable } from "firebase/storage";
import {database, fireStorage} from "@/utilities/firebaseconf.ts";
import {doc, getDoc, setDoc} from "firebase/firestore";
import {LuLoader2} from "react-icons/lu";
import {Button} from "@/components/ui/button.tsx";
import {getCreatorVideos, videoInfoType} from "@/utilities/getCreatorVideos.ts";
import {VideoComp} from "@/components/VideoComp.tsx";
import {AskAI} from "@/components/AskAI.tsx";

export const VideosPanel=memo(({creatorEmail,editorEmail}:{creatorEmail:string,editorEmail:string})=>{
    const [loading,setLoading]=useState(true);
    const [videos,setVideos]=useState<videoInfoType[]>([])
    const [uploadLoading,setUploadLoading]=useState(false);

    useEffect(() => {
        getCreatorVideos(creatorEmail).then((videos)=>{
            setVideos(videos as videoInfoType[])
            setLoading(false)
        })
    }, [creatorEmail])

    const inputUploadRef=useRef<HTMLInputElement>(null)
    const uploadVideoFunc=useCallback(async ()=>{
        const snap=await getDoc(doc(database,"creators",creatorEmail))
        if(editorEmail!==""&& (!snap.exists() || snap.data().editor!=editorEmail)){
            return;
        }
        if(inputUploadRef.current && inputUploadRef.current.files){
            setUploadLoading(true);
            const file=inputUploadRef.current.files[0];
            const filename=file.name;
            const arr=filename.split('.');
            const fileExt=arr[arr.length-1];
            const CurrDateTime=(new Date().getTime()).toString();
            const uniqueId=SHA256(CurrDateTime+creatorEmail).toString();
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
                console.log("uploaded")
                await setDoc(doc(database,"creators"+"/"+creatorEmail+"/videos",CurrDateTime),{id:CurrDateTime,title:filename,description:"",tags:"",thumbNailUrl:"",filepath});
                setVideos([...videos,{id:CurrDateTime,title:filename,description:"",tags:"",thumbNailUrl:"",filepath,thumbNailPath:""}])
                setUploadLoading(false);
            }
            catch (err) {
                return new Promise((_resolve,reject)=>{
                    reject("error in uploading file");
                })
            }
        }

    },[creatorEmail, editorEmail, videos])

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
    return <div className={"m-1"}>
        <input type={"file"} ref={inputUploadRef} hidden={true} accept={"video/*"} multiple={false}/>
        <div className={"flex items-center mb-1 gap-2"}>
            {creatorEmail != "" ? <Button onClick={() => inputUploadRef.current?.click()} disabled={uploadLoading}>{uploadLoading ? "Uploading" : "Upload Video"}</Button>:<></>}
            {editorEmail===""?<AskAI/>:<></>}

        </div>


        <div className={"bg-gray-400 rounded-md p-2 font-bold mb-1"}>Creator Videos</div>

        {loading?<div className={"flex justify-center"}><LuLoader2 className={"animate-spin"} size={50}/></div>:
                <div className={"flex flex-col gap-4"}>
                        {videos.map((value, index) => {
                            return <VideoComp key={index} video={value} creatorEmail={creatorEmail} setVideos={setVideos} videos={videos} editorEmail={editorEmail}/>})
                        }
                </div>
        }

    </div>
})