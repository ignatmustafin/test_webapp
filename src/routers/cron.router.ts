import {Router} from "express";
import {CronController} from "../controllers/cron.controller";

export const CronRouter = Router();
const cronController = new CronController();

CronRouter.get("/jobs/all",  cronController.getAllCronJobs);
