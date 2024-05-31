import { Router, request, response, text } from "express";
import { user } from "../mongoose/schema/user.mjs";
import { plan } from "../mongoose/schema/plan.mjs";
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
        const users = await user.find({ company: { $ne: true } }).sort({ points: -1 }).select("username image rank speciality points phonenumber email progresse").exec();
        return response.send({ users });
    } else {
        const users = await user.find({ company: { $ne: true } }).sort({ points: -1 }).select("username image rank speciality points progresse").exec();
        return response.send({ users });
    }
});
router.get("/api/user", ensureAuthenticated, async (request, response) => {
    const userId = request.user._id;
    const newuser = await user.findById(userId).select("-password").exec();
    return response.send(newuser);
});
router.get("/api/user/:id", ensureAuthenticated, async (request, response) => {
    const userId = request.params.id;
    const newuser = await user.findById(userId).select("-password").exec();
    // let totaltasks = 0;
    // for (let i = 0; i < newuser.plans.length; i++) {
    //     const newplan = await plan.findById(newuser.plans[i]);
    //     if (newplan.tasks.length > 0) {
    //         totaltasks = totaltasks + newplan.tasks.length;
    //     }
    // }
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
// get tasks by month
router.get("/api/plan/tasks/:month", ensureAuthenticated, async (request, response) => {
    const { month } = request.params;
    const userId = request.user._id;
    let monthtasks = [];
    let secess = 0;
    let failure = 0;
    let tasks;
    const newuser = await user.findById(userId);
    for (let i = 0; i < newuser.plans.length; i++) {
        const newplan = await plan.findById(newuser.plans[i]);
        if (newplan.tasks.length > 0) {
            tasks = newplan.tasks.filter((task) => new Date(task.date).getMonth() == month - 1);
        }
        else {
            console.log(`Plan with id ${newuser.plans[i]} not found`);
        }
        for (let c = 0; c < tasks.length; c++) {
            monthtasks.push(tasks[c]);
        }
    }
    for (let j = 0; j < monthtasks.length; j++) {
        if (monthtasks[j].status === true) {
            secess = secess + 1;
        }
        else if (new Date(monthtasks[j].date) < new Date() && monthtasks[j].status === false) {
            failure = failure + 1;
        }
    }
    const totaltasks = monthtasks.length;
    // const progress = Math.round((sec / totaltasks) * 100);
    // const failurerate = Math.round((failure / totaltasks) * 100);
    return response.status(200).send({ monthtasks, secess, failure, totaltasks });
});
// get total tasks
router.get("/api/plan/totaltasks", ensureAuthenticated, async (request, response) => {
    const userid = request.user._id
    const newuser = await user.findById(userid);
    let totaltasks = 0;
    for (let i = 0; i < newuser.plans.length; i++) {
        const newplan = await plan.findById(newuser.plans[i]);
        if (newplan.tasks.length > 0) {
            totaltasks = totaltasks + newplan.tasks.length;
        }
    }
    return response.send({ totaltasks });
});
// get today tasks
router.get("/api/plan/todaytasks", ensureAuthenticated, async (request, response) => {
    const userid = request.user._id
    const newuser = await user.findById(userid);
    let todaytasks = [];
    for (let i = 0; i < newuser.plans.length; i++) {
        const newplan = await plan.findById(newuser.plans[i]);
        if (newplan.tasks.length > 0) {
            const tasks = newplan.tasks.filter((task) => new Date(task.date).toDateString() === new Date().toDateString());
            for (let c = 0; c < tasks.length; c++) {
                todaytasks.push(tasks[c]);
            }
        }
    }
    return response.send(todaytasks);
});
// get week tasks
router.get("/api/plan/weektasks", ensureAuthenticated, async (request, response) => {
    const userid = request.user._id
    const newuser = await user.findById(userid);
    let weektasks = [];
    let secess = 0;
    let failure = 0;
    for (let i = 0; i < newuser.plans.length; i++) {
        const newplan = await plan.findById(newuser.plans[i]);
        if (newplan.tasks.length > 0) {
            const tasks = newplan.tasks.filter((task) => new Date(task.date) >= new Date(new Date().setDate(new Date().getDate() - 7)) && new Date(task.date) <= new Date());
            for (let c = 0; c < tasks.length; c++) {
                weektasks.push(tasks[c]);
            }
        }
    }
    for (let j = 0; j < weektasks.length; j++) {
        if (weektasks[j].status === true) {
            secess = secess + 1;
        }
        else if (new Date(weektasks[j].date) < new Date() && weektasks[j].status === false) {
            failure = failure + 1;
        }
    }
    const totaltasks = weektasks.length;
    return response.send({ weektasks, secess, failure, totaltasks });
});
// totaltasks and secess of each month
router.get("/api/plan/year", ensureAuthenticated, async (request, response) => {
    const userid = request.user._id
    const newuser = await user.findById(userid);
    let month1 = 0;
    let monthtasks = [];
    let yearstat = [];
    let secess = 0;
    let tasks;
    for (let m = 1; m <= 12; m++) {
        for (let i = 0; i < newuser.plans.length; i++) {
            const newplan = await plan.findById(newuser.plans[i]);
            if (newplan.tasks.length > 0) {
                tasks = newplan.tasks.filter((task) => new Date(task.date).getMonth() == m - 1);
                for (let c = 0; c < tasks.length; c++) {
                    monthtasks.push(tasks[c]);
                }
            }
            else {
                console.log(`Plan with id ${newuser.plans[i]} not found`);
            }
        }
        for (let j = 0; j < monthtasks.length; j++) {
            if (monthtasks[j].status === true) {
                secess = secess + 1;
            }
        }
        yearstat.push({ month: m, totaltasks: monthtasks.length, secess: secess });
        monthtasks = [];
    }
    return response.send(yearstat);
});
export default router