import { NextFunction, Request, Response } from "express";

import { AppError } from "../utils/errors";
import { verifyToken } from "../utils/jwt";

export function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    next(new AppError("Unauthorized", 401));
    return;
  }

  const token = authHeader.slice("Bearer ".length);

  try {
    const payload = verifyToken(token);
    req.user = {
      userId: payload.userId,
      role: payload.role
    };
    next();
  } catch {
    next(new AppError("Unauthorized", 401));
  }
}
