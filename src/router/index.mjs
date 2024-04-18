import { Router } from "express";
import usersRouter from "./users.mjs";
import plansRouter from "./plans.mjs";

const router = Router();
router.use(usersRouter);
router.use(plansRouter);


export default router