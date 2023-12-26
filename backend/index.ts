import express from  "express"
import cors from 'cors'
import {google} from "googleapis"
import { OAuth2Client } from "google-auth-library";
import {doc, setDoc,getDoc, updateDoc } from "firebase/firestore";
import {database, fireStorage} from "./utils/firebaseconf";
import {getMetadata, getStream, ref } from "firebase/storage";

const app = express();

app.use(cors({
        origin: [`${process.env.VITE_WEBSITE}`],
        methods: ['GET', 'POST']
    }
))
app.use(express.json());
const client_id = process.env.VITE_CLIENT_ID;
const client_secret = process.env.VITE_CLIENT_SECRET;
const redirect_url = process.env.VITE_REDIRECT_URL;

const oAuth2Client = new OAuth2Client(client_id, client_secret, redirect_url);
const scopes = [
    //readonly to be added in future
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/userinfo.profile', 'email', 'https://www.googleapis.com/auth/youtubepartner', 'https://www.googleapis.com/auth/youtube', 'https://www.googleapis.com/auth/youtube.force-ssl'
];


app.get('/getAuthUrl', (_req, res) => {
    const authorizeUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt:"consent"
    });
    res.send(authorizeUrl);
})
app.get('/oauth2callback', async (req, res) => {
    const {code} = req.query;

    const {tokens} = await oAuth2Client.getToken(code as string);
    // Make sure to set the credentials on the OAuth2 client.
    const {access_token, refresh_token} = tokens
    console.log("access token= ", access_token);
    console.log("refresh token= ", refresh_token);

    oAuth2Client.setCredentials(tokens);
    const userouth = google.oauth2({
        version: 'v2',
        auth: oAuth2Client
    })

    userouth.userinfo.get((err, response) => {
        if (err) {
            res.send(new Error("error occured"));
        } else if (response && response.data.email) {
            const email = response.data.email;
            res.send(email);
            getDoc(doc(database, 'creators', email)).then((snap) => {
                if (!snap.exists()) {
                    setDoc(doc(database, 'creators', email), {access_token, refresh_token, editors: []});
                } else {
                    updateDoc(doc(database, 'creators', email), {access_token, refresh_token});
                }
            }).catch((err) => {
                console.log(err)

            })
        } else {
            res.send(new Error("error occured"));
        }

    })

})

app.post('/uploadVideo', (req:express.Request, res:express.Response) => {
    const {id, email} = req.body;
    console.log(id, email);
    getDoc(doc(database, 'creators/' + email + "/videos", id)).then(async (snap) => {
        if (snap.exists()) {
            const {filepath, title, description, tags} = snap.data();
            const tagsarray = tags.split(',');
            uploadVideo(title, description, tagsarray, email, filepath).then((data) => {
                res.send(data);
            }).catch((err) => {
                res.status(400).send(JSON.stringify({error:err}));
            })

        }
        else{
            res.status(404).send(JSON.stringify({error:"video not found"}));
        }
    }).catch(() => {
        res.status(404).send(`{error:"error in getting data from database"}`);
    })

})

app.listen(process.env.PORT, () => {
    console.log("server is listening to ", process.env.PORT)
})

const uploadVideo = async (title: string, description: string, tags: string[], email: string, filepath: string)=>{

    return new Promise( (resolve,reject)=>{

        getDoc( doc(database,'creators',email)).then(async (snap)=> {
            if (snap.exists()) {
                const {access_token,refresh_token} = snap.data();
                let progress=0;
                const currauth=new OAuth2Client({
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
                    reject("error in uploading the stream");
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
                            privacyStatus: "private"
                        },
                    },
                    media: {
                        body: stream,
                    },
                }, async function(err, response) {
                    if (err) {
                        console.log('The API returned an error: ' + err);
                        reject(err);
                        return;
                    }
                    else{
                        if(response){
                            console.log(response.data)
                            resolve("video uploaded successfully")
                        }
                        else{
                            reject("error in getting uploaded video id")
                        }
                    }
                });
            }
        }).catch(()=>{
            reject("error in getting data from database")
        })



    })

}