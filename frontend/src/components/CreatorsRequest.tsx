import {memo, useCallback, useEffect, useState} from "react";
import {collection, getDocs} from "firebase/firestore";
import {database} from "@/utilities/firebaseconf.ts";
import {toast} from "sonner";
import {ChatPanel} from "@/components/ChatPanel.tsx";

export const CreatorsRequest=memo(({editorEmail}:{editorEmail:string})=>{
    const [creators,setCreators]=useState<string[]>([]);
    const getCreatorsRequests=useCallback(async ()=>{
        const docs=await getDocs(collection(database, "editors/" + editorEmail + "/CreatorsRequest"));
        const tempDocs:string[]=[];
        docs.forEach((doc)=>{
            tempDocs.push(doc.id);
        })
        setCreators(tempDocs);
    },[editorEmail])
    useEffect(() => {
        getCreatorsRequests().catch(()=>{
            toast("Error in fetching creators Request.", {
                action: {
                    label: "Close",
                    onClick: () => console.log("Close"),
                },
            })
        })
    }, [getCreatorsRequests]);
    return <>
        <div className={"bg-gray-400 rounded-md p-2 font-bold mt-2 mb-1"}>
            Request from Editors
        </div>
        <div className={"flex flex-wrap gap-4 items-center"}>
            {creators.map((value,index)=>{
                return <div key={index} className={"p-2 border-2 rounded-xl"}>{value} - <ChatPanel
                    fromUser={editorEmail} toUser={value} requestEditor={false}/></div>
            })}
        </div>

    </>
})