import { Router } from "express";
import { plan } from "../mongoose/schema/plan.mjs";
import run from "../utils/gemini.mjs";

// Middleware to check if the user is authenticated
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        // If the user is not authenticated, send a 401 Unauthorized response
        res.status(401).json({ message: 'Unauthorized' });
    }
}

const router = Router();
router.post("/api/plan", ensureAuthenticated, async (request, response) => {
    // The user is authenticated, so req.user should be defined
    const userId = request.user._id;
    const { body } = request;
    console.log(body);
    let tasks;
    let tasksobject;
    while (true) {
        try {
            tasks = await run(body.goal, body.duration);
            tasksobject = JSON.parse(tasks);
            break;
        } catch (error) {
            if (error instanceof SyntaxError && error.message.includes("JSON")) {
                console.error(error);
                console.log("An error occurred. Retrying...");
            } else {
                throw error; // re-throw the error if it's not a JSON parsing error
            }
        }
    }
    try {
        const newplan = new plan();
        newplan.tasks = tasksobject.tasks;
        newplan.user = userId;
        newplan.goal = body.goal;
        const saveplan = await newplan.save();
        return response.status(201).send(saveplan);
    } catch (err) {
        console.log(err);
        return response.sendStatus(400);
    }
});
router.get("/api/plan", ensureAuthenticated, async (request, response) => {
    const userId = request.user._id;
    const plans = await plan.find({ user: userId });
    return response.status(200).send(plans);
});
router.get("/api/plan/:id", ensureAuthenticated, async (request, response) => {
    const { id } = request.params;
    const userId = request.user._id;
    const plans = await plan.findOne({ _id: id, user: userId });
    return response.status(200).send(plans);
});
router.delete("/api/plan/:id", ensureAuthenticated, async (request, response) => {
    const { id } = request.params;
    const userId = request.user._id;
    const plans = await plan.findOneAndDelete({ _id: id, user: userId });
    return response.status(200).send(plans);
});
// redo the plan
router.patch("/api/plan/redo/:id", ensureAuthenticated, async (request, response) => {
    const { id } = request.params;
    const userId = request.user._id;
    let newtasks = [];
    const plans = await plan.findOne({ _id: id, user: userId });
    let tasks = await run(plans.goal)
    for (let i = 0; i < tasks.length; i++) {
        const task = {
            task: tasks[i],
            status: false,
            date: new Date()
        };
        newtasks.push(task);
    }
    plans.tasks = newtasks;
    await plans.save();
    return response.status(200).send(plans);
})
// task done
router.patch("/api/plan/:id/taskdone/:taskid/", ensureAuthenticated, async (request, response) => {
    const { id, taskid } = request.params;
    const userId = request.user._id;
    const { status } = request.body;
    const plans = await plan.findOne({ _id: id, user: userId });
    const user = await user.findOne({ _id: userId })
    plans.tasks.id(taskid).status = true;
    user.progresse += 1;
    await plans.save();
    await user.save();
    return response.status(200).send(plans);
});
// task undone
router.patch("/api/plan/:id/taskundone/:taskid/", ensureAuthenticated, async (request, response) => {
    const { id, taskid } = request.params;
    const userId = request.user._id;
    const { status } = request.body;
    const plans = await plan.findOne({ _id: id, user: userId });
    plans.tasks.id(taskid).status = false;
    await plans.save();
    return response.status(200).send(plans);
});
//delete task
router.delete("/api/plan/:id/taskdelete/:taskid/", ensureAuthenticated, async (request, response) => {
    const { id, taskid } = request.params;
    const userId = request.user._id;
    const { status } = request.body;
    const plans = await plan.findOneAndDelete({ _id: id, user: userId });
    return response.status(200).send("itsdeleted");
});
// edit task
router.patch("/api/plan/:id/taskedit/:taskid/", ensureAuthenticated, async (request, response) => {
    const { id, taskid } = request.params;
    const userId = request.user._id;
    const { task } = request.body;
    const plans = await plan.findOne({ _id: id, user: userId });
    plans.tasks.id(taskid).task = task;
    await plans.save();
    return response.status(200).send(plans);
});
// add task
router.patch("/api/plan/:id/taskadd/", ensureAuthenticated, async (request, response) => {
    const { id } = request.params;
    const userId = request.user._id;
    const { task } = request.body;
    const plans = await plan.findOne({ _id: id, user: userId });
    const newtask = {
        task: task,
        status: false,
        date: new Date()
    };
    plans.tasks.push(newtask);
    await plans.save();
    return response.status(200).send(plans);
});
export default router;