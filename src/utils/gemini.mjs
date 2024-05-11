import {
    GoogleGenerativeAI, HarmCategory, HarmBlockThreshold
} from "@google/generative-ai";

// const { GoogleGenerativeAI } = require("@google/generative-ai");
import dotenv from 'dotenv';
dotenv.config();
// require('dotenv').config()
// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

async function run(gaol, duration) {
    let today = new Date();
    let year = today.getFullYear();
    let month = today.getMonth() + 1;
    let day = today.getDate();
    // For text-only input, use the gemini-pro model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
    const generationConfig = {
        temperature: 0.5,
        topK: 0,
        topP: 0.95,
        maxOutputTokens: 8192,
        response_mime_type: "application/json",
    };
    const safetySettings = [
        {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
    ];
    const chat = model.startChat({
        generationConfig,
        safetySettings,
        history: [
        ],
    });

    //const msg = `you are a planner , today is ${year}-${month}-${day},give a plan to achive the gaol of "${gaol}" in this time frame :"${duration}" days,the plan should be in the form of tasks a task for every day of the time frame ,important :responde in a json format like this {"tasks:["task":"",date:"",point:""]},note that the date here is the due date of the task,the point are based on how hard the task is chose form 1 to a 100,the task number for the first task will be 1 for the scond it will be 2 until the last it will be ${duration}, it is very importante to responde in a json format`;
    const msg = `give me a plan to achive the goal of ${gaol} in this time frame ${duration} ,the plan should be in the form of tasks with one task for every day of the time frame,it is important that the json fllow this format:{["task":"",date:"",point:""]},note that the date here is the due date of the task,the point are based on how hard the task is chose form 1 to a 100.it will be today is ${year}/${month}/${day}`
    while (true) {
        try {
            const result = await chat.sendMessage(msg);
            const response = await result.response;
            let text = response.text();
            console.log(JSON.parse(text));
            return text;
        } catch (error) {
            console.log(error);
            console.log("An error occurred. Retrying...");
        }
    }
}
export default run;