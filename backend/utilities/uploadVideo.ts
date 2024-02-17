import { fireStorage} from "./firebaseConfiguration";
import {google} from "googleapis";
import {getMetadata, getStream, ref} from "firebase/storage";
import { OAuth2Client } from "google-auth-library";

export const uploadVideo = async (title: string, description: string, tags: string[], filepath: string, ytAuth: OAuth2Client):Promise<string> =>{
    try {
        let progress=0;

        const {size}=await getMetadata(ref(fireStorage,filepath));

        return new Promise((resolve, reject)=>{
            const stream=getStream(ref(fireStorage,filepath));
            stream.on("data",(chunk)=>{
                progress+=chunk.length;
                console.log("uploaded", (progress*100)/size );
            })
            const service = google.youtube('v3')
            service.videos.insert({
                auth: ytAuth,
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
            }, async function (err, response) {
                if (err) {
                    console.log('The API returned an error: ' + err);
                    reject("error in uploading video")

                } else {
                    if (response) {
                        console.log(response.data);
                        resolve(response.data.id as string)
                    }
                    else {
                        reject("error in getting uploaded video id")
                    }
                }
            });
        })

    }
    catch (e) {
        throw "error in getting file size from database";
    }



}