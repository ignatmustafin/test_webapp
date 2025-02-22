import {body} from "express-validator";

export const validateBalancePayload =
    [
        body("amount").not().isString().isInt().withMessage("amount must be a number"),
        body("userId").not().isString().isInt().withMessage("userId must be a number")
    ]