import {useCallback, useEffect, useState} from "react";
import {GetCookie} from "@/utils/get_set_cookies.ts";
import {useNavigate} from "react-router-dom";
import {collection, doc, getDoc, getDocs, setDoc} from "firebase/firestore";
import {database} from "@/utils/firebaseconf.ts";
import {EditorPanel} from "./EditorPanel.tsx";
import {VideosPanel} from "./VideosPanel.tsx";
export type videoInfo={
    filepath:string,
    id:string,
    title:string,
    description:string,
    tags:string,
    thumbNailUrl:string,
    thumbNailPath:string
}
export const CreatorHomePage=()=>{
    const [editorEmailLogin,setEditorEmailLogin]=useState("");
    const [email,setEmail]=useState("");
    const [loading,setLoading]=useState(true);
    const [videos,setVideos]=useState<videoInfo[]>([]);
    const [editors,setEditors]=useState<string[]>([]);
    const navigate=useNavigate()

    const RetrieveData=useCallback(()=>{
        if(email!=""){
            const videos=getDocs(collection(database,"creators"+"/"+email+"/videos"));
            const editors=getDoc( doc(database,'creators',email))
            Promise.all([videos,editors]).then((values)=>{
                const tempvideos:videoInfo[]=[];
                values[0].forEach((doc)=>{

                    tempvideos.push({id:doc.id,title:doc.data().title,description:doc.data().description,tags:doc.data().tags,thumbNailUrl:doc.data().thumbNailUrl,filepath:doc.data().filepath,thumbNailPath:doc.data().thumbNailPath});
                })
                setVideos(tempvideos)
                if(editorEmailLogin==""){
                    if(values[1].exists()){
                        const {editors}=values[1].data();
                        setEditors(editors);
                    }
                }

                setLoading(false)
            })
        }else{
            setLoading(false)
        }


    },[editorEmailLogin, email])
    useEffect(() => {
        const email=GetCookie('creator')
        const email2=GetCookie('editor');
        if (email) {
            setEmail(email);
            RetrieveData();
        }
        else if(email2){
            setEditorEmailLogin(email2);
            getDoc( doc(database,'editors',email2)).then((snap)=>{
                if(!snap.exists()){
                    setDoc(doc(database, 'editors',email2), {creator:""}).then(()=>{
                        RetrieveData();
                    });

                }
                else{
                    setEmail(snap.data().creator);
                    RetrieveData();
                }
            })

        }
        else {
            navigate("/login", {replace: true});
        }

    }, [RetrieveData, navigate])
    return <>
            <div style={{padding: "5px", borderRadius: "15px", backgroundColor: "#e5e591", fontSize: "2em", color: "#053081", fontWeight: 800, width: "fit-content", margin: "10px"}}>
                Vid Collab Studio
            </div>
            <div style={{display: "table", overflow: "auto", width: "100%", borderSpacing: "10px"}}>
                <div style={{display: "table-row"}}>
                    <VideosPanel videos={videos} email={email} setVideos={setVideos} editorEmailLogin={editorEmailLogin} loading={loading}/>
                    {editorEmailLogin==""?<EditorPanel editors={editors} setEditors={setEditors} email={email} />:<></>}

                </div>
            </div>
        </>
}