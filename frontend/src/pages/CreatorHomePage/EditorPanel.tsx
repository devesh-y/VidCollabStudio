import React, {memo, useCallback, useState} from "react";
import {doc, getDoc, setDoc, updateDoc} from "firebase/firestore";
import {database} from "@/utils/firebaseconf.ts";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import {Input} from "@/components/ui/input.tsx";
import {Label} from "@/components/ui/label.tsx";
export const EditorPanel = memo(({editors,setEditors,email}:{editors:string[],setEditors: React.Dispatch<React.SetStateAction<string[]>>,email:string}) => {
    const [addeditor,setaddeditor]=useState("");
    const addeditorfunc=useCallback(()=>{
        if(addeditor==""){
            return;
        }
        const emailRegex: RegExp = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        if(  addeditor!="" && !emailRegex.test(addeditor)){
            alert("wrong email address");
            return;
        }
        else{
            //add in the creator doc
            const prev=editors;
            setEditors([...editors,addeditor]);
            updateDoc(doc(database,'creators',email),{
                editors:[...editors,addeditor]
            }).catch(()=>{
                setEditors(prev)
            })

            //add in the editor doc
            getDoc( doc(database,'editors',addeditor)).then((snap)=>{
                if(!snap.exists()){
                    setDoc(doc(database, 'editors',addeditor), {creator:email}).catch(()=>{
                        console.log("failed to add");
                    });
                }
                else{
                    updateDoc(doc(database, 'editors',addeditor), {creator:email}).catch(()=>{
                        console.log("failed to add");
                    })
                }
            })
        }
    },[addeditor, editors, email, setEditors])
    const revokeFunc=useCallback((removeemail:string)=>{
        const prev=editors;
        const newEditors=editors.filter((value)=>{
            return value!=removeemail;
        })
        setEditors(newEditors);
        //remove from creator doc
        updateDoc(doc(database,'creators',email),{
            editors:newEditors
        }).catch(()=>{
            setEditors(prev)
        })
        //remove from editor doc
        updateDoc(doc(database,'editors',removeemail),{
            creator:""
        }).catch(()=>{

        })



    },[editors, email, setEditors])
    return <div style={{display: "table-cell", minWidth: "300px", width: "300px", backgroundColor: "#d6d6e7", borderRadius: "10px", padding: "10px"}}>
        <Dialog>
            <DialogTrigger>
                <div style={{cursor: "default", backgroundColor: "green", padding: "5px", borderRadius: "10px", marginBottom: "10px", fontWeight: "800", color: "white", width: "fit-content"
                }}>Add Editor
                </div>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Update Editors Panel</DialogTitle>
                    <DialogDescription>
                        Allow access to editors
                    </DialogDescription>
                </DialogHeader>

                <div className="flex items-center gap-4 py-4">
                    <Label htmlFor="name" >
                        Email:
                    </Label>
                    <Input  value={addeditor} onChange={(e)=>setaddeditor(e.target.value)}/>
                </div>
                <DialogFooter className="sm:justify-end">
                    <DialogClose>
                        <Button type="button" variant="default" onClick={addeditorfunc}>
                            Update
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>


        <div style={{
            backgroundColor: "skyblue",
            padding: "5px",
            borderRadius: "10px",
            marginBottom: "10px",
            fontWeight: "800"
        }}>Editors</div>
        <div style={{display: "flex", flexDirection: "column", gap: "10px"}}>
            {editors.map((value, index) => {
                return <div key={index} style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                    <div style={{width: "190px", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis"}}
                         title={value}>
                        {value}
                    </div>
                    <div style={{width: "70px", backgroundColor: "red", borderRadius: "10px", padding: "5px", cursor: "default"}} onClick={() => revokeFunc(value)}>Revoke
                    </div>
                </div>
            })}
        </div>
    </div>
})