import { Result } from "express-validator";
import { ValidationError } from "express-validator";

export class ApiError extends Error {
  status: number;
  message: string;
  errors?: unknown;

  constructor(
    status: number,
    message: string,
    errors?: unknown,
  ) {
    super();
    this.status = status;
    this.message = message;
    this.errors = errors;
  }

  static UnauthorizedError() {
    return new ApiError(401, "User unauthorized");
  }

  static BadRequestError(message: string) {
    return new ApiError(400, message);
  }

  static ValidationError(errors: Result<ValidationError>) {
    return new ApiError(400, "Validation error", errors);
  }
}
