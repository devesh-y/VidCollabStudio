import {useNavigate, useSearchParams} from "react-router-dom";
import {useEffect} from "react";
import {TailSpin} from "react-loader-spinner";
import {SetCookie} from "../../utils/get_set_cookies.ts";
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

    return <div style={{display: "flex", justifyContent: "center",height:"100vh",alignItems:"center"}}>
        <TailSpin
            height="80"
            width="80"
            color="#4fa94d"
            ariaLabel="tail-spin-loading"
            radius="1"
            wrapperStyle={{}}
            wrapperClass=""
            visible={true}
        />
    </div>
}