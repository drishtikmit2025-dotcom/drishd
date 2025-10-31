import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import auth, { AuthRequest } from '../middleware/auth';
import { requireDB, optionalDB } from '../middleware/dbCheck';

const router = Router();

// Register
router.post('/register', optionalDB, async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    // If MongoDB is not available, return demo user
    if (!(req as any).isDBAvailable) {
      const demoUser = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        email,
        role,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
      };

      const JWT_SECRET = process.env.JWT_SECRET || 'demo-secret-key';
      const token = jwt.sign(
        {
          userId: demoUser.id,
          demo: true,
          email: demoUser.email,
          name: demoUser.name,
          role: demoUser.role,
          avatar: demoUser.avatar
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(201).json({
        message: 'Demo user created successfully',
        user: demoUser,
        token,
        demo: true
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      role
    });

    await user.save();

    // Generate JWT token
    const JWT_SECRET = process.env.JWT_SECRET || 'demo-secret-key';
    const token = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data without password
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    };

    res.status(201).json({
      message: 'User created successfully',
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login
router.post('/login', optionalDB, async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;

    // If MongoDB is not available, return demo user
    if (!(req as any).isDBAvailable) {
      // Simple demo validation
      if (password !== 'password123' && password !== 'demo') {
        return res.status(400).json({ error: 'Invalid credentials. Use "password123" or "demo" for demo mode.' });
      }

      const demoUser = {
        id: Math.random().toString(36).substr(2, 9),
        name: email.split('@')[0],
        email,
        role,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
      };

      const JWT_SECRET = process.env.JWT_SECRET || 'demo-secret-key';
      const token = jwt.sign(
        {
          userId: demoUser.id,
          demo: true,
          email: demoUser.email,
          name: demoUser.name,
          role: demoUser.role,
          avatar: demoUser.avatar
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        message: 'Demo login successful',
        user: demoUser,
        token,
        demo: true
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check role matches
    if (user.role !== role) {
      return res.status(400).json({ error: 'Invalid role for this account' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const JWT_SECRET = process.env.JWT_SECRET || 'demo-secret-key';
    const token = jwt.sign(
      { userId: user._id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data without password
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    };

    res.json({
      message: 'Login successful',
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Get current user
router.get('/me', auth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
      location: user.location,
      website: user.website,
      linkedin: user.linkedin,
      twitter: user.twitter,
      company: user.company,
      title: user.title,
      aum: user.aum,
      notificationSettings: user.notificationSettings,
      privacySettings: user.privacySettings,
      investmentPreferences: user.investmentPreferences
    };
    
    res.json({ user: userResponse });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update profile
router.put('/profile', auth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const allowedUpdates = [
      'name', 'bio', 'location', 'website', 'linkedin', 'twitter',
      'company', 'title', 'aum', 'notificationSettings', 'privacySettings',
      'investmentPreferences'
    ];
    
    const updates = Object.keys(req.body);
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));
    
    if (!isValidOperation) {
      return res.status(400).json({ error: 'Invalid updates' });
    }
    
    updates.forEach(update => {
      (user as any)[update] = req.body[update];
    });
    
    await user.save();
    
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        bio: user.bio,
        location: user.location,
        website: user.website,
        linkedin: user.linkedin,
        twitter: user.twitter,
        company: user.company,
        title: user.title,
        aum: user.aum
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
