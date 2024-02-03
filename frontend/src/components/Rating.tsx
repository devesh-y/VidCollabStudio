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
import {doc, getDoc, updateDoc} from "firebase/firestore";
import {database} from "@/utilities/firebaseconf.ts";

export const Rating=memo(({video,dispatch,creatorEmail}:{dispatch:  React.Dispatch<{type: string, payload: videoInfoType | videoInfoType[] | string}>,video:videoInfoType,creatorEmail:string})=>{
    const [ratingValue,setRatingValue]=useState(video.rating);
    const updateRatingFunc=useCallback(async ()=>{
        if(ratingValue!==0){
            try{

                const editedBy=video.editedBy;
                const currRating=ratingValue;
                const prevRating=video.rating;
                const id=video.id;

                const tempRating=currRating-prevRating;
                const tempPeople=(prevRating===0)?1:0;
                const pr1=getDoc(doc(database,"editors",editedBy))
                const pr2=updateDoc(doc(database, 'creators/' + creatorEmail + "/videos",id), {rating:currRating})
                const response=await Promise.all([pr1,pr2]);
                if(response[0].exists()){
                    await updateDoc(doc(database,"editors",editedBy),{
                        rating:response[0].data().rating+tempRating,
                        people:response[0].data().people+tempPeople
                    })
                    toast("Rating updated.", {
                        action: {
                            label: "Close",
                            onClick: () => console.log("Close"),
                        },
                    })
                    dispatch({type:"updateVideoInfo",payload: {...video,rating:ratingValue} })
                }

            }
            catch (e) {
                toast("Rating update failed.", {
                    action: {
                        label: "Close",
                        onClick: () => console.log("Close"),
                    },
                })
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