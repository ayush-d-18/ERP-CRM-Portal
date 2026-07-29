import { Request, Response, NextFunction } from "express";

export interface ApiError extends Error {
  status?: number;
  errors?: any;
}

export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = err.status || 500;
  const message = err.message || "Internal server error";

  console.error(`[Error] ${status}: ${message}`, err);

  res.status(status).json({
    success: false,
    message,
    ...(err.errors && { errors: err.errors }),
  });
};
