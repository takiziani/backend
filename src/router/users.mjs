import { Router } from "express";
import { user } from "../mongoose/schema/user.mjs";
const router = Router();

router.post("/api/usersregister", async (request, response) => {
    const { body } = request;
    const newuser = new user(body);
    try {
        const saveuser = await newuser.save();
        return response.status(201).send(saveuser);
    } catch (err) {
        console.log(err);
        return response.sendStatus(400);
    }
});


export default router