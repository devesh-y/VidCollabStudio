import { memo, useCallback, useEffect, useReducer, useState} from "react";
import {LuLoader2} from "react-icons/lu";
import {getCreatorVideos, videoInfoType} from "@/utilities/getCreatorVideos.ts";
import {Video} from "@/components/Video.tsx";
import {AskAI} from "@/components/AskAI.tsx";
import {ChatPanel} from "@/components/ChatPanel.tsx";
import {FindEditor} from "@/components/FindEditor.tsx";
import {UploadFile} from "@/components/UploadFile.tsx";

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

    useEffect(() => {
        getCreatorVideos(creatorEmail).then((videos) => {
            dispatch({type: "setVideos", payload: videos as videoInfoType[]})
            setLoading(false)
        })
    }, [creatorEmail])


    return <div className={"m-1"}>
        <div className={"flex items-center mb-1 gap-2"}>
            <UploadFile userType={userType} creatorEmail={creatorEmail} editorEmail={editorEmail} dispatch={dispatch}/>
            {userType === "creator" ? <AskAI/> : <></>}

            {userType==="editor"?<ChatPanel fromUser={editorEmail} toUser={creatorEmail} requestEditor={false}/>:editorEmail!==""?<ChatPanel fromUser={creatorEmail} toUser={editorEmail} requestEditor={false}/>:<></>}


        </div>


        <div className={"bg-gray-400 rounded-md p-2 font-bold mb-1"}>Creator Videos</div>

        {loading?<div className={"flex justify-center"}><LuLoader2 className={"animate-spin"} size={50}/></div>:
            <div className={"flex flex-col gap-4"}>
                {videos.map((value, index) => {
                            return <Video key={index} video={value} creatorEmail={creatorEmail} dispatch={dispatch} userType={userType}/>})
                        }
                </div>
        }

        {
            userType === "creator" ? <FindEditor creatorEmail={creatorEmail}/> : <></>
        }


    </div>
})