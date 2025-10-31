import { Router, Response } from 'express';
import { optionalDB } from '../middleware/dbCheck';
import User from '../models/User';
import { getDemoIdeas } from '../services/demoData';

const router = Router();

// GET /api/users?role=entrepreneur|investor
router.get('/', optionalDB, async (req, res: Response) => {
  try {
    const role = (req.query.role as string) || undefined;
    if (!(req as any).isDBAvailable) {
      // Demo mode: derive entrepreneurs from demo ideas
      const ideas = getDemoIdeas();
      const entrepreneurs = ideas.map(i => ({
        _id: (i.entrepreneur && (i.entrepreneur.id || i.entrepreneur._id)) || i.entrepreneur?.email || i.entrepreneur?.name || `demo-${i.id}`,
        name: i.entrepreneur?.name || 'Demo Entrepreneur',
        avatar: i.entrepreneur?.avatar,
        bio: i.entrepreneur?.bio,
        role: 'entrepreneur'
      }));

      const investors = [
        { _id: 'inv1', name: 'Michael Chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=michael', bio: 'Senior Partner at Tech Ventures', role: 'investor' },
        { _id: 'inv2', name: 'Lisa Park', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa', bio: 'Investment Director at Green Capital', role: 'investor' }
      ];

      const list = role === 'investor' ? investors : role === 'entrepreneur' ? entrepreneurs : [...entrepreneurs, ...investors];
      return res.json({ users: list });
    }

    const query: any = {};
    if (role) query.role = role;

    const users = await User.find(query).select('name avatar bio role company title location');
    res.json({ users });
  } catch (e) {
    console.error('Users list error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
