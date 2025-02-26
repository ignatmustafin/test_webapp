import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils";
import { DatabaseError } from "sequelize";
import { ErrorDTO } from "../DTO";

export const errorMiddleware = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error(err);
  if (err instanceof ApiError) {
    res.status(err.status).send(new ErrorDTO(err.message));
  } else if (err instanceof DatabaseError) {
    const dbError = err as DatabaseError & {
      original?: { constraint?: string };
    };

    const message =
      dbError.original?.constraint === "check_balance_non_negative"
        ? "User's balance could not be negative"
        : dbError.message;

    res.status(400).send(new ErrorDTO(message));
  } else {
    res.status(500).send(new ErrorDTO("Unknown server error"));
  }
};
