import {useNavigate} from "react-router-dom";
import {useCallback, useEffect, useState} from "react";
import {HandleEditorLogin} from "@/utilities/HandleEditorLogin.ts";
import {GetCookie, SetCookie} from "@/utilities/get_set_cookies.ts";
import { LuLoader2 } from "react-icons/lu";
import {Button} from "@/components/ui/button.tsx";

export const LoginPage = () => {
    const [ShowPage, setShowPage] = useState(false);
    const navigate = useNavigate();

    const EditorLoginFunc = useCallback(() => {
        setShowPage(false);
        HandleEditorLogin().then((res) => {
            const email = res as string;
            SetCookie(JSON.stringify({email,cookie:""}), 'editor');
            navigate("/editor", {replace: true});

        }).catch((err) => {
            alert(err.message)
            setShowPage(true);
            console.log(err)
        })

    }, [navigate])
    const CreatorSignUpFunc = useCallback(() => {
        setShowPage(false);
        fetch(`${import.meta.env.VITE_BACKEND}` + '/getAuthUrl').then((res) => {
            return res.json();
        }).then((output) => {
            const {authorizeUrl}=output;
            const a=document.createElement("a");
            a.href=authorizeUrl;
            a.click();
        }).catch(() => {
            alert("error occured. try again")
            setShowPage(true);
        })

    }, [])

    useEffect(() => {
        if (GetCookie('creator')) {
            navigate("/creator", {replace: true});
        }
        else if (GetCookie('editor')){
            navigate("/editor", {replace: true});
        }
        else {
            setShowPage(true)
        }

    }, [navigate])
    return <div className={"h-svh flex flex-col items-center justify-center gap-2"}>

        {ShowPage ? <>
            <div className={"p-4 rounded-2xl bg-gray-400 font-extrabold text-4xl"}>
                Vid Collab Studio
            </div>

            <div className={"flex flex-col items-center gap-2"}>
                <i>Get Started as</i>
                <div className={"flex gap-4"}>

                    <Button className={"bg-blue-600 font-bold"} onClick={CreatorSignUpFunc}>
                       Creator
                    </Button>
                    <Button className={"font-bold bg-emerald-400"} onClick={EditorLoginFunc}>
                        Editor
                    </Button>
                </div>

            </div>

        </> :
            <LuLoader2 className={"animate-spin"} size={50}/>
        }

    </div>
}