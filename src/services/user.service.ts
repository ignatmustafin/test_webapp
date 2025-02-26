import { User } from "../database/models/user.model";
import { IUserBalanceUpdatePayload } from "../interfaces";
import { EUserBalanceUpdateOperation } from "../enums";
import { InjectionService } from "./injection.service";

export class UserService extends InjectionService {
  private userRepository = this.db.getRepository(User);

  async balanceUpdate(payload: IUserBalanceUpdatePayload) {
    const { userId, amount, operation } = payload;

    const result =
      operation === EUserBalanceUpdateOperation.CREDIT
        ? await this.userRepository.increment("balance", {
            where: { id: userId },
            by: amount,
          })
        : operation === EUserBalanceUpdateOperation.DEBIT
          ? await this.userRepository.decrement("balance", {
              where: { id: userId },
              by: amount,
            })
          : null;

    if (!result?.[0]?.length) {
      throw new Error("Balance was not affected");
    }

    return result[0][0];
  }
}
