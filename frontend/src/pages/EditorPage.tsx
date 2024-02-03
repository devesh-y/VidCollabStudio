import {useCallback, useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {GetCookie} from "@/utilities/get_set_cookies.ts";
import {VideosPanel} from "@/components/VideosPanel.tsx";
import {Loader2} from "lucide-react";
import {doc, getDoc} from "firebase/firestore";
import {database} from "@/utilities/firebaseconf.ts";
import {Button} from "@/components/ui/button.tsx";
import {socket} from "@/utilities/socketConnection.ts";
import {CreatorsRequest} from "@/components/CreatorsRequest.tsx";

export const EditorPage=()=>{
    const [loading,setLoading]=useState(true);
    const [email,setEmail]=useState("");
    const navigate=useNavigate();
    const [creators,setCreators]=useState<string[]>([])
    const [currentCreator,setCurrentCreator]=useState("");
    const retrieveCreators=useCallback(async (email:string)=>{
        return new Promise((resolve)=>{
            getDoc(doc(database,"editors",email)).then((snap)=>{
                if(snap.exists()){
                    resolve(snap.data().creators);
                }
            })
        })

    },[])
    useEffect(() => {
        const cookie=GetCookie('editor')
        if (cookie) {
            const {email}=JSON.parse(cookie);
            socket.on("connect",()=>{
                socket.emit("createMapping",email);
            })
            retrieveCreators(email).then((data)=>{
                setCreators(data as string[]);
                setLoading(false);
                setEmail(email as string)
            })

        }
        else {
            navigate("/login", {replace: true});
        }

    }, [navigate, retrieveCreators])
    
    return !loading ?<>
        <div className={"p-2 rounded-2xl m-2 w-fit font-extrabold text-4xl bg-gray-400"} >
            Vid Collab Studio
        </div>
        <div className={"m-1 py-1 px-2 border-2 border-gray-200 rounded-lg flex flex-col gap-1"}>
            <p className={"text-center w-fit p-1 text-xl font-bold rounded-md bg-gray-200 mx-auto"}>Creators</p>
            {creators.length === 0 ? <p className={"text-center"}>No Creators has allowed access yet.</p> : <div className={"flex flex-wrap gap-2"}>
                {creators.map((email, index) => {
                    return <Button key={index} onClick={()=>setCurrentCreator(email)}>
                        {email}
                    </Button>
                })}
            </div>}

        </div>
        {currentCreator != "" ?
            <VideosPanel creatorEmail={currentCreator} editorEmail={email} userType={"editor"}/> : <></>}
        <div className={"m-1"}>
            <CreatorsRequest editorEmail={email}/>
        </div>


    </> : <div className={"h-svh flex justify-center items-center"}>
        <Loader2 className={"animate-spin w-10 h-10"}/>
    </div>
}