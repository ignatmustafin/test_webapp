import {Router} from "express";
import { UserRouter } from "./user.router";

export const MainRouter = Router();

MainRouter.use("/user", UserRouter);