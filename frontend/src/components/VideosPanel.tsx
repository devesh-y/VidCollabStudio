import { memo, useCallback, useEffect, useReducer, useRef, useState} from "react";
import {SHA256} from "crypto-js";
import { ref, uploadBytesResumable} from "firebase/storage";
import {database, fireStorage} from "@/utilities/firebaseconf.ts";
import { doc, getDoc, setDoc} from "firebase/firestore";
import {LuLoader2} from "react-icons/lu";
import {Button} from "@/components/ui/button.tsx";
import {getCreatorVideos, videoInfoType} from "@/utilities/getCreatorVideos.ts";
import {VideoComp} from "@/components/VideoComp.tsx";
import {AskAI} from "@/components/AskAI.tsx";
import {ChatPanel} from "@/components/ChatPanel.tsx";
import {FindEditor} from "@/components/FindEditor.tsx";

export const VideosPanel = memo(({creatorEmail, userType, editorEmail}: {
    creatorEmail: string,
    editorEmail: string,
    userType: string
}) => {
    const [loading, setLoading] = useState(true);
    const videosReducer = useCallback( (state: videoInfoType[], action: { type: string, payload: videoInfoType| videoInfoType[]|string }):videoInfoType[] => {
        switch (action.type) {
            case 'setVideos': {
                return action.payload as videoInfoType[];
            }
            case 'addVideo': {
                return [...state, action.payload as videoInfoType];
            }
            case 'updateVideoInfo': {
                const temp:videoInfoType[] = JSON.parse(JSON.stringify(state));
                let index=-1;
                for(let i=0;i<temp.length;i++){
                    if(temp[i].id===(action.payload as videoInfoType).id){
                        index=i;
                        break;
                    }
                }
                if(index!=-1)
                {
                    temp[index]=(action.payload as videoInfoType);
                    return temp;
                }
                else{
                    return state;
                }
             
            }
            case 'deleteVideo':{
                return state.filter((value)=>{
                    return value.id!=(action.payload as string);
                })
            }
            default:{
                return state;
            }
        }

    }, [])
    const [videos, dispatch] = useReducer(videosReducer, [] as videoInfoType[]);
    const [uploadLoading, setUploadLoading] = useState(false);

    useEffect(() => {
        getCreatorVideos(creatorEmail).then((videos) => {
            dispatch({type: "setVideos", payload: videos as videoInfoType[]})
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
                const values={id: CurrDateTime, title: filename, description: "", tags: "", thumbNailUrl: "", filepath, thumbNailPath: "",rating: 0, editedBy: (editorEmail)?editorEmail:""};
                await setDoc(doc(database, "creators" + "/" + creatorEmail + "/videos", CurrDateTime),values );
                dispatch({type: 'addVideo', payload: values})
                setUploadLoading(false);
            }
            catch (err) {
                console.log("error in uploading file");
            }
        }

    }, [creatorEmail, editorEmail])

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
            <Button onClick={() => inputUploadRef.current?.click()} disabled={uploadLoading}
                    className={"w-32"}>{uploadLoading ? "Uploading" : "Upload Video"}</Button>
            {userType === "creator" ? <AskAI/> : <></>}

            {userType==="editor"?<ChatPanel fromUser={editorEmail} toUser={creatorEmail} requestEditor={false}/>:editorEmail!==""?<ChatPanel fromUser={creatorEmail} toUser={editorEmail} requestEditor={false}/>:<></>}


        </div>


        <div className={"bg-gray-400 rounded-md p-2 font-bold mb-1"}>Creator Videos</div>

        {loading?<div className={"flex justify-center"}><LuLoader2 className={"animate-spin"} size={50}/></div>:
            <div className={"flex flex-col gap-4"}>
                {videos.map((value, index) => {
                            return <VideoComp key={index} video={value} creatorEmail={creatorEmail} dispatch={dispatch} userType={userType}/>})
                        }
                </div>
        }

        {
            userType === "creator" ? <FindEditor creatorEmail={creatorEmail}/> : <></>
        }


    </div>
})