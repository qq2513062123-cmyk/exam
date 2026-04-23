import { NextFunction, Request, Response } from "express";

import { AppError } from "../utils/errors";

type Role = "student" | "admin";

export function requireRole(role: Role) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError("Unauthorized", 401));
      return;
    }

    if (req.user.role !== role) {
      next(new AppError("Forbidden", 403));
      return;
    }

    next();
  };
}
