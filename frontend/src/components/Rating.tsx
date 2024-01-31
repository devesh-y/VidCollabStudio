import React, {memo, useCallback, useState} from "react";
import {Star} from "lucide-react";
import {
    Dialog, DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog.tsx";
import {Button} from "@/components/ui/button.tsx";
import {videoInfoType} from "@/utilities/getCreatorVideos.ts";
import {toast} from "sonner";

export const Rating=memo(({video,dispatch,creatorEmail}:{dispatch:  React.Dispatch<{type: string, payload: videoInfoType | videoInfoType[] | string}>,video:videoInfoType,creatorEmail:string})=>{
    const [ratingValue,setRatingValue]=useState(video.rating);
    const updateRatingFunc=useCallback(async ()=>{
        if(ratingValue!==0){
            try{
                const response=await fetch(`${import.meta.env.VITE_BACKEND}`+"/updateRating",{
                    method:"POST",
                    headers:{
                        "content-type":"application/json"
                    },
                    body:JSON.stringify({creatorEmail,id:video.id,editedBy:video.editedBy,currRating:ratingValue,prevRating:video.rating})
                })
                const res=await response.json();
                if(res.error){
                    toast("Rating update failed.", {
                        action: {
                            label: "Close",
                            onClick: () => console.log("Close"),
                        },
                    })
                    console.log(res.error)
                }
                else{
                    toast("Rating updated.", {
                        action: {
                            label: "Close",
                            onClick: () => console.log("Close"),
                        },
                    })
                    console.log(res.message)
                    dispatch({type:"updateVideoInfo",payload: {...video,rating:ratingValue} })
                }
            }
            catch (e) {
                console.log(e)
            }
        }
    },[creatorEmail, dispatch, ratingValue, video])
    const arr=[1,2,3,4,5];
    return <Dialog>
        <DialogTrigger asChild>
            <Button variant="secondary" className={"bg-amber-500"}>Rating</Button>
        </DialogTrigger>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Rate this Edited video</DialogTitle>
            </DialogHeader>
            <div className={"flex justify-center gap-2"}>
                {arr.map((value, index) => {
                    return <Star key={index} fill={value <= ratingValue ? "orange" : "white"}
                                 onClick={() => setRatingValue(value)}/>
                })}

            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="submit" onClick={updateRatingFunc}>Save changes</Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    </Dialog>


})