import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, 
  TrendingUp, 
  Eye, 
  MessageSquare, 
  Clock,
  Lightbulb,
  Target,
  Users,
  ArrowRight,
  Zap,
  Award,
  BarChart3
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

// Mock data for the dashboard
const stats = [
  { 
    title: "Ideas Submitted", 
    value: "12", 
    change: "+3 this month", 
    icon: Lightbulb,
    color: "text-blue-600"
  },
  { 
    title: "Average Score", 
    value: "87.5", 
    change: "+5.2 points", 
    icon: Target,
    color: "text-green-600"
  },
  { 
    title: "Investor Interests", 
    value: "24", 
    change: "+8 this week", 
    icon: Users,
    color: "text-purple-600"
  },
  { 
    title: "Profile Views", 
    value: "156", 
    change: "+12 today", 
    icon: Eye,
    color: "text-orange-600"
  }
];

const recentSubmissions = [
  {
    id: 1,
    title: "AI-Powered Learning Platform",
    category: "EdTech",
    score: 92,
    status: "Under Review",
    submittedAt: "2 days ago",
    interests: 8
  },
  {
    id: 2,
    title: "Sustainable Food Delivery",
    category: "GreenTech",
    score: 85,
    status: "Reviewed",
    submittedAt: "1 week ago",
    interests: 12
  },
  {
    id: 3,
    title: "Blockchain Identity Verification",
    category: "FinTech",
    score: 88,
    status: "Active",
    submittedAt: "2 weeks ago",
    interests: 6
  }
];

const quickActions = [
  {
    title: "Submit New Idea",
    description: "Start evaluating your next startup concept",
    icon: Plus,
    href: "/entrepreneur/submit",
    gradient: "from-blue-500 to-purple-600"
  },
  {
    title: "View Submissions",
    description: "Check your idea submission history",
    icon: BarChart3,
    href: "/entrepreneur/submissions",
    gradient: "from-green-500 to-teal-600"
  },
  {
    title: "Investor Connections",
    description: "See who's interested in your ideas",
    icon: Users,
    href: "/entrepreneur/notifications",
    gradient: "from-orange-500 to-red-600"
  }
];

export default function EntrepreneurDashboard() {
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
            <div className="bg-gradient-to-r from-brand-500 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden">
              <div className={"absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"6\" cy=\"6\" r=\"1\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"}></div>
              <div className="relative z-10">
                <h1 className="text-3xl font-bold mb-2">
                  Welcome back, {user?.name}! 👋
                </h1>
                <p className="text-lg opacity-90 mb-6">
                  Ready to validate your next big idea? Let's turn your vision into reality.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/entrepreneur/submit">
                    <Button className="bg-white text-brand-600 hover:bg-gray-50">
                      <Plus className="mr-2 w-4 h-4" />
                      Submit New Idea
                    </Button>
                  </Link>
                  <Button variant="outline" className="border-white text-white hover:bg-white/10">
                    <Award className="mr-2 w-4 h-4" />
                    View Achievements
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

          {/* Recent Submissions */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl font-semibold">Recent Submissions</CardTitle>
                <Link to="/entrepreneur/submissions">
                  <Button variant="outline" size="sm">
                    View All
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentSubmissions.map((submission) => (
                    <div key={submission.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium text-gray-900">{submission.title}</h4>
                          <Badge variant="secondary">{submission.category}</Badge>
                          <Badge 
                            variant={submission.status === 'Active' ? 'default' : 'outline'}
                            className={submission.status === 'Active' ? 'bg-green-500' : ''}
                          >
                            {submission.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Target className="w-4 h-4" />
                            Score: {submission.score}/100
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {submission.interests} interests
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {submission.submittedAt}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-brand-600">{submission.score}</div>
                          <Progress value={submission.score} className="w-16 mt-1" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Performance Insights */}
          <motion.div variants={itemVariants}>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Performance Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Avg. Idea Score</span>
                      <span className="font-semibold text-green-600">+12% this month</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Investor Interest</span>
                      <span className="font-semibold text-green-600">+8% this week</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Profile Views</span>
                      <span className="font-semibold text-green-600">+25% this month</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-orange-600" />
                    Quick Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      <p className="text-sm font-medium text-blue-900">Market Research</p>
                      <p className="text-xs text-blue-700">Include customer validation data to boost your score</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                      <p className="text-sm font-medium text-green-900">Pitch Deck</p>
                      <p className="text-xs text-green-700">Upload a compelling pitch deck for better visibility</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                      <p className="text-sm font-medium text-purple-900">Network</p>
                      <p className="text-xs text-purple-700">Respond to investor interests promptly</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
