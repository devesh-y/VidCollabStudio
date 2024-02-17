import {memo, useCallback, useEffect, useState} from "react";
import {ChatPanel} from "@/components/ChatPanel.tsx";
import {collection, getDocs} from "firebase/firestore";
import {database} from "@/utilities/firebaseconf.ts";
import {toast} from "sonner";
import {Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow} from "./ui/table";
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

        editors.sort((a,b)=>{
            return b.rating/((b.people)?(b.people):1)-a.rating / ((a.people)?(a.people):1)
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
        <Table className={"max-w-3xl"}>
            <TableCaption>A list of top Editors.</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead className={"text-center"}>Rating</TableHead>
                    <TableHead className={"text-center"}>Edits</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {editors.map((value) => (
                    <TableRow key={value.email} >
                        <TableCell className="font-medium ">{value.email} <ChatPanel fromUser={creatorEmail} toUser={value.email} requestEditor={true}/></TableCell>
                        <TableCell className={"text-center"}>{value.rating / (value.people === 0 ? 1 : value.people)}</TableCell>
                        <TableCell className={"text-center"}>{value.people}</TableCell>
                    </TableRow>
                ))}
            </TableBody>

        </Table>


    </div>
})