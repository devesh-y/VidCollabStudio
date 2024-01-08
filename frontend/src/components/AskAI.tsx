import {memo, useCallback, useEffect, useState} from "react";
import {Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger} from "@/components/ui/sheet.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Loader2, Star} from "lucide-react";
import {Input} from "@/components/ui/input.tsx";
import {socket} from "@/utilities/socketConnection.ts";
import {toast} from "sonner";


export const AskAI=memo(()=>{
    const [inputQues,setInputQues]=useState("");
    const [allowQues,setAllowQues]=useState(true);
    const getAnswerFunc=useCallback(({error,answer}:{error?:string,answer?:string})=>{
        if(error){
            toast("Error Occurred. Try Again.", {
                action: {
                    label: "Close",
                    onClick: () => console.log("Close"),
                },
            })
        }
        else if(answer){
            setAiAnswer(answer);
        }
        setAllowQues(true);
    },[])
    const askAnswer=useCallback(()=>{
        if(inputQues!==""){
            socket.emit("askTitleDescription",inputQues);
            setInputQues("");
            setAllowQues(false);
        }
    },[inputQues])
    useEffect(()=>{
         socket.on("askTitleDescription",getAnswerFunc)
        return ()=>{
             socket.off("askTitleDescription",getAnswerFunc)
        }
    })
    const [aiAnswer,setAiAnswer]=useState("");
    return <Sheet>
        <SheetTrigger asChild>
            <Button className={"bg-fuchsia-600 hover:bg-fuchsia-700"}>
                <Star className={"animate-spin"}/>
                <p>AI Features</p>
            </Button>
        </SheetTrigger>
        <SheetContent className={"overflow-auto"}>
            <SheetHeader>
                <SheetTitle>Use AI to get the Video Description and Title</SheetTitle>
            </SheetHeader>
            <Input disabled={!allowQues} placeholder={"Enter some info about your Video"} className={"my-1"} value={inputQues} onChange={(e)=>setInputQues(e.target.value)}/>
            <Button className={"bg-fuchsia-600"} onClick={askAnswer}>
                Generate
            </Button>
            <div>
                {!allowQues?<Loader2 className={"animate-spin"}/>:<p>{aiAnswer}</p>}
            </div>
        </SheetContent>
    </Sheet>
})