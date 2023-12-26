import React, {memo, useCallback, useState} from "react";
import {doc, getDoc, setDoc, updateDoc} from "firebase/firestore";
import {database} from "../../utils/firebaseconf.ts";
import {Button, Dialog, Flex, Text, TextField} from "@radix-ui/themes";

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
                    setDoc(doc(database, 'editors',addeditor), {creator:email});
                }
                else{
                    updateDoc(doc(database, 'editors',addeditor), {creator:email});
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
        <Dialog.Root>
            <Dialog.Trigger>
                <div style={{
                    cursor:"default",
                    backgroundColor: "green",
                    padding: "5px",
                    borderRadius: "10px",
                    marginBottom: "10px",
                    fontWeight: "800",
                    color: "white",
                    width: "fit-content"
                }} >Add Editor
                </div>
            </Dialog.Trigger>

            <Dialog.Content style={{maxWidth: 450}}>
                <Dialog.Title>Update Editors Panel</Dialog.Title>
                <Dialog.Description size="2" mb="4">
                    Allow access to editors
                </Dialog.Description>

                <Flex direction="column" gap="3">
                    <label>
                        <Text as="div" size="2" mb="1" weight="bold">
                            Email
                        </Text>
                        <TextField.Input placeholder="Enter editor email address"  value={addeditor} onChange={(e)=>setaddeditor(e.target.value)}/>
                    </label>
                </Flex>
                <Flex gap="3" mt="4" justify="end">
                    <Dialog.Close>
                        <Button onClick={addeditorfunc}>Update</Button>
                    </Dialog.Close>
                </Flex>
            </Dialog.Content>
        </Dialog.Root>

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