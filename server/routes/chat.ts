import { Router, Response } from 'express';
import auth, { AuthRequest } from '../middleware/auth';
import { optionalDB, requireDB } from '../middleware/dbCheck';
import Conversation from '../models/Conversation';
import Message from '../models/Message';
import Idea from '../models/Idea';
import { demoChatAddMessage, demoChatCanInvestorChat, demoChatGetEntrepreneurId, demoChatGetMessages, demoChatGetOrCreateConversation, demoChatListConversations } from '../services/chatDemo';

const router = Router();

// SSE clients per conversation id
const sseClients = new Map<string, Set<Response>>();

function addSseClient(convoId: string, res: Response) {
  if (!sseClients.has(convoId)) sseClients.set(convoId, new Set());
  sseClients.get(convoId)!.add(res);
}

function removeSseClient(convoId: string, res: Response) {
  const set = sseClients.get(convoId);
  if (!set) return;
  set.delete(res);
  if (set.size === 0) sseClients.delete(convoId);
}

function broadcastMessage(convoId: string, payload: any) {
  const set = sseClients.get(convoId);
  if (!set) return;
  const data = JSON.stringify(payload);
  for (const res of set) {
    try {
      res.write(`data: ${data}\n\n`);
    } catch (e) {
      // ignore individual client failures
    }
  }
}

// Create or get conversation for an idea between current user and peer
router.post('/conversations', optionalDB, auth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { ideaId, peerId } = req.body as { ideaId?: string; peerId?: string };
    // Allow either ideaId (chat about idea) or peerId (direct chat)
    if (!ideaId && !peerId) return res.status(400).json({ error: 'ideaId or peerId is required' });

    if (!(req as any).isDBAvailable) {
      // Demo mode
      let otherUserId: string | null = null;
      if (ideaId) {
        if (user.role === 'investor') {
          if (!demoChatCanInvestorChat(ideaId, (user as any)._id?.toString() || (user as any).id)) {
            return res.status(403).json({ error: 'Express interest before starting a chat' });
          }
          otherUserId = demoChatGetEntrepreneurId(ideaId);
        } else if (user.role === 'entrepreneur') {
          if (!peerId) return res.status(400).json({ error: 'peerId is required for entrepreneur' });
          otherUserId = peerId;
        } else {
          return res.status(403).json({ error: 'Access denied' });
        }
        if (!otherUserId) return res.status(404).json({ error: 'Peer not found' });
        const convo = demoChatGetOrCreateConversation(ideaId, (user as any)._id?.toString() || (user as any).id, otherUserId);
        return res.json({ conversation: { _id: convo.id, idea: ideaId, participants: convo.participants, lastMessageAt: convo.lastMessageAt, demo: true } });
      }

      // Direct demo chat (no idea)
      if (!peerId) return res.status(400).json({ error: 'peerId is required for direct chat in demo mode' });
      const convo = demoChatGetOrCreateDirectConversation((user as any)._id?.toString() || (user as any).id, peerId);
      return res.json({ conversation: { _id: convo.id, idea: convo.ideaId, participants: convo.participants, lastMessageAt: convo.lastMessageAt, demo: true } });
    }

    if (ideaId) {
      const idea = await Idea.findById(ideaId).populate('entrepreneur', 'name');
      if (!idea) return res.status(404).json({ error: 'Idea not found' });

      // Determine peer depending on role
      let otherUserId: string;
      if (user.role === 'investor') {
        // Investor must have expressed interest to start chat
        const hasInterest = idea.interests.some((i: any) => i.investor?.toString() === user._id.toString());
        if (!hasInterest) return res.status(403).json({ error: 'Express interest before starting a chat' });
        // Handle populated or unpopulated entrepreneur
        const ent: any = (idea as any).entrepreneur;
        otherUserId = (ent && (ent._id?.toString?.() || ent.toString?.())) || '';
        if (!otherUserId || otherUserId === '[object Object]') {
          return res.status(500).json({ error: 'Invalid entrepreneur reference on idea' });
        }
      } else if (user.role === 'entrepreneur') {
        // Entrepreneur can specify investor peerId; also verify interest exists from that investor
        if (!peerId) return res.status(400).json({ error: 'peerId is required for entrepreneur' });
        const hasInterest = idea.interests.some((i: any) => i.investor?.toString() === peerId);
        if (!hasInterest) return res.status(403).json({ error: 'Chat allowed only with investors who expressed interest' });
        otherUserId = peerId;
        const entId = (typeof (idea as any).entrepreneur === 'object' && (idea as any).entrepreneur?._id)
          ? (idea as any).entrepreneur._id.toString()
          : (idea as any).entrepreneur.toString();
        if (entId !== user._id.toString()) return res.status(403).json({ error: 'Access denied' });
      } else {
        return res.status(403).json({ error: 'Access denied' });
      }

      const participants = [user._id.toString(), otherUserId].sort();

      let convo = await Conversation.findOne({ idea: idea._id, participants: { $all: participants, $size: 2 } });
      if (!convo) {
        convo = await Conversation.create({ idea: idea._id, participants });
      }

      res.json({ conversation: convo });
      return;
    }

    // Direct DB chat (no idea)
    if (!peerId) return res.status(400).json({ error: 'peerId is required for direct chat' });
    // Validate peer exists
    const peerUser = await (await import('../models/User')).default.findById(peerId);
    if (!peerUser) return res.status(404).json({ error: 'Peer not found' });
    // Optionally enforce privacy settings (skipped for now)

    const participants = [user._id.toString(), peerId].sort();
    // Find conversation without idea
    let convo = await Conversation.findOne({ idea: { $exists: false }, participants: { $all: participants, $size: 2 } });
    if (!convo) {
      convo = await Conversation.create({ participants });
    }

    res.json({ conversation: convo });
  } catch (e) {
    console.error('Create/get conversation error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// SSE stream for a conversation
router.get('/conversations/:id/stream', optionalDB, auth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const convoId = req.params.id;

    // Validate access when DB is available
    if ((req as any).isDBAvailable) {
      const convo = await Conversation.findById(convoId);
      if (!convo) return res.status(404).json({ error: 'Conversation not found' });
      if (!convo.participants.map((p: any) => p.toString()).includes(user._id.toString())) return res.status(403).json({ error: 'Access denied' });
    }

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    // Send a comment to keep connection alive and an initial ping
    res.write(`: connected\n\n`);
    res.write(`data: ${JSON.stringify({ type: 'connected', conversationId: convoId })}\n\n`);

    addSseClient(convoId, res);

    req.on('close', () => {
      removeSseClient(convoId, res);
      try { res.end(); } catch (e) {}
    });
  } catch (e) {
    console.error('SSE stream error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// List conversations for current user
router.get('/conversations', optionalDB, auth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    if (!(req as any).isDBAvailable) {
      const convos = demoChatListConversations((user as any)._id?.toString() || (user as any).id);
      return res.json({ conversations: convos.map(c => ({ _id: c.id, idea: c.ideaId, participants: c.participants, lastMessageAt: c.lastMessageAt, demo: true })) });
    }

    const convos = await Conversation.find({ participants: user._id })
      .populate('idea', 'title')
      .populate('participants', 'name email avatar')
      .sort({ updatedAt: -1 })
      .limit(50);
    res.json({ conversations: convos });
  } catch (e) {
    console.error('List conversations error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get messages
router.get('/conversations/:id/messages', optionalDB, auth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    if (!(req as any).isDBAvailable) {
      const msgs = demoChatGetMessages(req.params.id);
      return res.json({ messages: msgs.map(m => ({ _id: m.id, sender: { name: m.senderId }, text: m.text, createdAt: m.createdAt, demo: true })) });
    }

    const convo = await Conversation.findById(req.params.id);
    if (!convo) return res.status(404).json({ error: 'Conversation not found' });
    if (!convo.participants.map(p => p.toString()).includes(user._id.toString())) return res.status(403).json({ error: 'Access denied' });

    const messages = await Message.find({ conversation: convo._id }).populate('sender', 'name avatar').sort({ createdAt: 1 }).limit(200);
    res.json({ messages });
  } catch (e) {
    console.error('Get messages error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// Send message
router.post('/conversations/:id/messages', optionalDB, auth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { text } = req.body as { text: string };
    if (!text || text.trim().length === 0) return res.status(400).json({ error: 'Message text is required' });

    if (!(req as any).isDBAvailable) {
      const msg = demoChatAddMessage(req.params.id, (user as any)._id?.toString() || (user as any).id, text.trim());
      const payload = { _id: msg.id, sender: { name: 'You' }, text: msg.text, createdAt: msg.createdAt, demo: true };
      // Broadcast to SSE clients if any
      broadcastMessage(req.params.id, { event: 'message', message: payload });
      return res.status(201).json({ message: payload });
    }

    const convo = await Conversation.findById(req.params.id);
    if (!convo) return res.status(404).json({ error: 'Conversation not found' });
    if (!convo.participants.map(p => p.toString()).includes(user._id.toString())) return res.status(403).json({ error: 'Access denied' });

    const msg = await Message.create({ conversation: convo._id, sender: user._id, text: text.trim() });
    convo.lastMessageAt = new Date();
    await convo.save();

    const populated = await msg.populate('sender', 'name avatar');

    // Broadcast to SSE clients connected to this conversation
    broadcastMessage(req.params.id, { event: 'message', message: populated });

    res.status(201).json({ message: populated });
  } catch (e) {
    console.error('Send message error:', e);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
