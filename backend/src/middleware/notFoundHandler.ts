import { Request, Response, NextFunction } from 'express';
import { NotFoundError } from './errorHandler.js';

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  next(NotFoundError(`Route ${req.originalUrl} not found`));
};
