import mongoose from "mongoose";
const employeschema = new mongoose.Schema({
    itis: {
        type: mongoose.Schema.Types.Boolean,
        required: true
    },
    employefullname: {
        type: mongoose.Schema.Types.String,
        required: true
    }
},
)
const companyschema = new mongoose.Schema({
    itis: {
        type: mongoose.Schema.Types.Boolean,
        required: true
    },
    companyname: {
        type: mongoose.Schema.Types.String,
        required: true
    }
})
const historyschema = new mongoose.Schema({
    user: {
        required: false,
        type: mongoose.Schema.Types.String
    },
    model: {
        required: false,
        type: mongoose.Schema.Types.String
    }
})
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
    company: {
        required: false,
        type: companyschema,
    },
    tasksdone: {
        required: false,
        type: mongoose.Schema.Types.Number,
        default: 0,
    },
    employe: {
        required: false,
        type: employeschema,
    },
    history: {
        required: false,
        type: [historyschema],
    }
}
);

export const user = mongoose.model("user", userschema);