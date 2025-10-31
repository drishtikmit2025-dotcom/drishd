import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { isMongoConnected } from '../config/database';

export interface AuthRequest extends Request {
  user?: IUser;
}

const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const headerToken = req.header('Authorization')?.replace('Bearer ', '');
    const queryToken = (req as any).query?.token as string | undefined;
    const token = headerToken || queryToken;

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'demo-secret-key';
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      demo?: boolean;
      email?: string;
      name?: string;
      role?: string;
      avatar?: string;
    };

    // Handle demo mode
    if (decoded.demo || !isMongoConnected()) {
      // Create a demo user object from JWT data
      const demoUser = {
        _id: decoded.userId,
        id: decoded.userId,
        name: decoded.name || 'Demo User',
        email: decoded.email || 'demo@example.com',
        role: decoded.role || 'entrepreneur',
        avatar: decoded.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${decoded.email || 'demo'}`,
        bio: '',
        location: '',
        website: '',
        linkedin: '',
        twitter: '',
        company: '',
        title: '',
        aum: '',
        notificationSettings: {
          email: true,
          push: true,
          sms: false
        },
        privacySettings: {
          profileVisibility: 'public',
          emailVisibility: 'private',
          activityVisibility: 'public'
        },
        investmentPreferences: {
          focusAreas: [],
          ticketSize: { min: 0, max: 0 },
          geographicFocus: [],
          stagePreference: []
        }
      } as IUser;

      req.user = demoUser;
      return next();
    }

    // Try to find user in database
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid token.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Invalid token.' });
  }
};

export default auth;
