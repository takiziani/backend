import express from "express";
import mongoose from "mongoose";
import router from "./router/index.mjs";

const app = express();
app.use(express.json());
app.use(router);
mongoose.connect("mongodb://localhost:27017/vyvix",)
    .then(() => console.log("connected to database"))
    .catch((err) => console.log(`EROR:${err}`))
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

