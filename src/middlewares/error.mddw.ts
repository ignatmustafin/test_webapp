import {NextFunction, Request, Response} from "express";

export const errorMiddleware = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    console.error(err);
    if (err.errors) {
        res.status(400).json({error: {validationErrors: err.errors}})
        return;
    } else if (err.message) {

        if (err.parent?.constraint === 'check_balance_non_negative') {
            res.status(400).json({error: "user's balance could not be negative"})
        } else {
            res.status(400).json({error: err.message});
        }

    } else {
        res.status(500).json({error: "something went wrong"});
    }

    return;

};