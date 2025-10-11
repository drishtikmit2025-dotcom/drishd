import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Lightbulb, 
  TrendingUp, 
  Users, 
  Star, 
  Shield, 
  Zap,
  BarChart3,
  Brain,
  Target
} from "lucide-react";

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

const features = [
  {
    icon: Brain,
    title: "AI-Powered Evaluation",
    description: "Advanced ML algorithms analyze your startup idea across multiple dimensions for comprehensive scoring."
  },
  {
    icon: Target,
    title: "Expert Validation",
    description: "Connect with seasoned investors and get real-world feedback on your business concept."
  },
  {
    icon: BarChart3,
    title: "Market Insights",
    description: "Deep market analysis and competitive landscape evaluation to refine your positioning."
  },
  {
    icon: Users,
    title: "Founder Community",
    description: "Join a vibrant community of entrepreneurs and learn from successful startup journeys."
  }
];

const stats = [
  { number: "10K+", label: "Ideas Evaluated" },
  { number: "85%", label: "Success Rate" },
  { number: "500+", label: "Active Investors" },
  { number: "50M+", label: "Total Funding" }
];

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent">
                Drishti
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost" className="text-gray-600 hover:text-gray-900">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-gradient-to-r from-brand-500 to-purple-600 hover:from-brand-600 hover:to-purple-700 text-white shadow-lg">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <motion.section 
        className="pt-32 pb-20 px-4 sm:px-6 lg:px-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-7xl mx-auto text-center">
          <motion.div variants={itemVariants}>
            <Badge className="mb-4 bg-gradient-to-r from-brand-500/10 to-purple-600/10 text-brand-700 border-brand-200">
              <Star className="w-3 h-3 mr-1" />
              #1 Startup Idea Evaluator
            </Badge>
          </motion.div>
          
          <motion.h1 
            className="text-4xl sm:text-6xl lg:text-7xl font-bold mb-6"
            variants={itemVariants}
          >
            <span className="bg-gradient-to-r from-brand-600 via-purple-600 to-brand-700 bg-clip-text text-transparent">
              Evaluate Your
            </span>
            <br />
            <span className="text-gray-900">Startup Idea</span>
          </motion.h1>

          <motion.p 
            className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed"
            variants={itemVariants}
          >
            Get AI-powered insights, connect with investors, and validate your startup concept 
            with the platform trusted by thousands of entrepreneurs worldwide.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            variants={itemVariants}
          >
            <Link to="/signup">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-brand-500 to-purple-600 hover:from-brand-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-lg px-8 py-3"
              >
                Start Evaluating
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-2 border-brand-200 text-brand-700 hover:bg-brand-50 text-lg px-8 py-3"
            >
              Watch Demo
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div 
            className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto"
            variants={itemVariants}
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent">
                  {stat.number}
                </div>
                <div className="text-gray-600 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        className="py-20 px-4 sm:px-6 lg:px-8"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-16" variants={itemVariants}>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose <span className="bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent">Drishti</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive startup evaluation platform designed by entrepreneurs, for entrepreneurs
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="h-full bg-white/50 backdrop-blur-sm border-white/20 hover:shadow-lg transition-all duration-300 group hover:scale-105">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="py-20 px-4 sm:px-6 lg:px-8"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="bg-gradient-to-r from-brand-500 to-purple-600 rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden"
            variants={itemVariants}
          >
            <div className={"absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"6\" cy=\"6\" r=\"1\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"}></div>
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to Validate Your Next Big Idea?
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Join thousands of entrepreneurs who've successfully validated and launched their startups with Drishti.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/signup">
                  <Button 
                    size="lg" 
                    className="bg-white text-brand-600 hover:bg-gray-50 shadow-lg text-lg px-8 py-3"
                  >
                    Start Your Journey
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-3"
                >
                  Learn More
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">Drishti</span>
          </div>
          <p className="text-gray-400 mb-4">
            Empowering entrepreneurs to validate and launch successful startups.
          </p>
          <div className="flex justify-center space-x-6 text-sm text-gray-400">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Support</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
