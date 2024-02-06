import React, {memo, useCallback, useEffect, useRef, useState} from "react";
import {HoverCard, HoverCardContent, HoverCardTrigger} from "@/components/ui/hover-card.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Progress} from "@/components/ui/progress.tsx";
import {doc, getDoc, setDoc} from "firebase/firestore";
import {database, fireStorage} from "@/utilities/firebaseconf.ts";
import {SHA256} from "crypto-js";
import {StorageReference, ref, uploadBytesResumable} from "firebase/storage";
import {videoInfoType} from "@/utilities/getCreatorVideos.ts";

export const UploadFile = memo(({dispatch, creatorEmail, editorEmail, userType}: {
    creatorEmail: string,
    editorEmail: string,
    userType: string,
    dispatch: React.Dispatch<{ type: string, payload: videoInfoType | videoInfoType[] | string }>
}) => {
    const inputUploadRef = useRef<HTMLInputElement>(null)
    const [uploadLoading, setUploadLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fireStorageUpload = useCallback(async (storeRef: StorageReference,file:File)=>{
        return new Promise((resolve, reject)=>{
            const task=uploadBytesResumable(storeRef,file);
            task.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log('Upload is ' + progress + '% done');
                    setUploadProgress(progress);
                    if(progress===100){
                        setUploadProgress(0);
                        resolve("done");
                    }
                }, (error) => {
                    reject(error.message)
                }
            );
        })


    },[])
    const uploadVideoFunc=useCallback(async ()=>{
        try{
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
                await fireStorageUpload(storeRef,file);
                console.log("uploaded")
                const values={id: CurrDateTime, title: filename, description: "", tags: "", thumbNailUrl: "", filepath, thumbNailPath: "",rating: 0, editedBy: (userType==="editor")?editorEmail:""};
                await setDoc(doc(database, "creators" + "/" + creatorEmail + "/videos", CurrDateTime),values );
                dispatch({type: 'addVideo', payload: values})
                setUploadLoading(false);

            }
        }
        catch (e) {
            console.log("error in uploading file");
        }


    }, [creatorEmail, dispatch, editorEmail, fireStorageUpload, userType])

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

    return <>
        <input type={"file"} ref={inputUploadRef} hidden={true} disabled={uploadLoading} accept={"video/*"} multiple={false}/>
        <HoverCard>
            <HoverCardTrigger asChild>
                <Button onClick={() => inputUploadRef.current?.click()}
                            className={"w-32"}>{uploadLoading ? "Check Progress" : "Upload Video"}</Button>
            </HoverCardTrigger>
            <HoverCardContent>
                <Progress value={uploadProgress} className="w-full"/>
            </HoverCardContent>
        </HoverCard>
    </>
})