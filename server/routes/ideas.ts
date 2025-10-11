import { Router, Response } from 'express';
import Idea from '../models/Idea';
import User from '../models/User';
import Notification from '../models/Notification';
import auth, { AuthRequest } from '../middleware/auth';
import { optionalDB } from '../middleware/dbCheck';
import { getDemoIdeas, addDemoIdea, getSharedDemoIdeas, updateDemoIdea } from '../services/demoData';

const router = Router();

// Get all ideas (for investors)
router.get('/', optionalDB, async (req: AuthRequest, res: Response) => {
  try {
    // If MongoDB is not available, return demo data
    if (!(req as any).isDBAvailable) {
      const {
        category,
        stage,
        minScore = 0,
        sort = 'score',
        search,
        featured
      } = req.query;

      const demoIdeas = getDemoIdeas({
        category,
        stage,
        minScore,
        sort,
        search,
        featured
      });

      return res.json({
        ideas: demoIdeas,
        demo: true,
        message: 'Running in demo mode. Connect MongoDB for full functionality.'
      });
    }

    // Public ideas listing allowed for all users; restricted by visibility/status below

    const {
      category,
      stage,
      minScore = 0,
      sort = 'score',
      search,
      featured
    } = req.query;

    // Build filter query
    const filter: any = {
      visibility: 'public',
      status: { $in: ['pending','under_review','active', 'featured'] }
    };

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (stage && stage !== 'All') {
      filter.stage = stage;
    }

    if (minScore) {
      filter.aiScore = { $gte: parseInt(minScore as string) };
    }

    if (featured === 'true') {
      filter.featured = true;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tagline: { $regex: search, $options: 'i' } },
        { problemStatement: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort options
    let sortOption: any = {};
    switch (sort) {
      case 'recent':
        sortOption = { createdAt: -1 };
        break;
      case 'interests':
        sortOption = { 'interests.length': -1 };
        break;
      case 'views':
        sortOption = { views: -1 };
        break;
      default:
        sortOption = { aiScore: -1, createdAt: -1 };
    }

    const ideas = await Idea.find(filter)
      .populate('entrepreneur', 'name email avatar bio location')
      .sort(sortOption)
      .limit(50);

    res.json({ ideas });
  } catch (error) {
    console.error('Get ideas error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's own ideas (for entrepreneurs)
router.get('/my-ideas', optionalDB, auth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'entrepreneur') {
      return res.status(403).json({ error: 'Access denied. Entrepreneurs only.' });
    }

    // If MongoDB is not available, filter demo data by user
    if (!(req as any).isDBAvailable) {
      const allIdeas = getSharedDemoIdeas();
      const userIdeas = allIdeas.filter(idea =>
        idea.entrepreneur.id === (user.id || user._id) ||
        idea.entrepreneur.email === user.email
      );

      return res.json({
        ideas: userIdeas,
        demo: true
      });
    }

    const ideas = await Idea.find({ entrepreneur: user._id })
      .sort({ createdAt: -1 })
      .populate('interests.investor', 'name email company title');

    res.json({ ideas });
  } catch (error) {
    console.error('Get my ideas error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get idea by ID
router.get('/:id', auth, async (req: AuthRequest, res: Response) => {
  try {
    // Demo mode: find in demo data
    if (!(req as any).isDBAvailable) {
      const id = req.params.id;
      const all = getSharedDemoIdeas();
      const idea = all.find(i => (i.id || i._id) === id || String(i.id) === String(id));
      if (!idea) return res.status(404).json({ error: 'Idea not found', demo: true });

      // For demo, we do not increment views on server side
      return res.json({ idea });
    }

    const idea = await Idea.findById(req.params.id)
      .populate('entrepreneur', 'name email avatar bio location website linkedin')
      .populate('interests.investor', 'name email company title');

    if (!idea) {
      return res.status(404).json({ error: 'Idea not found' });
    }

    const user = req.user;

    // Check if user can view this idea
    if (idea.visibility === 'private' &&
        idea.entrepreneur.toString() !== user?._id.toString() &&
        user?.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Track view if it's an investor viewing
    if (user?.role === 'investor' && idea.entrepreneur.toString() !== user._id.toString()) {
      idea.views += 1;
      idea.viewHistory.push({
        investor: user._id,
        date: new Date()
      });
      await idea.save();
    }

    res.json({ idea });
  } catch (error) {
    console.error('Get idea error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// AI review endpoint - returns AI-generated suggestions and similar ideas
router.get('/:id/ai-review', auth, async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id;

    // Demo mode: use demo data
    if (!(req as any).isDBAvailable) {
      const all = getSharedDemoIdeas();
      const idea = all.find(i => (i.id || i._id) === id || String(i.id) === String(id));
      if (!idea) return res.status(404).json({ error: 'Idea not found', demo: true });

      const { evaluateIdeaWithAI } = await import('../services/ideaEvaluator');
      const review = await evaluateIdeaWithAI({
        title: idea.title,
        tagline: idea.tagline,
        problemStatement: idea.problemStatement,
        proposedSolution: idea.proposedSolution,
        uniqueness: idea.uniqueness,
        customerValidation: idea.customerValidation,
        marketSize: idea.marketSize,
        teamBackground: idea.teamBackground,
        demoUrl: idea.demoUrl,
        pitchDeckUrl: idea.pitchDeckUrl,
        category: idea.category
      });

      const sims = all.filter(i => (i.id || i._id) !== id && (i.category === idea.category || (i.title && idea.title && i.title.toLowerCase().includes((idea.title || '').split(' ')[0].toLowerCase())))).slice(0,6);

      return res.json({ suggestions: review.suggestions || [], review, similarIdeas: sims, demo: true });
    }

    const idea = await Idea.findById(id);
    if (!idea) return res.status(404).json({ error: 'Idea not found' });

    const { evaluateIdeaWithAI } = await import('../services/ideaEvaluator');
    const review = await evaluateIdeaWithAI({
      title: idea.title,
      tagline: idea.tagline,
      problemStatement: idea.problemStatement,
      proposedSolution: idea.proposedSolution,
      uniqueness: idea.uniqueness,
      customerValidation: idea.customerValidation,
      marketSize: idea.marketSize,
      teamBackground: idea.teamBackground,
      demoUrl: idea.demoUrl,
      pitchDeckUrl: idea.pitchDeckUrl,
      category: idea.category
    });

    // Find similar public ideas by category or title keywords
    const titleWords = (idea.title || '').split(/\s+/).filter(Boolean).slice(0,3).map(w => w.replace(/[^a-zA-Z0-9]/g, ''));
    const titleRegex = titleWords.length ? new RegExp(titleWords.join('|'), 'i') : null;
    const filter: any = { visibility: 'public', _id: { $ne: idea._id } };
    if (idea.category) filter.category = idea.category;
    if (titleRegex) filter.$or = [{ title: titleRegex }, { tagline: titleRegex }];

    const similar = await Idea.find(filter).limit(6);

    res.json({ suggestions: review.suggestions || [], review, similarIdeas: similar });
  } catch (error) {
    console.error('AI review error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new idea
router.post('/', optionalDB, auth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'entrepreneur') {
      return res.status(403).json({ error: 'Access denied. Entrepreneurs only.' });
    }

    // If MongoDB is not available, use demo data
    if (!(req as any).isDBAvailable) {
      const ideaData = {
        ...req.body,
        entrepreneur: {
          id: user.id || user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
          bio: user.bio || 'Entrepreneur building the future',
          location: user.location || 'Silicon Valley, CA'
        }
      };

      const newIdea = addDemoIdea(ideaData);

      return res.status(201).json({
        message: 'Idea created successfully (demo mode)',
        idea: newIdea,
        demo: true
      });
    }

    const ideaData = {
      ...req.body,
      entrepreneur: user._id
    };

    const idea = new Idea(ideaData);
    await idea.save();

    await idea.populate('entrepreneur', 'name email avatar');

    res.status(201).json({
      message: 'Idea created successfully',
      idea
    });
  } catch (error) {
    console.error('Create idea error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update idea
router.put('/:id', optionalDB, auth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'entrepreneur') {
      return res.status(403).json({ error: 'Access denied. Entrepreneurs only.' });
    }
    
    // Demo mode
    if (!(req as any).isDBAvailable) {
      const allIdeas = getSharedDemoIdeas();
      const id = req.params.id;
      const idea = allIdeas.find(i => (i.id || i._id) === id);
      if (!idea) return res.status(404).json({ error: 'Idea not found' });
      if (!(idea.entrepreneur?.id === (user.id || user._id) || idea.entrepreneur?.email === user.email)) {
        return res.status(403).json({ error: 'Access denied. You can only edit your own ideas.' });
      }
      const updated = updateDemoIdea(id, req.body);
      return res.json({ message: 'Idea updated successfully (demo mode)', idea: updated });
    }

    const idea = await Idea.findById(req.params.id);
    if (!idea) {
      return res.status(404).json({ error: 'Idea not found' });
    }

    // Check ownership
    if (idea.entrepreneur.toString() !== user._id.toString()) {
      return res.status(403).json({ error: 'Access denied. You can only edit your own ideas.' });
    }

    Object.assign(idea, req.body);
    await idea.save();

    res.json({
      message: 'Idea updated successfully',
      idea
    });
  } catch (error) {
    console.error('Update idea error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Express interest in idea (for investors)
router.post('/:id/interest', optionalDB, auth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'investor') {
      return res.status(403).json({ error: 'Access denied. Investors only.' });
    }
    
    // Demo mode
    if (!(req as any).isDBAvailable) {
      const allIdeas = getSharedDemoIdeas();
      const id = req.params.id;
      const idea = allIdeas.find(i => (i.id || i._id) === id);
      if (!idea) return res.status(404).json({ error: 'Idea not found' });
      // allow multiple interests in demo; store as count or array
      let updated;
      if (Array.isArray(idea.interests)) {
        const exists = idea.interests.some((it: any) => it?.investor === (user.id || user._id));
        if (exists) return res.status(400).json({ error: 'You have already expressed interest in this idea' });
        updated = updateDemoIdea(id, { interests: [...idea.interests, { investor: user.id || user._id, date: new Date().toISOString(), message: req.body.message || '' }] });
      } else {
        const newCount = (idea.interests || 0) + 1;
        updated = updateDemoIdea(id, { interests: newCount });
      }
      return res.json({ message: 'Interest expressed successfully (demo mode)', idea: updated });
    }

    const idea = await Idea.findById(req.params.id).populate('entrepreneur', 'name email');
    if (!idea) {
      return res.status(404).json({ error: 'Idea not found' });
    }

    // Check if already interested
    const existingInterest = idea.interests.find(
      interest => interest.investor.toString() === user._id.toString()
    );

    if (existingInterest) {
      return res.status(400).json({ error: 'You have already expressed interest in this idea' });
    }

    // Add interest
    idea.interests.push({
      investor: user._id,
      date: new Date(),
      message: req.body.message || ''
    });

    await idea.save();

    // Create notification for entrepreneur
    const notification = new Notification({
      recipient: idea.entrepreneur._id,
      type: 'interest',
      title: 'New investor interest in your idea',
      message: `${user.name} expressed interest in your '${idea.title}' idea`,
      idea: idea._id,
      relatedUser: user._id,
      data: {
        investorName: user.name,
        investorRole: user.title || 'Investor'
      },
      actionRequired: true
    });

    await notification.save();

    res.json({
      message: 'Interest expressed successfully',
      idea
    });
  } catch (error) {
    console.error('Express interest error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete idea
router.delete('/:id', optionalDB, auth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user || user.role !== 'entrepreneur') {
      return res.status(403).json({ error: 'Access denied. Entrepreneurs only.' });
    }
    
    // Demo mode
    if (!(req as any).isDBAvailable) {
      const allIdeas = getSharedDemoIdeas();
      const id = req.params.id;
      const idea = allIdeas.find(i => (i.id || i._id) === id);
      if (!idea) return res.status(404).json({ error: 'Idea not found' });
      if (!(idea.entrepreneur?.id === (user.id || user._id) || idea.entrepreneur?.email === user.email)) {
        return res.status(403).json({ error: 'Access denied. You can only delete your own ideas.' });
      }
      const { removeDemoIdea } = await import('../services/demoData');
      removeDemoIdea(id);
      return res.json({ message: 'Idea deleted successfully (demo mode)' });
    }

    const idea = await Idea.findById(req.params.id);
    if (!idea) {
      return res.status(404).json({ error: 'Idea not found' });
    }

    // Check ownership
    if (idea.entrepreneur.toString() !== user._id.toString()) {
      return res.status(403).json({ error: 'Access denied. You can only delete your own ideas.' });
    }

    await Idea.findByIdAndDelete(req.params.id);

    res.json({ message: 'Idea deleted successfully' });
  } catch (error) {
    console.error('Delete idea error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
