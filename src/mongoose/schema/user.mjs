import mongoose from "mongoose";
import { plan } from "./plan.mjs";
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
    phonenumber: {
        required: false,
        type: mongoose.Schema.Types.String,
        default: "000000000",
    },
    progresse: {
        required: false,
        type: mongoose.Schema.Types.Number,
        default: 0,
    },
    rank: {
        required: false,
        type: mongoose.Schema.Types.Number,
        default: 0,
    },
    surveys: {
        required: false,
        type: mongoose.Schema.Types.ObjectId,
        ref: "survey",
    },
    points: {
        required: false,
        type: mongoose.Schema.Types.Number,
        default: 0,
    },
    plans: {
        required: false,
        type: [mongoose.Schema.Types.ObjectId],
        ref: "plan",
    },
    image: {
        required: false,
        type: mongoose.Schema.Types.String,
    },
    DateofBirth: {
        required: false,
        type: mongoose.Schema.Types.Date
    },
    Education: {
        required: false,
        type: mongoose.Schema.Types.String
    },
    WorkHistory: {
        required: false,
        type: [mongoose.Schema.Types.String]
    },
    Organization: {
        required: false,
        type: mongoose.Schema.Types.String
    },
    Languages: {
        required: false,
        type: [mongoose.Schema.Types.String]
    },
    Failure: {
        required: false,
        type: mongoose.Schema.Types.Number,
        default: 0,
    },
    Sucess: {
        required: false,
        type: mongoose.Schema.Types.Number,
        default: 0,
    },
    Speciality: {
        required: false,
        type: mongoose.Schema.Types.String
    }
}
);
async function calculatetotalpoints(plans) {
    let points = 0;
    for (let i = 0; i < plans.length; i++) {
        const newplan = await plan.findById(plans[i]);
        if (newplan) {
            console.log("here" + newplan.progress);
            points += newplan.pointsearned;
        } else {
            console.log(`Plan with id ${plans[i]} not found`);
        }
    }
    return points;
};
async function calculatetotalprogress(plans) {
    let progress = 0;
    for (let i = 0; i < plans.length; i++) {
        const newplan = await plan.findById(plans[i]);
        if (newplan) {
            console.log("here" + newplan.progress);
            progress += newplan.progress;
        } else {
            console.log(`Plan with id ${plans[i]} not found`);
        }
    }
    return progress;
}
async function calculateUserRank(userId) {
    // Retrieve all users and sort them by points in descending order
    const users = await user.find({}).sort({ points: -1 }).exec();

    // Find the index of the user in the sorted list
    const userIndex = users.findIndex(u => u._id.toString() === userId);

    // Return the user's rank (index in the sorted list + 1)
    return userIndex + 1;
}
async function calculatesec(plans) {
    let sec = 0;
    for (let i = 0; i < plans.length; i++) {
        const newplan = await plan.findById(plans[i]);
        if (newplan.sec = true) {
            sec = sec + 1;
        }
    }
    return sec;
}
userschema.pre("save", async function (next) {
    this.points = await calculatetotalpoints(this.plans);
    next();
});
userschema.pre("save", async function (next) {
    this.progresse = await calculatetotalprogress(this.plans);
    next();
});
userschema.pre("save", async function (next) {
    this.rank = await calculateUserRank(this._id);
    next();
});
userschema.pre("save", async function (next) {
    this.Sucess = await calculatesec(this.plans)
    next();
})

export const user = mongoose.model("user", userschema);