import { GoogleGenerativeAI } from "@google/generative-ai";

// const { GoogleGenerativeAI } = require("@google/generative-ai");
import dotenv from 'dotenv';
dotenv.config();
// require('dotenv').config()
// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

async function run(gaol) {
    // For text-only input, use the gemini-pro model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const chat = model.startChat({
        history: [
        ],
        generationConfig: {
            maxOutputTokens: 500,
            temperature: 0.1,
        },
    });

    const msg = `you are a planner ,give a plan to achive ${gaol}  ,the plan should be in the form of tasks,important :the output should be in a single line with this symbole $ to indicate the end of a task ,don't write titels and subtitels and dont write which day is the task just write the tasks in order and dont write anything else,write 10 tasks.`;
    const result = await chat.sendMessage(msg);
    const response = await result.response;
    const text = response.text();
    console.log(text);
    const tasks = text.split("$");
    return tasks;
}
export default run;