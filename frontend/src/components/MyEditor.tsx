import React, {memo, useCallback, useState} from "react";
import {doc, getDoc, updateDoc} from "firebase/firestore";
import {database} from "@/utilities/firebaseconf.ts";
import {Button} from "@/components/ui/button.tsx";
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger} from "@/components/ui/dialog.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Input} from "@/components/ui/input.tsx";
import {toast} from "sonner";

export const MyEditor=memo(({email,editor,setEditor}:{email:string,editor:string,setEditor: React.Dispatch<React.SetStateAction<string>>})=>{
   
    const [newEditor,setNewEditor]=useState("");

    const revokeEditor=useCallback(()=>{
        if(editor!==""){
            const currEditor=editor
            //remove from creator doc
            updateDoc(doc(database,'creators',email),{
                editor:""
            }).then(()=>{
                setEditor("");
            }).catch(()=>{
                setEditor(currEditor)
            })
            //remove from editor doc
            getDoc(doc(database,'editors',currEditor)).then((snap)=>{
                if(snap.exists()){
                    const creators:string[]=snap.data().creators;
                    const newCreators=creators.filter((value)=>{
                        return value!=email;
                    })
                    updateDoc(doc(database,"editors",currEditor),{
                        creators:newCreators
                    }).then(()=>{
                        console.log("revoked")
                    })

                }
            })
        }

    },[editor, email, setEditor])

    const addEditorFunc=useCallback(()=>{
        const emailRegex: RegExp = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        if(  newEditor==="" || !emailRegex.test(newEditor)){
            toast("Enter valid Email Address", {
                action: {
                    label: "Close",
                    onClick: () => console.log("Close"),
                },
            })
            return;
        }
        else{
            //add in the creator doc
            updateDoc(doc(database,'creators',email),{
                editor:newEditor
            }).then(()=>{
                setEditor(newEditor)
            })

            //add in the editor doc
            getDoc( doc(database,'editors',newEditor)).then((snap)=>{
                if(snap.exists()){
                    updateDoc(doc(database,"editors",newEditor),{
                        creators:[...(snap.data().creators),email]
                    }).then(()=>{
                        console.log("updated")
                    })
                }
            })
        }
    },[email, newEditor, setEditor])
    return <div className={"m-1 min-w-60 w-fit flex flex-col border-gray-200 border-2 rounded-md px-3 py-1  gap-1"}>
        <p className={"text-center text-xl font-bold bg-gray-100 rounded-lg"}>My Editor</p>
        <div className={"flex justify-center items-center gap-4"}>
            {editor===""?<Dialog>
                    <DialogTrigger asChild>
                        <Button className={"bg-emerald-400"}>Add Editor</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Allow access to editor</DialogTitle>
                        </DialogHeader>
                        <div className="flex items-center gap-4 ">
                            <Label htmlFor="name" >
                                Email:
                            </Label>
                            <Input  value={newEditor} onChange={(e)=>setNewEditor(e.target.value)}/>
                        </div>
                        <DialogFooter>
                            <Button type='submit' onClick={addEditorFunc}>
                                Save Changes
                            </Button>
                        </DialogFooter>

                    </DialogContent>
                </Dialog>:
                <>
                    <p>{editor}</p>
                    <Button variant={"destructive"} onClick={revokeEditor}>Revoke</Button>
                </>

            }
        </div>

    </div>
})