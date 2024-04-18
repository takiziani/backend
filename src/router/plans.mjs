import { Router } from "express";
import { plan } from "../mongoose/schema/plan.mjs";
import run from "../utils/gemini.mjs";

const router = Router();
router.post("/api/plan", async (request, response) => {
    const { body } = request;
    console.log(body);
    const tasks = await run(body.goal);
    console.log(` this are the tasks${tasks}`);
    try {
        const newplan = new plan();
        newplan.tasks = tasks;
        newplan.user = body.user;
        newplan.goal = body.goal;
        const saveplan = await newplan.save();
        return response.status(201).send(saveplan);
    } catch (err) {
        console.log(err);
        return response.sendStatus(400);
    }
});
export default router;