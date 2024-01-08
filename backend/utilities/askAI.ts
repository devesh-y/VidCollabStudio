import  {GoogleGenerativeAI} from "@google/generative-ai"

const genAI= new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string)
export const getTitleDescription=async (content:string)=>{
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro"});
        const promt=`I am providing some info about a video that i want to upload on Youtube, I want you to give me a very good video Title and Description. Remember the length of title and description should be something which is best for youtube algo.DONT WRITE ANYTHING ELSE. JUST WRITE WHAT I SAID. The content is
           ${content}`
        const result = await model.generateContent(promt);
        const response =result.response;
        return response.text();

    }
    catch (e) {
        throw new Error("Error Occurred. Try Again.");
    }
}
