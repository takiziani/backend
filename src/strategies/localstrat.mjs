import passport from "passport";
import { Strategy } from "passport-local";
import { user } from "../mongoose/schema/user.mjs";
import { comparePassword } from "../utils/helper.mjs";
// 

passport.serializeUser((user, done) => {
    console.log(`inside serialized user`);
    console.log(user);
    done(null, user.id);
})
passport.deserializeUser(async (id, done) => {
    console.log(`inside desirialized`);
    console.log(`deserializing user id ${id}`);
    try {
        const finduser = await user.findById(id)
        if (!finduser) throw new Error("User not found");
        done(null, finduser);
        console.log("inside user deserialized");
    } catch (err) {
        done(err, null);
    }
})
export default passport.use(
    new Strategy(async (username, password, done) => {
        try {
            const finduser = await user.findOne({ username })
            if (!finduser) throw new Error("user not found");
            if (!comparePassword(password, finduser.password)) throw new Error("bad credentials");
            done(null, finduser);
        } catch (err) {
            done(err, null);
        }
    })
);