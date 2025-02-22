import {UserService} from "../services/user.service";
import {IUserBalanceDecrementPayload, IUserBalanceIncrementPayload} from "../interfaces/user.interface";
import {Request, Response} from 'express'

export class UserController {
    private userService = new UserService()

    decrementBalance = async (req: Request<{}, {}, IUserBalanceDecrementPayload>, res: Response) => {
        const data = await this.userService.decrementBalance(req.body);
        res.status(200).json(data);    }

    incrementBalance = async (req: Request<{}, {}, IUserBalanceIncrementPayload>, res: Response) => {
        const data = await this.userService.incrementBalance(req.body);
        res.status(200).json(data);
    }
}