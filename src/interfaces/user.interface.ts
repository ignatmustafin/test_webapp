import {EUserBalanceUpdateOperation} from "../enums";

export interface IUserBalanceUpdatePayload {
    userId: number;
    amount: number;
    operation: EUserBalanceUpdateOperation
}