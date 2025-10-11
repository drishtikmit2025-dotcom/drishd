import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Lightbulb, 
  ArrowRight,
  Construction,
  MessageCircle
} from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6
    }
  }
};

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent">
                Drishti
              </span>
            </Link>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                Notifications
              </Button>
              <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                Settings
              </Button>
              <Button variant="outline">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          className="w-full max-w-2xl text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
            <CardHeader className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto">
                <Construction className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold text-gray-900">
                Dashboard Coming Soon
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-lg text-gray-600 leading-relaxed">
                We're building an amazing dashboard experience for you! This will include your personalized 
                workspace, idea submissions, investor connections, and AI-powered insights.
              </p>
              
              <div className="bg-gradient-to-r from-brand-50 to-purple-50 rounded-lg p-6 border border-brand-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  What's Coming:
                </h3>
                <ul className="space-y-2 text-left text-gray-700">
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-brand-500 rounded-full mr-3"></div>
                    Comprehensive idea submission forms
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-brand-500 rounded-full mr-3"></div>
                    Real-time AI evaluation and scoring
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-brand-500 rounded-full mr-3"></div>
                    Investor discovery and connections
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-brand-500 rounded-full mr-3"></div>
                    Advanced analytics and insights
                  </li>
                  <li className="flex items-center">
                    <div className="w-2 h-2 bg-brand-500 rounded-full mr-3"></div>
                    Collaborative workspace features
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/">
                  <Button className="bg-gradient-to-r from-brand-500 to-purple-600 hover:from-brand-600 hover:to-purple-700 text-white">
                    Back to Home
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Button variant="outline" className="border-brand-200 text-brand-700 hover:bg-brand-50">
                  <MessageCircle className="mr-2 w-4 h-4" />
                  Request Updates
                </Button>
              </div>

              <p className="text-sm text-gray-500">
                Want us to prioritize a specific feature? Let us know and we'll keep you updated on our progress!
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
