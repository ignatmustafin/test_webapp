import {body} from "express-validator";
import {EUserBalanceUpdateOperation} from "../enums";

export const validateBalancePayloadMiddleware =
    [
        body("amount").not().isString().isInt().withMessage("amount must be a number"),
        body("userId").not().isString().isInt().withMessage("userId must be a number"),
        body("operation")
            .isString()
            .isIn(Object.values(EUserBalanceUpdateOperation))
            .withMessage(`Type must be one of: ${Object.values(EUserBalanceUpdateOperation).join(", ")}`)
    ]