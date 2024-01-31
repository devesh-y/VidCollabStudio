import {collection, getDocs} from "firebase/firestore";
import {database} from "@/utilities/firebaseconf.ts";
export type videoInfoType ={
    filepath:string,
    id:string,
    title:string,
    description:string,
    tags:string,
    thumbNailUrl:string,
    thumbNailPath:string,
    rating:number;
    editedBy:string
}

export const getCreatorVideos=async (creatorEmail:string)=>{
    return new Promise( (resolve)=>{
        const videos: videoInfoType[] = [];
        getDocs(collection(database, "creators" + "/" + creatorEmail + "/videos")).then((docs)=>{
            docs.forEach((doc) => {
                videos.push({id: doc.id, title: doc.data().title, description: doc.data().description, tags: doc.data().tags, thumbNailUrl: doc.data().thumbNailUrl, filepath: doc.data().filepath, thumbNailPath: doc.data().thumbNailPath,editedBy:doc.data().editedBy,rating:doc.data().rating
                });
            })
            resolve(videos);
        })

    })

}