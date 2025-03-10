import { User } from "../database/models/user.model";
import { InjectionService } from "./injection.service";

export class UserService extends InjectionService {
  private userRepository = this.db.getRepository(User);

  async creditBalance(userId: number, amount: number) {
    const result = await this.userRepository.increment("balance", {
      where: { id: userId },
      by: amount,
    });

    if (!result?.[0]?.length) {
      throw new Error("Balance was not affected");
    }

    return result[0][0];
  }

  async debitBalance(userId: number, amount: number) {
    const result = await this.userRepository.decrement("balance", {
      where: { id: userId },
      by: amount,
    });

    if (!result?.[0]?.length) {
      throw new Error("Balance was not affected");
    }

    return result[0][0];
  }
}
