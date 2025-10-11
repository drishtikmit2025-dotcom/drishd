import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Calendar,
  ExternalLink,
  Lightbulb
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layouts/DashboardLayout";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6
    }
  }
};

// Mock notification data for investors
const notifications = [
  {
    id: 1,
    type: "new_idea",
    title: "New high-scoring idea in your focus area",
    message: "A new AI/ML startup idea scored 94/100 and matches your investment preferences",
    entrepreneur: "Sarah Chen",
    entrepreneurAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah-chen",
    ideaTitle: "Quantum Computing Simulator",
    category: "AI/ML",
    score: 94,
    time: "1 hour ago",
    unread: true,
    actionRequired: true
  },
  {
    id: 2,
    type: "response",
    title: "Entrepreneur responded to your interest",
    message: "John Doe accepted your connection request and sent a message",
    entrepreneur: "John Doe",
    entrepreneurAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=john-doe",
    ideaTitle: "AI-Powered Learning Platform",
    time: "3 hours ago",
    unread: true,
    actionRequired: true
  },
  {
    id: 3,
    type: "connection",
    title: "New connection established",
    message: "You are now connected with Emma Wilson",
    entrepreneur: "Emma Wilson",
    entrepreneurAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emma-wilson",
    ideaTitle: "Sustainable Food Delivery",
    time: "5 hours ago",
    unread: false,
    actionRequired: false
  },
  {
    id: 4,
    type: "trending",
    title: "Trending idea in your category",
    message: "HealthTech idea 'Virtual Reality Therapy' is gaining investor attention",
    entrepreneur: "Dr. Michael Rodriguez",
    entrepreneurAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=michael-rodriguez",
    ideaTitle: "Virtual Reality Therapy",
    category: "HealthTech",
    score: 91,
    interests: 15,
    time: "1 day ago",
    unread: false,
    actionRequired: false
  },
  {
    id: 5,
    type: "weekly_digest",
    title: "Weekly investment digest",
    message: "5 new ideas in your focus areas, 3 entrepreneurs responded to interests",
    stats: {
      newIdeas: 5,
      responses: 3,
      connections: 2
    },
    time: "2 days ago",
    unread: false,
    actionRequired: false
  },
  {
    id: 6,
    type: "market_update",
    title: "Market insight update",
    message: "AI/ML sector showing 40% increase in high-quality submissions this month",
    category: "AI/ML",
    trend: "+40%",
    time: "3 days ago",
    unread: false,
    actionRequired: false
  }
];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "new_idea":
      return Lightbulb;
    case "response":
      return MessageSquare;
    case "connection":
      return Users;
    case "trending":
      return TrendingUp;
    case "weekly_digest":
      return Calendar;
    case "market_update":
      return Eye;
    default:
      return Bell;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case "new_idea":
      return "text-green-600 bg-green-50";
    case "response":
      return "text-blue-600 bg-blue-50";
    case "connection":
      return "text-purple-600 bg-purple-50";
    case "trending":
      return "text-orange-600 bg-orange-50";
    case "weekly_digest":
      return "text-gray-600 bg-gray-50";
    case "market_update":
      return "text-cyan-600 bg-cyan-50";
    default:
      return "text-gray-600 bg-gray-50";
  }
};

export default function InvestorNotifications() {
  const { user } = useAuth();
  const unreadCount = notifications.filter(n => n.unread).length;

  const markAsRead = (id: number) => {
    // Implementation for marking notification as read
    console.log(`Marking notification ${id} as read`);
  };

  const markAllAsRead = () => {
    // Implementation for marking all notifications as read
    console.log("Marking all notifications as read");
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Bell className="w-8 h-8 text-purple-600" />
                Notifications
                {unreadCount > 0 && (
                  <Badge className="bg-red-500 text-white">
                    {unreadCount} new
                  </Badge>
                )}
              </h1>
              <p className="text-gray-600">Stay updated with new opportunities and entrepreneur responses</p>
            </div>
            {unreadCount > 0 && (
              <Button onClick={markAllAsRead} variant="outline">
                <Check className="w-4 h-4 mr-2" />
                Mark All as Read
              </Button>
            )}
          </motion.div>

          {/* Notifications List */}
          <motion.div variants={containerVariants} className="space-y-4">
            {notifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              const colorClasses = getNotificationColor(notification.type);
              
              return (
                <motion.div key={notification.id} variants={itemVariants}>
                  <Card className={`transition-all duration-300 hover:shadow-md ${notification.unread ? 'ring-2 ring-purple-200 bg-purple-50/30' : ''}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${colorClasses}`}>
                          <Icon className="w-6 h-6" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {notification.title}
                            </h3>
                            <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                              <span className="text-sm text-gray-500">{notification.time}</span>
                              {notification.unread && (
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-gray-700 mb-3">{notification.message}</p>

                          {/* Entrepreneur Info */}
                          {notification.entrepreneur && (
                            <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={notification.entrepreneurAvatar} alt={notification.entrepreneur} />
                                <AvatarFallback>
                                  {notification.entrepreneur.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{notification.entrepreneur}</p>
                                {notification.ideaTitle && (
                                  <p className="text-sm text-gray-600">{notification.ideaTitle}</p>
                                )}
                              </div>
                              {notification.score && (
                                <div className="text-right">
                                  <div className="text-xl font-bold text-green-600">{notification.score}</div>
                                  <div className="text-xs text-gray-600">AI Score</div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Idea Stats */}
                          {notification.type === 'trending' && notification.interests && (
                            <div className="flex items-center gap-4 mb-4 p-3 bg-orange-50 rounded-lg">
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-orange-600" />
                                <span className="text-sm text-gray-600">{notification.interests} investor interests</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary">{notification.category}</Badge>
                              </div>
                            </div>
                          )}

                          {/* Weekly Digest Stats */}
                          {notification.type === 'weekly_digest' && notification.stats && (
                            <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                              <div className="text-center">
                                <div className="text-lg font-bold text-gray-900">{notification.stats.newIdeas}</div>
                                <div className="text-xs text-gray-600">New Ideas</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-gray-900">{notification.stats.responses}</div>
                                <div className="text-xs text-gray-600">Responses</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-gray-900">{notification.stats.connections}</div>
                                <div className="text-xs text-gray-600">Connections</div>
                              </div>
                            </div>
                          )}

                          {/* Market Update */}
                          {notification.type === 'market_update' && notification.trend && (
                            <div className="inline-flex items-center gap-2 mb-4 p-3 bg-cyan-50 rounded-lg">
                              <TrendingUp className="w-5 h-5 text-cyan-600" />
                              <span className="text-sm text-gray-600">Trend:</span>
                              <span className="text-lg font-bold text-cyan-600">{notification.trend}</span>
                              <Badge variant="secondary">{notification.category}</Badge>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex items-center gap-3">
                            {notification.actionRequired && (
                              <>
                                {notification.type === 'new_idea' && (
                                  <Button size="sm" className="bg-gradient-to-r from-green-500 to-emerald-600">
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Idea
                                  </Button>
                                )}
                                {notification.type === 'response' && (
                                  <Button size="sm" className="bg-gradient-to-r from-blue-500 to-cyan-600">
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    View Message
                                  </Button>
                                )}
                                <Button size="sm" variant="outline">
                                  <Star className="w-4 h-4 mr-2" />
                                  Express Interest
                                </Button>
                              </>
                            )}
                            
                            {notification.unread && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => markAsRead(notification.id)}
                              >
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

          {/* Empty State */}
          {notifications.length === 0 && (
            <motion.div variants={itemVariants}>
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No notifications yet</h3>
                  <p className="text-gray-600 mb-6">
                    When new opportunities match your interests or entrepreneurs respond, you'll see them here.
                  </p>
                  <Button className="bg-gradient-to-r from-purple-500 to-blue-600">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Explore Ideas
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
