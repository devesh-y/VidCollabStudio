import express from  "express"
import cors from 'cors'
import {config} from "dotenv"
config();
import {Server} from "socket.io"
import http from "http";
import {router} from "./utilities/routes";
import {getTitleDescription} from "./utilities/askAI";
import {doc, arrayUnion, setDoc} from "firebase/firestore";
import {database} from "./utilities/firebaseConfiguration";
const app = express();

app.use(cors({
        origin: [`${process.env.VITE_WEBSITE}`],
        methods: ['GET', 'POST']
    }
))
const httpServer=http.createServer(app);
const io=new Server(httpServer,{
    cors: {
        origin: `${process.env.VITE_WEBSITE}`,
        methods: ["GET", "POST"]
    }
})
const socketEmailMapping=new Map<string,string>();
io.on("connection",(socket)=>{
    let currEmail="";
    socket.on("createMapping",(email)=>{
        socketEmailMapping.set(email,socket.id);
        currEmail=email;
    })
    socket.on("askTitleDescription",async (content:string)=>{
        try {
            const answer=await getTitleDescription(content);
            socket.emit("askTitleDescription",{answer});
        }catch (e){
            socket.emit("askTitleDescription",{error:(e as Error).message});
        }
    })
    socket.on("chat",({from,to,message,chatId}:{from:string,to:string,message:string,chatId:string})=>{
        const targetId=socketEmailMapping.get(to);
        if(targetId){
            socket.to(targetId).emit("chat",{from,message});
        }
        setDoc(doc(database,"chats",chatId),{
                chats:arrayUnion({from,to,message})
            },{
                merge:true
            }
        ).catch(()=>{
            console.log("error occurred while saving chats")
        })
    })
    socket.on("disconnect",()=>{
        if(currEmail!=="" && socketEmailMapping.get(currEmail)){
            socketEmailMapping.delete(currEmail);
        }
    })
})
app.use(express.json());

app.use(router)


httpServer.listen(process.env.PORT, () => {
    console.log("server is listening to", process.env.PORT)
})

