import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Search, 
  TrendingUp, 
  Eye, 
  MessageSquare, 
  Users,
  Target,
  Star,
  ArrowRight,
  Zap,
  Award,
  BarChart3,
  Lightbulb,
  Filter,
  Clock,
  DollarSign,
  Building
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

// Mock data for investor dashboard
const stats = [
  { 
    title: "Ideas Reviewed", 
    value: "147", 
    change: "+23 this month", 
    icon: Eye,
    color: "text-blue-600"
  },
  { 
    title: "Interests Expressed", 
    value: "32", 
    change: "+8 this week", 
    icon: Star,
    color: "text-yellow-600"
  },
  { 
    title: "Connections Made", 
    value: "18", 
    change: "+5 this month", 
    icon: Users,
    color: "text-green-600"
  },
  { 
    title: "Portfolio Score", 
    value: "89.2", 
    change: "+2.1 points", 
    icon: Target,
    color: "text-purple-600"
  }
];

const trendingIdeas = [
  {
    id: 1,
    title: "AI-Powered Learning Platform",
    entrepreneur: "Sarah Chen",
    category: "EdTech",
    score: 92,
    stage: "Prototype",
    funding: "$2.5M",
    interests: 8,
    timeAgo: "2 days ago",
    description: "Personalized education through machine learning algorithms"
  },
  {
    id: 2,
    title: "Virtual Reality Therapy",
    entrepreneur: "Dr. Michael Rodriguez",
    category: "HealthTech",
    score: 91,
    stage: "Growth",
    funding: "$8.5M",
    interests: 15,
    timeAgo: "1 week ago",
    description: "Mental health treatment through immersive VR experiences"
  },
  {
    id: 3,
    title: "Blockchain Identity Verification",
    entrepreneur: "Alex Thompson",
    category: "FinTech",
    score: 88,
    stage: "Growth",
    funding: "$1.2M",
    interests: 6,
    timeAgo: "3 days ago",
    description: "Secure digital identity for the modern world"
  }
];

const recentActivities = [
  {
    type: "interest",
    title: "Expressed interest in \"Sustainable Food Delivery\"",
    entrepreneur: "Emma Wilson",
    time: "2 hours ago",
    icon: Star
  },
  {
    type: "message",
    title: "New message from John Doe about \"AI Healthcare Assistant\"",
    entrepreneur: "John Doe",
    time: "4 hours ago",
    icon: MessageSquare
  },
  {
    type: "connection",
    title: "Connected with Lisa Park for \"Green Energy Storage\"",
    entrepreneur: "Lisa Park",
    time: "1 day ago",
    icon: Users
  },
  {
    type: "review",
    title: "Reviewed \"Smart Home Security System\"",
    entrepreneur: "Robert Kim",
    time: "2 days ago",
    icon: Eye
  }
];

const quickActions = [
  {
    title: "Explore New Ideas",
    description: "Discover innovative startup concepts",
    icon: Search,
    href: "/investor/explore",
    gradient: "from-blue-500 to-cyan-600"
  },
  {
    title: "My Interests",
    description: "Review ideas you've shown interest in",
    icon: Star,
    href: "/investor/interests",
    gradient: "from-yellow-500 to-orange-600"
  },
  {
    title: "Portfolio Analytics",
    description: "Track your investment insights",
    icon: BarChart3,
    href: "/investor/analytics",
    gradient: "from-purple-500 to-pink-600"
  }
];

const investmentFocus = [
  { category: "AI/ML", percentage: 35, color: "bg-blue-500" },
  { category: "HealthTech", percentage: 28, color: "bg-green-500" },
  { category: "FinTech", percentage: 20, color: "bg-purple-500" },
  { category: "EdTech", percentage: 17, color: "bg-orange-500" }
];

export default function InvestorDashboard() {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Welcome Section */}
          <motion.div variants={itemVariants}>
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white relative overflow-hidden">
              <div className={"absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"6\" cy=\"6\" r=\"1\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"}></div>
              <div className="relative z-10">
                <h1 className="text-3xl font-bold mb-2">
                  Welcome back, {user?.name}! 💼
                </h1>
                <p className="text-lg opacity-90 mb-6">
                  Discover the next generation of innovative startups and connect with brilliant entrepreneurs.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/investor/explore">
                    <Button className="bg-white text-purple-600 hover:bg-gray-50">
                      <Search className="mr-2 w-4 h-4" />
                      Explore Ideas
                    </Button>
                  </Link>
                  <Button variant="outline" className="border-white text-white hover:bg-white/10">
                    <Building className="mr-2 w-4 h-4" />
                    Portfolio Overview
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div variants={itemVariants}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                        <p className="text-sm text-green-600 mt-1">{stat.change}</p>
                      </div>
                      <div className={`w-12 h-12 rounded-lg bg-gray-50 flex items-center justify-center ${stat.color}`}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants}>
            <div className="grid md:grid-cols-3 gap-6">
              {quickActions.map((action, index) => (
                <Link key={index} to={action.href}>
                  <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer">
                    <CardContent className="p-6">
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${action.gradient} flex items-center justify-center mb-4`}>
                        <action.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
                      <p className="text-gray-600 text-sm">{action.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Trending Ideas */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-xl font-semibold flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Trending Ideas
                  </CardTitle>
                  <Link to="/investor/explore">
                    <Button variant="outline" size="sm">
                      View All
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {trendingIdeas.map((idea) => (
                      <div key={idea.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-gray-900 hover:text-brand-600">
                                {idea.title}
                              </h4>
                              <Badge variant="secondary">{idea.category}</Badge>
                              <Badge className="bg-green-100 text-green-700">
                                {idea.stage}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{idea.description}</p>
                            <p className="text-xs text-gray-500">by {idea.entrepreneur} • {idea.timeAgo}</p>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-2xl font-bold text-brand-600">{idea.score}</div>
                            <div className="text-xs text-gray-600">AI Score</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              {idea.funding}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {idea.interests} interests
                            </span>
                          </div>
                          <Button size="sm" variant="outline">
                            <Star className="w-4 h-4 mr-1" />
                            Express Interest
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Investment Focus & Recent Activity */}
            <motion.div variants={itemVariants} className="space-y-6">
              {/* Investment Focus */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-600" />
                    Investment Focus
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {investmentFocus.map((focus, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">{focus.category}</span>
                          <span className="text-sm text-gray-600">{focus.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`${focus.color} h-2 rounded-full transition-all duration-300`}
                            style={{ width: `${focus.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.map((activity, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <activity.icon className="w-4 h-4 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 leading-relaxed">{activity.title}</p>
                          <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Market Insights */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-orange-600" />
                  Market Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                    <h4 className="font-semibold text-blue-900 mb-2">AI/ML Surge</h4>
                    <p className="text-sm text-blue-700">
                      AI-powered startups showing 40% higher investment interest this quarter
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                    <h4 className="font-semibold text-green-900 mb-2">Health Tech Growth</h4>
                    <p className="text-sm text-green-700">
                      Mental health and telemedicine solutions gaining significant traction
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                    <h4 className="font-semibold text-purple-900 mb-2">Sustainability Focus</h4>
                    <p className="text-sm text-purple-700">
                      Green tech and sustainable solutions attracting record funding
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
