import { NextFunction, Request, Response } from "express";

import { sendSuccess } from "../../utils/response";
import * as adminStatsService from "./admin-stats.service";

export async function getScores(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const stats = await adminStatsService.getAdminStats();

    sendSuccess(res, { stats });
  } catch (error) {
    next(error);
  }
}

export async function getOverview(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const stats = await adminStatsService.getAdminStats();

    sendSuccess(res, { stats });
  } catch (error) {
    next(error);
  }
}
