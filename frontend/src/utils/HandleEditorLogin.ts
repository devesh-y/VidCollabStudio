import { firebaseAuth} from "./firebaseconf.ts";
import {GoogleAuthProvider,signInWithPopup} from "firebase/auth"


export const HandleEditorLogin=async () =>{
	try {
		const provider= new GoogleAuthProvider();
		const {user}= await signInWithPopup(firebaseAuth,provider);
		if(user.email  && user.emailVerified){
			return new Promise((resolve)=>{
				resolve(user.email);
			})
		}
		else{
			return new Promise((_res, reject)=>{
				reject(new Error("Error occurred at Email Verification"));
			})
		}

	}
	catch(err){
		return new Promise((_res, reject)=>{
			reject(new Error("Login Window Discarded"));
		})
	}
}
