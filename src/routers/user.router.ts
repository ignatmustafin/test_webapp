import { Router } from "express";
import { UserController } from "../controllers";
import {
  validateBalancePayloadMiddleware,
  validationResultMiddleware,
} from "../middlewares";

export const UserRouter = Router();
const userController = new UserController();

UserRouter.patch(
  "/balance/update",
  validateBalancePayloadMiddleware,
  validationResultMiddleware,
  userController.balanceUpdate,
);
