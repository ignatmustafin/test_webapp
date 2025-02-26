import {NextFunction, Request, Response} from "express";
import {validationResult} from "express-validator";
import {ApiError} from "../utils";

export const validationResultMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        next(ApiError.ValidationError(errors))
    }
    next();
}