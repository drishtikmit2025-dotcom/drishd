import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Bell,
  MessageSquare,
  Users,
  TrendingUp,
  Eye,
  Check,
  X,
  Star,
  ExternalLink
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import ChatWindow from "@/components/chat/ChatWindow";
import { notificationsApi } from "@/lib/api";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.6 } }
};

type LiveNotification = {
  _id: string;
  type: string;
  title: string;
  message: string;
  idea?: { _id: string; title: string } | string;
  relatedUser?: { _id: string; name: string; email?: string; avatar?: string; company?: string; title?: string } | string;
  data?: Record<string, any>;
  read: boolean;
  actionRequired?: boolean;
  createdAt: string;
};

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "interest":
      return Star;
    case "message":
      return MessageSquare;
    case "connection":
      return Users;
    case "score_update":
      return TrendingUp;
    case "review":
      return Eye;
    case "feature":
      return Bell;
    default:
      return Bell;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case "interest":
      return "text-yellow-600 bg-yellow-50";
    case "message":
      return "text-blue-600 bg-blue-50";
    case "connection":
      return "text-green-600 bg-green-50";
    case "score_update":
      return "text-purple-600 bg-purple-50";
    case "review":
      return "text-orange-600 bg-orange-50";
    case "feature":
      return "text-pink-600 bg-pink-50";
    default:
      return "text-gray-600 bg-gray-50";
  }
};

export default function EntrepreneurNotifications() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<LiveNotification[]>([]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await notificationsApi.getAll();
        if ((res as any).demo) {
          if (!active) return;
          setItems([]); // hide demo notifications
        } else {
          if (!active) return;
          setItems((res.notifications || []) as unknown as LiveNotification[]);
        }
      } catch {
        if (!active) return;
        setItems([]);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, []);

  const unreadCount = useMemo(() => items.filter(n => !n.read).length, [items]);
  const [chatTarget, setChatTarget] = useState<{ ideaId: string; peerId: string; peerName?: string; peerAvatar?: string } | null>(null);

  const markAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setItems(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch {}
  };

  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setItems(prev => prev.map(n => ({ ...n, read: true })));
    } catch {}
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Bell className="w-8 h-8 text-brand-600" />
                Notifications
                {unreadCount > 0 && (
                  <Badge className="bg-red-500 text-white">{unreadCount} new</Badge>
                )}
              </h1>
              <p className="text-gray-600">Stay updated with investor interests and platform updates</p>
            </div>
            {unreadCount > 0 && (
              <Button onClick={markAllAsRead} variant="outline">
                <Check className="w-4 h-4 mr-2" />
                Mark All as Read
              </Button>
            )}
          </motion.div>

          <motion.div variants={containerVariants} className="space-y-4">
            {items.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              const colorClasses = getNotificationColor(notification.type);
              const related = notification.relatedUser as any;
              const relatedName = related?.name || notification.data?.investorName;
              const relatedRole = related?.title || notification.data?.investorRole;
              const relatedAvatar = related?.avatar;
              const ideaTitle = typeof notification.idea === 'object' ? (notification.idea as any)?.title : undefined;
              const time = new Date(notification.createdAt).toLocaleString();

              return (
                <motion.div key={notification._id} variants={itemVariants}>
                  <Card className={`transition-all duration-300 hover:shadow-md ${!notification.read ? 'ring-2 ring-brand-200 bg-brand-50/30' : ''}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${colorClasses}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{notification.title}</h3>
                            <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                              <span className="text-sm text-gray-500">{time}</span>
                              {!notification.read && <div className="w-2 h-2 bg-brand-500 rounded-full"></div>}
                            </div>
                          </div>

                          <p className="text-gray-700 mb-3">{notification.message}</p>

                          {relatedName && (
                            <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={relatedAvatar} alt={relatedName} />
                                <AvatarFallback>{relatedName.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-gray-900">{relatedName}</p>
                                <p className="text-sm text-gray-600">{relatedRole}</p>
                              </div>
                            </div>
                          )}

                          {notification.type === 'score_update' && (
                            <div className="flex items-center gap-4 mb-4 p-3 bg-purple-50 rounded-lg">
                              <div className="text-center">
                                <div className="text-sm text-gray-600">Previous</div>
                                <div className="text-2xl font-bold text-gray-500">{notification.data?.oldScore}</div>
                              </div>
                              <div className="text-purple-600">→</div>
                              <div className="text-center">
                                <div className="text-sm text-gray-600">Current</div>
                                <div className="text-2xl font-bold text-purple-600">{notification.data?.newScore}</div>
                              </div>
                            </div>
                          )}

                          {notification.type === 'review' && typeof notification.data?.newScore === 'number' && (
                            <div className="inline-flex items-center gap-2 mb-4 p-3 bg-orange-50 rounded-lg">
                              <TrendingUp className="w-5 h-5 text-orange-600" />
                              <span className="text-sm text-gray-600">Final Score:</span>
                              <span className="text-xl font-bold text-orange-600">{notification.data?.newScore}/100</span>
                            </div>
                          )}

                          {ideaTitle && (
                            <div className="text-sm text-gray-600 mb-4">
                              <span className="font-medium">Related to:</span> {ideaTitle}
                            </div>
                          )}

                          <div className="flex items-center gap-3">
                            {notification.actionRequired && (
                              <>
                                {notification.type === 'interest' && (
                                  <Button size="sm" className="bg-gradient-to-r from-brand-500 to-purple-600" onClick={() => {
                                    const related = notification.relatedUser as any;
                                    const ideaObj = notification.idea as any;
                                    if (related?._id && ideaObj?._id) {
                                      setChatTarget({ ideaId: ideaObj._id, peerId: related._id, peerName: related?.name, peerAvatar: related?.avatar });
                                    }
                                  }}>
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    Respond to Interest
                                  </Button>
                                )}
                                {notification.type === 'message' && (
                                  <Button size="sm" className="bg-gradient-to-r from-blue-500 to-cyan-600">
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    View Message
                                  </Button>
                                )}
                              </>
                            )}

                            {!notification.read && (
                              <Button size="sm" variant="outline" onClick={() => markAsRead(notification._id)}>
                                <Check className="w-4 h-4 mr-2" />
                                Mark as Read
                              </Button>
                            )}

                            <Button size="sm" variant="ghost">
                              <X className="w-4 h-4 mr-2" />
                              Dismiss
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>

          {items.length === 0 && !loading && (
            <motion.div variants={itemVariants}>
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No notifications yet</h3>
                  <p className="text-gray-600 mb-6">
                    When investors show interest in your ideas or send messages, you'll see them here.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
      {chatTarget && (
        <ChatWindow
          ideaId={chatTarget.ideaId}
          peerId={chatTarget.peerId}
          peerName={chatTarget.peerName}
          peerAvatar={chatTarget.peerAvatar}
          onClose={() => setChatTarget(null)}
        />
      )}
    </DashboardLayout>
  );
}
