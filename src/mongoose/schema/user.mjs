import mongoose from "mongoose";

const userschema = new mongoose.Schema({

    username: {
        required: true,
        type: mongoose.Schema.Types.String,
        unique: true,
        minlength: 3,
        maxlength: 20,
    },
    password: {
        required: true,
        type: mongoose.Schema.Types.String,
    },
    email: {
        required: true,
        type: mongoose.Schema.Types.String,
        unique: true,
        lowercase: true,
    },
    tasksdone: {
        required: false,
        type: mongoose.Schema.Types.Number,
        default: 0,
    },
    employe: {
        required: false,
        type: mongoose.Schema.Types.Boolean,
    },
    company: {
        required: false,
        type: mongoose.Schema.Types.Boolean,
    },
    companyname: {
        required: false,
        type: mongoose.Schema.Types.String,
    },
    employefullname: {
        required: false,
        type: mongoose.Schema.Types.String,
    },
}
);

export const user = mongoose.model("user", userschema);