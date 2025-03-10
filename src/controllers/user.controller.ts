import { UserService } from "../services/user.service";
import { Request, Response } from "express";
import { IUserBalanceUpdatePayload } from "../interfaces";
import { EUserBalanceUpdateOperation } from "../enums";

export class UserController {
  private userService = new UserService();

  balanceUpdate = async (
    req: Request<{}, {}, IUserBalanceUpdatePayload>,
    res: Response,
  ) => {
    const { userId, amount, operation } = req.body;

    let data;
    if (operation === EUserBalanceUpdateOperation.CREDIT) {
      data = await this.userService.creditBalance(userId, amount);
    } else if (operation === EUserBalanceUpdateOperation.DEBIT) {
      data = await this.userService.debitBalance(userId, amount);
    } else {
      res.status(400).json({ error: "Invalid operation type" });
      return;
    }

    res.status(200).json({ data });
  };
}
