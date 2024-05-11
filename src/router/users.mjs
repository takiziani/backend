import { Router, request, response } from "express";
import { user } from "../mongoose/schema/user.mjs";
import passport from "../strategies/localstrat.mjs";
import session from "express-session";
import cookieParser from "cookie-parser";
import { hashPassword } from "../utils/helper.mjs";
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
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
async function calculateUserRank(userId) {
    // Retrieve all users and sort them by points in descending order
    const users = await user.find({}).sort({ points: -1 }).exec();

    // Find the index of the user in the sorted list
    const userIndex = users.findIndex(u => u._id.toString() === userId);

    // Return the user's rank (index in the sorted list + 1)
    return userIndex + 1;
}
const router = Router();


router.use(cookieParser())

router.use(session({
    secret: "tk14",
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60000 * 60 * 24,
        sameSite: true,
        secure: false//put true if you are using https
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
    response.send({ requestuser: nuser });
});

router.post("/api/userlogout", (request, response) => {
    if (!request.user) return response.sendStatus(401);
    request.logout((err) => {
        if (err) return response.sendStatus(400);
        response.clearCookie('connect.sid'); // Delete the session cookie
        response.send(200);
    });
});
// update user
router.patch("/api/user", ensureAuthenticated, async (request, response) => {
    const { body } = request;
    const userId = request.user._id;
    const updateuser = await user.findOneAndUpdate({ _id: userId }, body, { new: true });
    return response.send(updateuser);
});
/*router.patch("/api/user/itiscompany", ensureAuthenticated, async (request, response) => {
    const { body } = request;
    const userId = request.user._id;
    const cname = body.companyname;
    const companyuser = await user.findOne({ _id: userId });
    companyuser.company = true;
    const saveuser = await companyuser.save();
    return response.send("you are a company")
});*/
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
        const users = await user.find({}).sort({ points: -1 }).select("-password").exec();
        return response.send({ users });
    } else {
        const users = await user.find({}).sort({ points: -1 }).select("-password").select("-phonenumber").select("-email").exec();
        return response.send({ users });
    }
});
export default router