import { Router, Response } from 'express';
import Notification from '../models/Notification';
import auth, { AuthRequest } from '../middleware/auth';
import { optionalDB } from '../middleware/dbCheck';
import { getDemoNotifications } from '../services/demoData';

const router = Router();

// Get user's notifications
router.get('/', optionalDB, auth, async (req: AuthRequest, res: Response) => {
  try {
    // If MongoDB is not available, return demo data
    if (!(req as any).isDBAvailable) {
      return res.json({
        notifications: [],
        unreadCount: 0,
        hasMore: false,
        demo: true,
        message: 'Running in demo mode. No live notifications available. Connect MongoDB for full functionality.'
      });
    }

    const user = req.user;
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { read, limit = 20, offset = 0 } = req.query;

    const filter: any = { recipient: user._id };

    if (read !== undefined) {
      filter.read = read === 'true';
    }

    const notifications = await Notification.find(filter)
      .populate('idea', 'title')
      .populate('relatedUser', 'name email avatar company title')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit as string))
      .skip(parseInt(offset as string));

    const unreadCount = await Notification.countDocuments({
      recipient: user._id,
      read: false
    });

    res.json({
      notifications,
      unreadCount,
      hasMore: notifications.length === parseInt(limit as string)
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark notification as read
router.put('/:id/read', auth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    // Check ownership
    if (notification.recipient.toString() !== user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    notification.read = true;
    notification.readAt = new Date();
    await notification.save();
    
    res.json({
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark all notifications as read
router.put('/mark-all-read', auth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    await Notification.updateMany(
      { recipient: user._id, read: false },
      { 
        read: true, 
        readAt: new Date() 
      }
    );
    
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete notification
router.delete('/:id', auth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    // Check ownership
    if (notification.recipient.toString() !== user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    await Notification.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create notification (for testing or admin use)
router.post('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const notification = new Notification({
      recipient: req.body.recipient || user._id,
      type: req.body.type,
      title: req.body.title,
      message: req.body.message,
      idea: req.body.idea,
      relatedUser: req.body.relatedUser,
      data: req.body.data,
      actionRequired: req.body.actionRequired || false
    });
    
    await notification.save();
    
    res.status(201).json({
      message: 'Notification created successfully',
      notification
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
