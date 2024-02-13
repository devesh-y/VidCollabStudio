
import express, {Router} from "express"
import {google} from "googleapis";
import { doc, getDoc, setDoc, updateDoc} from "firebase/firestore";
import {database} from "./firebaseConfiguration";
import {uploadVideo} from "./uploadVideo";
import {getTitleDescription} from "./askAI";
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
    const userouth = google.oauth2({
        version: 'v2',
        auth: oAuth2Client
    })

    userouth.userinfo.get((err, response) => {
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

router.post('/uploadVideo', (req:express.Request, res:express.Response) => {
    const {id, email} = req.body;
    console.log(id, email);
    getDoc(doc(database, 'creators/' + email + "/videos", id)).then(async (snap) => {
        if (snap.exists()) {
            const {filepath, title, description, tags} = snap.data();
            const tagsarray = tags.split(',');
            getDoc( doc(database,'creators',email)).then(async (snap)=>{
                if(snap.exists()){
                    const {refresh_token}=snap.data();

                    //refresh the access token
                    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_url);
                    oAuth2Client.setCredentials({
                        refresh_token
                    })
                    const {credentials}=await oAuth2Client.refreshAccessToken();

                    updateDoc(doc(database,"creators",email),{
                        access_token:credentials.access_token,
                        refresh_token:credentials.refresh_token
                    }).then(()=>{
                        uploadVideo(title, description, tagsarray, filepath,credentials.access_token as string,credentials.refresh_token as string).then((data) => {
                            res.status(200).send(JSON.stringify({data}));
                        }).catch((err) => {
                            res.status(501).send(JSON.stringify({error:err}));
                        })
                    })


                }
            })


        }
        else{
            res.status(404).send(JSON.stringify({error:"video not found"}));
        }
    }).catch(() => {
        res.status(404).send(`{error:"error in getting data from database"}`);
    })

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