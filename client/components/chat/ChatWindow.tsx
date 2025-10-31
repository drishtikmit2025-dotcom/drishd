import { useEffect, useRef, useState } from 'react';
import { chatApi } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { X } from 'lucide-react';

interface ChatWindowProps {
  ideaId: string;
  peerId?: string; // required when entrepreneur initiates with investor
  peerName?: string;
  peerAvatar?: string;
  onClose: () => void;
}

export default function ChatWindow({ ideaId, peerId, peerName, peerAvatar, onClose }: ChatWindowProps) {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let active = true;
    const init = async () => {
      try {
        const { conversation } = await chatApi.createOrGetConversation({ ideaId, peerId });
        if (!active) return;
        setConversationId(conversation._id);
        const res = await chatApi.getMessages(conversation._id);
        if (!active) return;
        setMessages(res.messages || []);
      } catch (e) {
        // noop
      } finally {
        if (active) setLoading(false);
      }
    };
    init();
    // Replace polling with Server-Sent Events
    return () => { active = false; };
  }, [ideaId, peerId, conversationId]);

  useEffect(() => {
    if (!conversationId) return;
    const token = localStorage.getItem('drishti_token');
    const url = `/api/chat/conversations/${conversationId}/stream${token ? `?token=${encodeURIComponent(token)}` : ''}`;
    const es = new EventSource(url);
    es.onmessage = (ev) => {
      try {
        const payload = JSON.parse(ev.data);
        // Expect payload like { event: 'message', message: {...} }
        if (payload?.event === 'message' && payload?.message) {
          setMessages(prev => {
            if (prev.some(m => String(m._id) === String(payload.message._id))) return prev;
            return [...prev, payload.message];
          });
        }
      } catch (e) {
        // ignore
      }
    };
    es.onerror = () => {
      es.close();
    };

    return () => { es.close(); };
  }, [conversationId]);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const send = async () => {
    if (!conversationId || !text.trim()) return;
    try {
      const res = await chatApi.sendMessage(conversationId, text.trim());
      // optimistic append handled; SSE may also deliver the message, so dedupe on arrival
      setMessages(prev => {
        if (prev.some(m => String(m._id) === String(res.message._id))) return prev;
        return [...prev, res.message];
      });
      setText('');
    } catch {}
  };

  return (
    <div className="fixed bottom-4 right-4 w-full max-w-md z-50">
      <Card className="shadow-xl border border-gray-200">
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={peerAvatar} alt={peerName} />
              <AvatarFallback>{(peerName || 'Chat').split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="font-medium">{peerName || 'Conversation'}</div>
          </div>
          <Button size="icon" variant="ghost" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <CardContent className="p-0">
          <div ref={listRef} className="max-h-80 overflow-y-auto p-3 space-y-2">
            {loading ? (
              <div className="text-center text-sm text-gray-500 py-6">Loading messages…</div>
            ) : messages.length === 0 ? (
              <div className="text-center text-sm text-gray-500 py-6">No messages yet. Say hello!</div>
            ) : (
              messages.map((m: any) => (
                <div key={m._id} className="flex items-start gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={m.sender?.avatar} alt={m.sender?.name} />
                    <AvatarFallback>{(m.sender?.name || '?').split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="bg-gray-100 rounded px-3 py-2 text-sm max-w-[80%]">
                    <div className="font-medium text-gray-700">{m.sender?.name || 'User'}</div>
                    <div>{m.text}</div>
                    <div className="text-[10px] text-gray-500 mt-1">{new Date(m.createdAt).toLocaleString()}</div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="flex items-center gap-2 p-3 border-t">
            <Input placeholder="Type a message" value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') send(); }} />
            <Button onClick={send} disabled={!conversationId || !text.trim()}>Send</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
