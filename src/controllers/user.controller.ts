import {UserService} from "../services/user.service";
import {Request, Response} from 'express'
import {IUserBalanceUpdatePayload} from "../interfaces";

export class UserController {
    private userService = new UserService()

    balanceUpdate = async (req: Request<{}, {}, IUserBalanceUpdatePayload>, res: Response) => {
        const data = await this.userService.balanceUpdate(req.body);
        res.status(200).json({data});
    }
}