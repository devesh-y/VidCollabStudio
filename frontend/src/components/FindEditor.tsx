import {memo, useCallback, useEffect, useState} from "react";
import {ChatPanel} from "@/components/ChatPanel.tsx";
import {collection, getDocs} from "firebase/firestore";
import {database} from "@/utilities/firebaseconf.ts";
import {toast} from "sonner";
type EditorInfo={
    email:string,
    people:number,
    rating:number
}
export const FindEditor=memo(({creatorEmail}:{creatorEmail:string})=>{
    const [editors,setEditors]=useState<EditorInfo[]>([]);
    const getEditors=useCallback(async () => {
        const editors:EditorInfo[]=[];
        const docs=await getDocs(collection(database, "editors"));
        docs.forEach((doc) => {
            editors.push({email:doc.id,rating:doc.data().rating,people:doc.data().people})
        })
        setEditors(editors as EditorInfo[])

    },[])
    useEffect(() => {
        getEditors().catch(()=>{
            toast("Rating update failed.", {
                action: {
                    label: "Close",
                    onClick: () => console.log("Close"),
                },
            })
        })
    }, [getEditors]);
    return <div>
        <div className={"bg-gray-400 rounded-md p-2 font-bold mt-2 mb-1"}>
            Get Editors
        </div>
        <div className={"rounded-md overflow-hidden border-2"}>
            <table className={" w-full "}>
                <thead>
                <tr className={"text-gray-500 border-2 "}>
                    <th className={"p-1"}>Email</th>
                    <th className={"p-1"}> Rating</th>
                    <th className={"p-1"}>Edits</th>
                </tr>
                </thead>
                <tbody>
                {editors.map((value, index) => {
                    return <tr key={index} className={"text-center border-2"}>
                        <td className={"p-1"}>{value.email} <ChatPanel fromUser={creatorEmail} toUser={value.email} requestEditor={true}/></td>
                        <td>{value.rating / (value.people === 0 ? 1 : value.people)}</td>
                        <td>{value.people}</td>
                    </tr>
                })}

                </tbody>


            </table>
        </div>

    </div>
})