import { Router } from "express";
import { user } from "../mongoose/schema/user.mjs";
import cors from "cors"
import Passport from "../strategies/localstrat.mjs";
import session from "express-session";
import passport from "passport";
import cookieParser from "cookie-parser";
const router = Router();

router.use(cors({ origin: 'http://192.168.128.177:5173' }))

router.use(cookieParser())

router.use(session({
    secret: "tk14",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60000 * 60 * 24,
    }
}));

router.use(passport.initialize());

router.use(passport.session());

router.post("/api/userregister", cors(), async (request, response) => {
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

router.post("/api/userlogin", passport.authenticate("local",
    { successRedirect: "", failureRedirect: "/api/userlogin", },),
    (request, response) => {
        response.send("you are logged in");
    });
router.post("/api/userlogout", (request, response) => {
    if (!request.user) return response.sendStatus(401);
    request.logout((err) => {
        if (err) return response.sendStatus(400);
        response.send(200);
    });
})

export default router