import { fireStorage} from "./firebaseConfiguration";
import {google} from "googleapis";
import {getMetadata, getStream, ref} from "firebase/storage";

export const uploadVideo = async (title: string, description: string, tags: string[], email: string, filepath: string,access_token:string,refresh_token:string)=>{
    try {
        let progress=0;
        const currauth=new google.auth.OAuth2({
            credentials:{
                access_token,refresh_token
            }
        })
        const {size}=await getMetadata(ref(fireStorage,filepath));
        const stream=getStream(ref(fireStorage,filepath));
        stream.on("data",(chunk)=>{
            progress+=chunk.length;
            console.log("uploaded", (progress*100)/size );
        })
        stream.on("error",()=>{
            throw new Error("error in uploading the stream");
        })
        const service = google.youtube('v3')
        service.videos.insert({
            auth: currauth,
            part: ['snippet','status'],
            requestBody: {
                snippet: {
                    title,
                    description,
                    tags,
                    defaultLanguage: 'en',
                    defaultAudioLanguage: 'en'
                },
                status: {
                    privacyStatus: "public"
                },
            },
            media: {
                body: stream,
            },
        }, async function(err, response) {
            if (err) {
                console.log('The API returned an error: ' + err);
                throw new Error(err.message);

            }
            else{
                if(response){
                    console.log(response.data)
                    return "video uploaded successfully"

                }
                else{
                    return new Error("error in getting uploaded video id")
                }
            }
        });
    }
    catch (e) {
        return new Error("error in uploading video from server")
    }



}