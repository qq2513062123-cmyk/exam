import { Response } from "express";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T | null;
};

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = "ok",
  statusCode = 200
): Response<ApiResponse<T>> {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 500,
  data: null = null
): Response<ApiResponse<null>> {
  return res.status(statusCode).json({
    success: false,
    message,
    data
  });
}
