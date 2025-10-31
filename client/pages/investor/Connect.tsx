import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import ChatWindow from '@/components/chat/ChatWindow';
import { apiRequest } from '@/lib/api';

export default function InvestorConnect() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePeer, setActivePeer] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await apiRequest<{ users: any[] }>(`/users?role=entrepreneur`);
        if (!mounted) return;
        setUsers(data.users || []);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Connect with Entrepreneurs</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-sm text-gray-500">Loading profiles…</div>
            ) : users.length === 0 ? (
              <div className="text-sm text-gray-500">No entrepreneurs found.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {users.map(u => (
                  <div key={u._id} className="flex items-center justify-between gap-3 p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={u.avatar} alt={u.name} />
                        <AvatarFallback>{(u.name || '?').split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{u.name}</div>
                        <div className="text-sm text-gray-600">{u.company || u.bio}</div>
                      </div>
                    </div>
                    <div>
                      <Button onClick={() => setActivePeer(u)}>Message</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {activePeer && (
        <ChatWindow
          ideaId={undefined as any}
          peerId={activePeer._id}
          peerName={activePeer.name}
          peerAvatar={activePeer.avatar}
          onClose={() => setActivePeer(null)}
        />
      )}
    </DashboardLayout>
  );
}
