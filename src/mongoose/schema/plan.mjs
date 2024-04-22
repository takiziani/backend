import mongoose from "mongoose";
const taskSchema = new mongoose.Schema({
    task: {
        required: false,
        type: mongoose.Schema.Types.String,
    },
    status: {
        required: true,
        type: mongoose.Schema.Types.Boolean,
    },
    date: {
        required: true,
        type: mongoose.Schema.Types.String,
    }
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
});
export const plan = mongoose.model("plan", planSchema);