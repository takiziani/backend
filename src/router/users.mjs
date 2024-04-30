import { Router } from "express";
import { user } from "../mongoose/schema/user.mjs";
import cors from "cors"
import passport from "../strategies/localstrat.mjs";
import session from "express-session";
import cookieParser from "cookie-parser";
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        // If the user is not authenticated, send a 401 Unauthorized response
        res.status(401).json({ message: 'Unauthorized' });
    }
}
const router = Router();

router.use(cors())

router.use(cookieParser())

router.use(session({
    secret: "tk14",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60000 * 60 * 24
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

router.post("/api/userlogin", passport.authenticate("local"),
    (request, response) => {
        console.log(request.session);
        response.send("you are logged in");
    });
router.post("/api/userlogout", (request, response) => {
    if (!request.user) return response.sendStatus(401);
    request.logout((err) => {
        if (err) return response.sendStatus(400);
        response.send(200);
    });
})
router.patch("/api/user/itiscompany", ensureAuthenticated, async (request, response) => {
    const { body } = request;
    const userId = request.user._id;
    const companyuser = await user.findOne({ _id: userId });
    companyuser.company.itis = true;
    companyuser.company.companyname = body;
    await companyuser.save();
});
router.patch("/api/user/itisemploye", ensureAuthenticated, async (request, response) => {
    const { body } = request;
    const userId = request.user._id;
    const employeuser = await user.findOne({ _id: userId });
    employeuser.employe.itis = true;
    employeuser.employe.employefullname = body.employename;
    await employeuser.save();
});
export default router