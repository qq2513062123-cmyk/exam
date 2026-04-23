import { NextFunction, Request, Response } from "express";

import { sendSuccess } from "../../utils/response";
import * as studentHistoryService from "./student-history.service";

export async function listHistory(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const submissions = await studentHistoryService.listStudentHistory(req.user!.userId);

    sendSuccess(res, { submissions });
  } catch (error) {
    next(error);
  }
}
