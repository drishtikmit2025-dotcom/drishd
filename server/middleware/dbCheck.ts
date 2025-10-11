import { Request, Response, NextFunction } from 'express';
import { isMongoConnected } from '../config/database';

// Middleware to check if MongoDB is available for database operations
export const requireDB = (req: Request, res: Response, next: NextFunction) => {
  if (!isMongoConnected()) {
    return res.status(503).json({ 
      error: 'Database not available',
      message: 'This feature requires MongoDB to be running. Please check your database connection.',
      demo: true
    });
  }
  next();
};

// Middleware for optional database features (returns demo data if DB not available)
export const optionalDB = (req: Request, res: Response, next: NextFunction) => {
  (req as any).isDBAvailable = isMongoConnected();
  next();
};
