// Simple in-memory chat demo store for when MongoDB is unavailable
// Not persisted; intended only for demo/dev mode

import { getSharedDemoIdeas } from './demoData';

type DemoConversation = {
  id: string;
  ideaId: string;
  participants: string[]; // user ids
  lastMessageAt: string;
};

type DemoMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
};

const conversations: DemoConversation[] = [];
const messages: DemoMessage[] = [];

const genId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2,8)}`;

export const demoChatGetOrCreateConversation = (ideaId: string, userId: string, peerId: string) => {
  const participants = [userId, peerId].sort();
  let convo = conversations.find(c => c.ideaId === ideaId && participants.every(p => c.participants.includes(p)) && c.participants.length === 2);
  if (!convo) {
    convo = { id: genId(), ideaId, participants, lastMessageAt: new Date().toISOString() };
    conversations.push(convo);
  }
  return convo;
};

export const demoChatGetOrCreateDirectConversation = (userId: string, peerId: string) => {
  const participants = [userId, peerId].sort();
  let convo = conversations.find(c => participants.every(p => c.participants.includes(p)) && c.participants.length === 2);
  if (!convo) {
    convo = { id: genId(), ideaId: `direct:${participants.join(':')}`, participants, lastMessageAt: new Date().toISOString() };
    conversations.push(convo);
  }
  return convo;
};

export const demoChatListConversations = (userId: string) => {
  return conversations
    .filter(c => c.participants.includes(userId))
    .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
};

export const demoChatGetMessages = (conversationId: string) => {
  return messages
    .filter(m => m.conversationId === conversationId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
};

export const demoChatAddMessage = (conversationId: string, senderId: string, text: string) => {
  const msg: DemoMessage = { id: genId(), conversationId, senderId, text, createdAt: new Date().toISOString() };
  messages.push(msg);
  const convo = conversations.find(c => c.id === conversationId);
  if (convo) convo.lastMessageAt = msg.createdAt;
  return msg;
};

// Helpers for ACL checks with demo ideas
export const demoChatCanInvestorChat = (ideaId: string, investorId: string) => {
  const idea = getSharedDemoIdeas().find(i => (i.id || i._id) === ideaId);
  if (!idea) return false;
  if (Array.isArray((idea as any).interests)) {
    return (idea as any).interests.some((it: any) => it?.investor === investorId || it?.investor?._id === investorId);
  }
  return ((idea as any).interests || 0) > 0; // loose check
};

export const demoChatGetEntrepreneurId = (ideaId: string) => {
  const idea = getSharedDemoIdeas().find(i => (i.id || i._id) === ideaId);
  const ent = idea?.entrepreneur;
  if (!ent) return null;
  // demo entrepreneur object carries id/email
  return (ent as any).id || (ent as any)._id || null;
};
