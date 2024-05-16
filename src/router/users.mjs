import { Router, request, response, text } from "express";
import { user } from "../mongoose/schema/user.mjs";
import passport from "../strategies/localstrat.mjs";
import session from "express-session";
import MongoStore from "connect-mongo";
import cookieParser from "cookie-parser";
import { hashPassword } from "../utils/helper.mjs";
import dotenv from 'dotenv';
import { comparePassword } from "../utils/helper.mjs";
dotenv.config();
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        console.log(req.session)
        // If the user is not authenticated, send a 401 Unauthorized response
        res.status(401).json({ message: 'Unauthorized' });
    }
}
function ensureCompany(req, res, next) {
    if (req.user.company) {
        return next();
    } else {
        // If the user is not authenticated, send a 401 Unauthorized response
        res.status(401).json({ message: 'Unauthorized' });
    }
}
const router = Router();


router.use(cookieParser())

router.use(session({
    secret: "tk14",
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: process.env.database }),
    cookie: {
        maxAge: 60000 * 60 * 24,
        secure: process.env.NODE_ENV === 'production', // Secure in production
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' // None in production, lax otherwise
    }
}));
router.use(passport.initialize());
router.use(passport.session());
router.post("/api/userregister", async (request, response) => {
    const { body } = request;
    body.password = hashPassword(body.password);
    console.log(body);
    const newuser = new user(body);
    try {
        const saveuser = await newuser.save();
        return response.status(201).send(saveuser);
    } catch (err) {
        console.log(err);
        return response.sendStatus(400);
    }
});
router.post("/api/userlogin", passport.authenticate("local"), async (request, response) => {
    if (!request.user) return response.send({ message: "You are not logged in" })
    const nuser = await user.findById(request.user._id).select('-password');
    console.log(request.session);
    response.send({ msg: "you are logged in", requestuser: nuser, });
});

router.post("/api/userlogout", (request, response) => {
    if (!request.user) return response.sendStatus(401);
    request.logout((err) => {
        if (err) return response.sendStatus(400);
        response.clearCookie('connect.sid'); // Delete the session cookie
        response.sendStatus(200);
    });
});
// update user
router.patch("/api/user", ensureAuthenticated, async (request, response) => {
    const { body } = request;
    const userId = request.user._id;
    const updateuser = await user.findOneAndUpdate({ _id: userId }, body, { new: true }).select("-password").exec();
    return response.send(updateuser);
});
router.patch("/api/user/itiscompany", ensureAuthenticated, async (request, response) => {
    const { body } = request;
    const userId = request.user._id;
    const cname = body.companyname;
    const companyuser = await user.findOne({ _id: userId });
    companyuser.company = true;
    const saveuser = await companyuser.save();
    return response.send("you are a company");
});
router.patch("/api/user/itisemploye", ensureAuthenticated, async (request, response) => {
    const { body } = request;
    const userId = request.user._id;
    const fullname = body.fullname;
    const employeuser = await user.findOne({ _id: userId });
    employeuser.employe = true;
    employeuser.employefullname = fullname;
    const saveuser = await employeuser.save();
    return response.send("you are an employe")
});
router.get("/api/usersRank", ensureAuthenticated, async (request, response) => {
    if (request.user.company) {
        console.log("company");
        const users = await user.find({ company: { $ne: true } }).sort({ points: -1 }).select("-password").exec();
        return response.send({ users });
    } else {
        const users = await user.find({ company: { $ne: true } }).sort({ points: -1 }).select("-password").select("-phonenumber").select("-email").exec();
        return response.send({ users });
    }
});
router.get("/api/user/:id", ensureAuthenticated, async (request, response) => {
    const userId = request.params.id;
    const newuser = await user.findById(userId).select("-password").exec();
    return response.send(newuser);
});
router.patch("/api/user/changepassword", ensureAuthenticated, async (request, response) => {
    const { body } = request;
    const userId = request.user._id;
    const newuser = await user.findById(userId);
    if (!comparePassword(body.currentpassword, newuser.password)) throw new Error("bad credentials");
    newuser.password = hashPassword(body.newpassword);
    const saveuser = await newuser.save();
    return response.send("password changed");
});
router.delete("/api/user", ensureAuthenticated, async (request, response) => {
    const userId = request.user._id;
    const deleteuser = await user.findOneAndDelete({ _id: userId });
});
router.patch("/api/user/fav/:id", ensureAuthenticated, ensureCompany, async (request, response) => {
    const userId = request.user._id;
    const { id } = request.params;
    const newuser = await user.findById(userId).select("-password");
    newuser.companyfav.push(id);
    const saveuser = await newuser.save();
    return response.send(saveuser);
});
router.patch("/api/user/unfav/:id", ensureAuthenticated, ensureCompany, async (request, response) => {
    const userId = request.user._id;
    const { id } = request.params;
    const newuser = await user.findById(userId).select("-password");
    newuser.companyfav.pull(id);
    const saveuser = await newuser.save();
    return response.send(saveuser);
});
router.get("/api/usercompany/favorites", ensureAuthenticated, ensureCompany, async (request, response) => {
    const userId = request.user._id;
    const newuser = await user.findById(userId).select("-password");
    const favs = await user.find({ _id: { $in: newuser.companyfav } }).select("-password").exec();
    return response.send(favs);
});
export default router