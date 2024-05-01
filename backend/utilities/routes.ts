
import express, {Router} from "express"
import {google} from "googleapis";
import { doc, getDoc, setDoc, updateDoc} from "firebase/firestore";
import {database} from "./firebaseConfiguration";
import {uploadVideo} from "./uploadVideo";
import {getTitleDescription} from "./askAI";
import {uploadThumbnail} from "./uploadThumbnail";
export type videoInfoType ={
    filepath:string,
    fileUrl:string,
    id:string,
    title:string,
    description:string,
    tags:string,
    thumbNailUrl:string,
    thumbNailPath:string,
    rating:number,
    editedBy:string,
    youtubeId:string
}
export const router=Router();
const client_id = process.env.VITE_CLIENT_ID;
const client_secret = process.env.VITE_CLIENT_SECRET;
const redirect_url = process.env.VITE_REDIRECT_URL;

const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_url);
const scopes = [
    //readonly to be added in future
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/userinfo.email',
    // 'https://www.googleapis.com/auth/userinfo.profile',  'https://www.googleapis.com/auth/youtubepartner',
    // 'https://www.googleapis.com/auth/youtube',
    // 'https://www.googleapis.com/auth/youtube.force-ssl'
];


router.get('/getAuthUrl', (_req, res) => {
    const authorizeUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        include_granted_scopes: true
    });
    res.send(JSON.stringify({authorizeUrl}));
})

router.post('/getEmail', async (req, res) => {
    const {code} = req.body;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_url);
    const {tokens} = await oAuth2Client.getToken(code as string);

    if(!(tokens.scope && tokens.scope.includes('https://www.googleapis.com/auth/youtube.upload'))){
        res.send(JSON.stringify({"error":"Youtube upload permissions not provided by the user. Try Again."}));
        return;
    }

    const {access_token, refresh_token} = tokens

    oAuth2Client.setCredentials(tokens);
    const userAuth = google.oauth2({
        version: 'v2',
        auth: oAuth2Client
    })

    userAuth.userinfo.get((err, response) => {
        if (err) {
            res.send(JSON.stringify({"error":"error occurred while fetching email address"}));
        } else if (response && response.data.email) {
            const email = response.data.email;
            res.send(JSON.stringify({email}));
            getDoc(doc(database, 'creators', email)).then((snap) => {
                if (!snap.exists()) {
                    setDoc(doc(database, 'creators', email), {access_token, refresh_token,editor:""});
                } else {
                    updateDoc(doc(database, 'creators', email), {access_token});
                }
            }).catch((err) => {
                console.log(err)
            })
        }

    })

})

router.post('/uploadVideo', async(req:express.Request, res:express.Response) => {
    try {
        const {id, email} = req.body;
        console.log(id, email);
        const snap=await getDoc(doc(database, 'creators/' + email + "/videos", id));
        if (snap.exists()) {
            const {filepath, title, description, tags,thumbNailPath,youtubeId} = snap.data() as videoInfoType;
            const tagsArray = tags.split(',');
            const docSnap=await getDoc( doc(database,'creators',email))
            if(docSnap.exists()){
                const {refresh_token}=docSnap.data();

                //refresh the access token
                const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_url);
                oAuth2Client.setCredentials({
                    refresh_token
                })
                const {credentials}=await oAuth2Client.refreshAccessToken();

                await updateDoc(doc(database,"creators",email),{
                    access_token:credentials.access_token,
                    refresh_token:credentials.refresh_token
                })
                const ytAuth=new google.auth.OAuth2({
                    credentials
                })
                let videoId=youtubeId;
                if(!videoId){
                    videoId=await uploadVideo(title, description, tagsArray, filepath,ytAuth)
                }
                if(!youtubeId){
                    await updateDoc(doc(database, 'creators/' + email + "/videos", id), {youtubeId:videoId});
                }
                if(thumbNailPath){
                    await uploadThumbnail(ytAuth,videoId,thumbNailPath);
                }


                res.status(200).send(JSON.stringify({data:"video uploaded successfully"}));
            }
            else{
                res.status(404).send(JSON.stringify({error:"doc not found"}));
            }
        }
        else{
            res.status(404).send(JSON.stringify({error:"video not found"}));
        }

    }
    catch (err) {
        res.status(501).send(JSON.stringify({error:(err as Error).message}));
    }


})
router.post("/askTitleDescription",async (req,res)=>{
    try {
        const {content}=req.body;
        const answer=await getTitleDescription(content);
        res.status(200).send(JSON.stringify({answer}))
    }catch (e){
        res.status(501).send(JSON.stringify({error:(e as Error).message}))
    }
})

router.all("*",(_req,res)=>{
    res.status(404).send("route not found")
})