import mongoose from "mongoose";
const quest = new mongoose.Schema({
    question: {
        required: true,
        type: mongoose.Schema.Types.String,
    },
    answer: {
        required: true,
        type: mongoose.Schema.Types.String,
    },
});
const surveySchema = new mongoose.Schema({
    user: {
        required: true,
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    questions: {
        required: false,
        type: [quest],
    },
});