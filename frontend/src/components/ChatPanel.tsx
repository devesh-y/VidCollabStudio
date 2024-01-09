import {memo, useCallback, useEffect, useRef, useState} from "react";
import {Sheet, SheetContent, SheetTrigger} from "@/components/ui/sheet.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Input} from "@/components/ui/input.tsx";
import {socket} from "@/utilities/socketConnection.ts";
import {toast} from "sonner";


export const ChatPanel=memo(({fromUser,toUser}:{fromUser:string,toUser:string})=>{
    const chatRef=useRef<HTMLDivElement|null>(null)
    const [chats,setChats]=useState<{from:string,to:string,message:string}[]>([]);
    const [chatInput,setChatInput]=useState("");
    const getPreviousChats=useCallback(async ()=>{
        try{
            const emailConc=[fromUser,toUser];
            emailConc.sort();
            const chatId=emailConc[0]+emailConc[1];
            const response=await fetch(`${import.meta.env.VITE_BACKEND}/getPreviousChats`,{
                method:"POST",
                headers:{
                    "content-type":"application/json"
                },
                body:JSON.stringify({chatId})
            });
            const {chats,error}:{chats?:{from: string, to: string, message: string}[],error?:string}=await response.json();
            if(error){
                toast(error, {
                    action: {
                        label: "Close",
                        onClick: () => console.log("Close"),
                    },
                })
            }
            else if (chats){
                if(chatRef.current){
                    chatRef.current.scrollTop=chatRef.current.scrollHeight;
                }
                setChats(chats);
            }
        }
        catch (e){
            throw new Error("Error in fetching messages.");
        }


    },[fromUser, toUser])
    const sendMessage=useCallback((message:string)=>{
        message.trim();
        if(message!==""){
            const emailConc=[fromUser,toUser];
            emailConc.sort();
            const chatId=emailConc[0]+emailConc[1];
            socket.emit("chat",{from: fromUser,to:toUser,message,chatId})
            setChats([...chats,{from:fromUser,to:toUser,message}]);
            setChatInput("");
        }
    },[chats, fromUser, toUser])
    const getMessage=useCallback(({from,message}:{from:string,message:string})=>{
        if(toUser===from){
            setChats([...chats,{from,to:fromUser,message}]);
        }
    },[chats, fromUser, toUser])
    useEffect(() => {
        getPreviousChats().catch((e)=>{
            toast(e.message, {
                action: {
                    label: "Close",
                    onClick: () => console.log("Close"),
                },
            })
        })
    }, [getPreviousChats]);
    useEffect(() => {
        socket.on("chat",getMessage);
        return ()=>{
            socket.off("chat",getMessage);
        }
    }, [getMessage]);
    return <Sheet>
        <SheetTrigger asChild>
            <Button className={"bg-blue-600 hover:bg-blue-700"}>
                Chat
            </Button>
        </SheetTrigger>
        <SheetContent className={"flex flex-col gap-2"}>
            <div ref={chatRef} className={"flex-grow overflow-auto flex flex-col gap-1 pr-1"}>
                {
                    chats.map((chat,index)=>{
                        return <div key={index} className={`py-1 px-2 max-w-[70%] text-white rounded-lg ${chat.from===fromUser?"self-end bg-sky-500":"self-start bg-amber-500"}`}>
                            {chat.message}
                        </div>
                    })
                }
            </div>
            <Input type={"text"} placeholder="Type message"
                   value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(event) => {
                if (event.key === "Enter") {
                    sendMessage(chatInput);
                }
            }}/>
        </SheetContent>
    </Sheet>
})


