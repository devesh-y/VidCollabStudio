import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {GetCookie} from "@/utilities/get_set_cookies.ts";
import {VideosPanel} from "@/components/VideosPanel.tsx";
import {Loader2} from "lucide-react";
import {MyEditor} from "@/components/MyEditor.tsx";
import {Toaster} from "@/components/ui/sonner.tsx";

export const CreatorPage=()=>{
    const [loading,setLoading]=useState(true);
    const [email,setEmail]=useState("");
    const navigate=useNavigate();
    useEffect(() => {
        const cookie=GetCookie('creator')
        if (cookie) {
            const {email}=JSON.parse(cookie);
            setLoading(false);
            setEmail(email as string)
        }
        else {
            navigate("/login", {replace: true});
        }

    }, [navigate])
    return !loading ?<>
                <div className={"p-2 rounded-2xl m-2 w-fit font-extrabold text-4xl bg-gray-400"} >
                    Vid Collab Studio
                </div>
                <MyEditor email={email}/>
                <VideosPanel creatorEmail={email} editorEmail={""}/>
                <Toaster/>

    </>:<div className={"h-svh flex justify-center items-center"}>
        <Loader2 className={"animate-spin w-4 h-4"}/>
    </div>



}