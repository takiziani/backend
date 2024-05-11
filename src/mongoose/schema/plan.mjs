import mongoose from "mongoose";
const taskSchema = new mongoose.Schema({
    task: {
        required: false,
        type: mongoose.Schema.Types.String,
    },
    status: {
        required: true,
        type: mongoose.Schema.Types.Boolean,
        default: false,
    },
    date: {
        required: true,
        type: mongoose.Schema.Types.String,
    },
    point: {
        required: true,
        type: mongoose.Schema.Types.Number,
    },
});
const planSchema = new mongoose.Schema({
    user: {
        required: true,
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    tasks: {
        required: false,
        type: [taskSchema],
    },
    goal: {
        required: true,
        type: mongoose.Schema.Types.String,
    },
    pointsearned: {
        required: false,
        type: mongoose.Schema.Types.Number,
        default: 0,
    },
    progress: {
        required: false,
        type: mongoose.Schema.Types.Number,
        default: 0,
    },
    Sucess: {
        required: false,
        type: mongoose.Schema.Types.Boolean,
    },
});
function calculatetotalPoints(tasks) {
    let points = 0;
    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].status === true) {
            points += tasks[i].point;
        }
    }
    return points;
};
function calculateprogress(tasks) {
    let progress = 0;
    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].status === true) {
            progress += 1;
        }
    }
    return progress;
};
function secsess(sec, tasks, progress) {
    if (tasks.length + 1 === progress) {
        return sec = true;
    } else {
        return sec = false;
    }
}
planSchema.pre("save", async function (next) {
    this.pointsearned = calculatetotalPoints(this.tasks);
    next();
});
planSchema.pre("save", async function (next) {
    this.progress = calculateprogress(this.tasks);
    next();
});
planSchema.pre("save", async function (next) {
    this.Sucess = secsess(this.Sucess, this.tasks, this.progress);
    next();
});
export const plan = mongoose.model("plan", planSchema);