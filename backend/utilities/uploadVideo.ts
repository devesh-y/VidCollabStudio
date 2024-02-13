import { fireStorage} from "./firebaseConfiguration";
import {google} from "googleapis";
import {getMetadata, getStream, ref} from "firebase/storage";

export const uploadVideo = async (title: string, description: string, tags: string[], filepath: string,access_token:string,refresh_token:string)=>{
    try {
        let progress=0;
        const currauth=new google.auth.OAuth2({
            credentials:{
                access_token,refresh_token
            }
        })
        const {size}=await getMetadata(ref(fireStorage,filepath));

        return new Promise((resolve, reject)=>{
            const stream=getStream(ref(fireStorage,filepath));
            stream.on("data",(chunk)=>{
                progress+=chunk.length;
                console.log("uploaded", (progress*100)/size );
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
            }, async function (err, response) {
                if (err) {
                    console.log('The API returned an error: ' + err);
                    reject(err.message)

                } else {
                    if (response) {
                        console.log(response.data);
                        resolve("video uploaded successfully")
                    } else {
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