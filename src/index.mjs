import express from "express";
import mongoose from "mongoose";
import router from "./router/index.mjs";
import cors from "cors";
const app = express();
app.use(express.json());
const corsOptions = {
    origin: true,
    optionsSuccessStatus: 200,
    credentials: true
}


function originChecker(req, res, next) {
    const origin = req.headers.origin;
    res.header('Access-Control-Allow-Credentials', true);
    if (origin) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    next();
}

//router.use(cors({
//    origin: allowedOrigins,
//    credentials: true
//}));




app.use(originChecker);
app.use(cors(corsOptions));
app.use(router);

mongoose.connect("mongodb://0.0.0.0:27017/vyvix",)
    .then(() => console.log("connected to database"))
    .catch((err) => console.log(`EROR:${err}`))

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});