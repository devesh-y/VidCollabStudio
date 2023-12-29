import {useNavigate, useSearchParams} from "react-router-dom";
import {useEffect} from "react";
import { LuLoader2 } from "react-icons/lu";
import {SetCookie} from "@/utils/get_set_cookies.ts";
export const Oauth2callback=()=>{
    const navigate=useNavigate();
    const [searchParams]=useSearchParams();

    useEffect( () => {
        const code=searchParams.get('code');
        console.log(code)
        if(code){
            fetch(`${import.meta.env.VITE_BACKEND}`+`/oauth2callback?code=${code}`).then((response)=>{
                return response.text();
            }).then((email)=>{
                console.log(email);
                SetCookie(email,'creator');
                navigate('/creator',{state:email,replace:true})
            }).catch((err)=>{
                console.log(err)
                alert("credentials not provided by user")
                navigate("/login",{replace:true})
            })
        }

        const error=searchParams.get('error');
        if(error || !code){
            navigate("/login",{replace:true})
        }

    }, [navigate,searchParams]);

    return <div className={"flex justify-center"}><LuLoader2 className={"animate-spin"} size={50}/></div>
}