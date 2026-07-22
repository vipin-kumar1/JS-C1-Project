import type { NextFunction, Request, Response } from "express";

// Wraps async route handlers so thrown errors / rejected promises are
// forwarded to Express's error handling chain instead of crashing the process.
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}
