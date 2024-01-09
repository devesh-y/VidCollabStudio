import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {GetCookie} from "@/utilities/get_set_cookies.ts";
import {VideosPanel} from "@/components/VideosPanel.tsx";
import {Loader2} from "lucide-react";
import {MyEditor} from "@/components/MyEditor.tsx";
import {Toaster} from "@/components/ui/sonner.tsx";
import {socket} from "@/utilities/socketConnection.ts";
import {doc, getDoc} from "firebase/firestore";
import {database} from "@/utilities/firebaseconf.ts";

export const CreatorPage=()=>{
    const [loading,setLoading]=useState(true);
    const [email,setEmail]=useState("");
    const [editor,setEditor]=useState("");
    const navigate=useNavigate();
    useEffect(() => {
        const cookie=GetCookie('creator')
        if (cookie) {
            const {email}=JSON.parse(cookie);
            setEmail(email as string)
            getDoc(doc(database,"creators",email)).then((snap)=>{
                if(snap.exists()){
                    setEditor(snap.data().editor as string);
                }
                setLoading(false);
            })
            socket.on("connect",()=>{
                socket.emit("createMapping",email);
            })
        }
        else {
            navigate("/login", {replace: true});
        }

    }, [navigate])

    return !loading ?<>
                <div className={"p-2 rounded-2xl m-2 w-fit font-extrabold text-4xl bg-gray-400"} >
                    Vid Collab Studio
                </div>
                <MyEditor email={email} editor={editor} setEditor={setEditor}/>
                <VideosPanel creatorEmail={email} editorEmail={editor} userType={"creator"}/>
                <Toaster/>

    </>:<div className={"h-svh flex justify-center items-center"}>
        <Loader2 className={"animate-spin w-4 h-4"}/>
    </div>



}