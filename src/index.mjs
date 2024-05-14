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
app.use(originChecker);
app.use(cors(corsOptions));
app.use(router);
app.set("trust proxy", 1);
mongoose.connect(process.env.database)
    .then(() => console.log("connected to database"))
    .catch((err) => console.log(`EROR:${err}`));
mongoose.connection.setMaxListeners(20); // Increase limit to 20
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});