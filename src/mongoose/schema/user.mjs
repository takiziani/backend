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
        default: false,
    },
    companyname: {
        required: false,
        type: mongoose.Schema.Types.String,
    },
    fullname: {
        required: false,
        type: mongoose.Schema.Types.String,
    },
    phonenumber: {
        required: false,
        type: mongoose.Schema.Types.String,
    },
    progresse: {
        required: false,
        type: mongoose.Schema.Types.Number,
        default: 0,
    },
    rank: {
        required: false,
        type: mongoose.Schema.Types.Number,
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
    dateofbirth: {
        required: false,
        type: mongoose.Schema.Types.Date
    },
    education: {
        required: false,
        type: mongoose.Schema.Types.String
    },
    workhistory: {
        required: false,
        type: mongoose.Schema.Types.String
    },
    organization: {
        required: false,
        type: mongoose.Schema.Types.String
    },
    languages: {
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
    speciality: {
        required: false,
        type: mongoose.Schema.Types.String
    },
    totaltasks: {
        required: false,
        type: mongoose.Schema.Types.Number,
        default: 0,
    },
    companyfav: {
        required: false,
        type: [mongoose.Schema.Types.ObjectId],
        ref: "user",
    },
    bio: {
        required: false,
        type: mongoose.Schema.Types.String
    },
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
    return Math.round((progress / plans.length));
}
async function calrank(userId) {
    // Retrieve all users with company set to false and sort them by points in descending order
    const users = await user.find({ company: false }).sort({ points: -1 }).select("points username").exec();
    let userIndex;
    for (let i = 0; i < users.length; i++) {
        if (users[i]._id.toString() === userId.toString()) {
            userIndex = i;
            break;
        }
    }
    userIndex = userIndex + 1;
    console.log("index", userIndex);
    // Return the user's rank (index in the sorted list + 1)
    return userIndex;
}
async function calculatesec(plans) {
    let sec = 0;
    for (let i = 0; i < plans.length; i++) {
        const newplan = await plan.findById(plans[i]);
        if (newplan) {
            sec = (newplan.progress * newplan.tasks.length) / 100;
        } else {
            console.log(`Plan with id ${plans[i]} not found`);
        }
        // mongoose.connection.close();
    }

    return sec;
}
async function calculatefailure(plans) {
    let failure = 0;
    let today = new Date();
    for (let i = 0; i < plans.length; i++) {
        const newplan = await plan.findById(plans[i]);
        if (newplan) {
            for (let j = 0; j < newplan.tasks.length; j++) {
                if (new Date(newplan.tasks[j].date) < today && newplan.tasks[j].status == false) {
                    failure += 1;
                }
            }
        } else {
            console.log(`Plan with id ${plans[i]} not found`);
        }
        // mongoose.connection.close();
    }

    return failure;
}
async function calculate(plans) {
    let totaltasks = 0;
    for (let i = 0; i < plans.length; i++) {
        const newplan = await plan.findById(plans[i]);
        if (newplan) {
            totaltasks += newplan.tasks.length;
        } else {
            console.log(`Plan with id ${plans[i]} not found`);
        }
        // mongoose.connection.close();
    }

    return totaltasks;
};
userschema.pre("save", async function (next) {
    this.points = await calculatetotalpoints(this.plans);
    next();
});
userschema.pre("save", async function (next) {
    this.progresse = await calculatetotalprogress(this.plans);
    next();
});
userschema.pre("save", async function (next) {
    console.log("this._id", this._id);
    this.rank = await calrank(this._id);
    next();
});
userschema.pre("save", async function (next) {
    this.Sucess = await calculatesec(this.plans)
    next();
});
userschema.pre("save", async function (next) {
    this.totaltasks = await calculate(this.plans);
    next();
});
userschema.pre("save", async function (next) {
    this.Failure = await calculatefailure(this.plans);
    next();
});
export const user = mongoose.model("user", userschema);