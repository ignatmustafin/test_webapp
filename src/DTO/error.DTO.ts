import { IError } from "../interfaces";
import { ValidationError, Result } from "express-validator";

export class ErrorDTO implements IError {
    error: { message: string; errors?: unknown };

    constructor(message: string, errors?: Result<ValidationError>) {
        this.error = {
            message,
            errors: errors ? errors.array() : undefined,
        };
    }
}