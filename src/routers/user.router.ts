import {Router} from "express";
import {UserController} from "../controllers/user.controller";
import {validateBalancePayload} from "../middlewares/user-payload-validator.mddw";
import {validate} from "../middlewares/validate.mddw";

export const UserRouter = Router();
const userController = new UserController();

UserRouter.patch("/balance/decrement", validateBalancePayload, validate, userController.decrementBalance)
UserRouter.patch("/balance/increment", validateBalancePayload, validate, userController.incrementBalance)
