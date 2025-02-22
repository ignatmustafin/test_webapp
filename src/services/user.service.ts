import {DatabaseService} from "../database";
import {User} from "../database/models/user.model";
import {IUserBalanceDecrementPayload, IUserBalanceIncrementPayload} from "../interfaces/user.interface";

export class UserService {
    private userRepository = DatabaseService.getInstance().getDb().getRepository(User)

    async decrementBalance(payload: IUserBalanceDecrementPayload) {
        const {userId, amount} = payload;
        const result = await this.userRepository.decrement('balance', {where: {id: userId}, by: amount});
        if (!result?.[0]?.length) {
            throw new Error('Balance was not affected')
        }
        return result[0][0];
    }

    async incrementBalance(payload: IUserBalanceIncrementPayload) {
        const {userId, amount} = payload;
        const result = await this.userRepository.increment('balance', {where: {id: userId}, by: amount});
        if (!result?.[0]?.length) {
            throw new Error('Balance was not affected')
        }
        return result[0][0];
    }
}