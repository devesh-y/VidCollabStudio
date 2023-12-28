import "./AuthPage.css"
import {useNavigate} from "react-router-dom";
import {useCallback, useEffect, useState} from "react";
import {HandleEditorLogin} from "@/utils/HandleEditorLogin.ts";
import {FcGoogle} from "react-icons/fc";
import {GetCookie, SetCookie} from "@/utils/get_set_cookies.ts";
import { LuLoader2 } from "react-icons/lu";
import {doc, getDoc } from "firebase/firestore";
import {database} from "@/utils/firebaseconf.ts";

export const AuthPage = () => {
    const [ShowPage, setShowPage] = useState(false);
    const navigate = useNavigate();
    const [creatorVisible, setCreatorVisible] = useState(false);
    const EditorLoginFunc = useCallback(() => {
        setShowPage(false);
        HandleEditorLogin().then((res) => {
            const email = res as string;
            SetCookie(email, 'editor');
            navigate("/creator", {replace: true});

        }).catch((err) => {
            alert(err.message)
            setShowPage(true);
            console.log(err)
        })

    }, [navigate])
    const CreatorSignUpFunc = useCallback(() => {
        setShowPage(false);
        fetch(`${import.meta.env.VITE_BACKEND}` + '/getAuthUrl').then((res) => {
            return res.text();
        }).then((url) => {
            const a=document.createElement("a");
            a.href=url;
            a.click();
        }).catch(() => {
            alert("error occured. try again")
            setShowPage(true);
        })

    }, [])
    const CreatorSignInFunc=useCallback(()=>{
        setShowPage(false);
        HandleEditorLogin().then((res) => {
            const email=res as string;
            getDoc( doc(database,'creators',email)).then((snap)=>{
                if(!snap.exists()){
                    alert("account doesn't exist");
                    setShowPage(true);
                }
                else{
                    SetCookie(email, 'creator');
                    navigate("/creator", {replace: true});
                }
            })
        }).catch((err) => {
            alert(err.message)
            setShowPage(true);
            console.log(err)
        })
    },[navigate])
    useEffect(() => {
        if (GetCookie('creator') || GetCookie('editor')) {
            navigate("/creator", {replace: true});
        }
        else {
            setShowPage(true)
        }

    }, [navigate])
    return <div id={"AuthPage"}>

        {ShowPage ? <>
            <div id={"AuthPage-heading"}>
                Vid Collab Studio
            </div>

            <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                <i>Get Started as</i>
                <div style={{display: "flex", gap: "20px"}}>

                    <div className={"authpage-btn"} style={{backgroundColor: "salmon"}}
                         onClick={() => setCreatorVisible(true)}>
                        <strong>Creator</strong>
                    </div>
                    <div className={"authpage-btn"} style={{backgroundColor: "violet"}} onClick={EditorLoginFunc}>
                        <strong>Editor</strong>
                    </div>
                </div>

            </div>

            <div style={{display: "flex", gap: "20px", visibility: creatorVisible ? "visible" : "hidden"}}>
                <div className={"authpage-btn"} style={{backgroundColor: "skyblue"}} onClick={CreatorSignInFunc}>
                    <FcGoogle size={30}/>
                    <strong>Login With Google</strong>
                </div>
                <div className={"authpage-btn"} style={{backgroundColor: "black"}} onClick={CreatorSignUpFunc}>
                    <FcGoogle size={30}/>
                    <strong>Create Account</strong>
                </div>
            </div>

        </> :
            <LuLoader2 className={"animate-spin flex justify-center"} size={50}/>
        }

    </div>
}