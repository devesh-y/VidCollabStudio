import {memo, useCallback, useState} from "react";
import {Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger} from "@/components/ui/sheet.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Loader2, Star} from "lucide-react";
import {Input} from "@/components/ui/input.tsx";
import {toast} from "sonner";
import ReactMarkdown from 'react-markdown';

export const AskAI=memo(()=>{
    const [inputQues,setInputQues]=useState("");
    const [allowQues,setAllowQues]=useState(true);
    const askAnswer=useCallback(()=>{
        setInputQues("");
        setAllowQues(false);
        if(inputQues!==""){
            fetch(`${import.meta.env.VITE_BACKEND}/askTitleDescription`,{
                method:"POST",
                headers:{
                    "content-type":"application/json"
                },
                body:JSON.stringify({content:inputQues})
            }).then(res=>{
                return res.json();
            }).then(({error,answer}:{error?:string,answer?:string})=>{
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
            }).catch(()=>{
                toast("Bad Request", {
                    action: {
                        label: "Close",
                        onClick: () => console.log("Close"),
                    },
                })
            })

        }
    },[inputQues])

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
                {!allowQues?<Loader2 className={"animate-spin"}/>:<ReactMarkdown>{aiAnswer}</ReactMarkdown>}
            </div>
        </SheetContent>
    </Sheet>
})