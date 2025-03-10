import {Router} from "express";
import { UserRouter } from "./user.router";
import {CronRouter} from "./cron.router";

export const MainRouter = Router();

MainRouter.use("/user", UserRouter);
MainRouter.use("/cron", CronRouter);