import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { 
  Search, 
  Filter, 
  Star, 
  Eye, 
  Users,
  DollarSign,
  Calendar,
  Target,
  TrendingUp,
  SlidersHorizontal,
  Grid,
  List,
  ArrowUpDown,
  MapPin,
  Globe,
  Building,
  Lightbulb
} from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import ChatWindow from "@/components/chat/ChatWindow";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.4
    }
  }
};

// Fallback data for demo purposes (used when API fails)
const fallbackIdeas = [
  {
    id: 1,
    title: "AI-Powered Learning Platform",
    tagline: "Personalized education through machine learning algorithms",
    entrepreneur: "Sarah Chen",
    entrepreneurAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah",
    category: "EdTech",
    score: 92,
    stage: "Prototype",
    funding: "$2.5M",
    location: "San Francisco, CA",
    interests: 8,
    views: 156,
    submittedAt: "2024-01-15",
    description: "Revolutionary AI platform that adapts to individual learning styles and provides personalized curriculum paths for students of all ages.",
    tags: ["AI", "Education", "Machine Learning", "SaaS"],
    teamSize: 5,
    revenue: "Pre-revenue",
    featured: true
  },
  {
    id: 2,
    title: "Sustainable Food Delivery",
    tagline: "Zero-waste food delivery using smart packaging",
    entrepreneur: "Emma Wilson",
    entrepreneurAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=emma",
    category: "GreenTech",
    score: 85,
    stage: "Early Customers",
    funding: "$5M",
    location: "Portland, OR",
    interests: 12,
    views: 243,
    submittedAt: "2024-01-08",
    description: "Innovative food delivery service that eliminates packaging waste through reusable smart containers and optimized logistics.",
    tags: ["Sustainability", "Food Tech", "Logistics", "IoT"],
    teamSize: 8,
    revenue: "$50K MRR",
    featured: false
  },
  {
    id: 3,
    title: "Virtual Reality Therapy",
    tagline: "Mental health treatment through immersive VR experiences",
    entrepreneur: "Dr. Michael Rodriguez",
    entrepreneurAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=michael",
    category: "HealthTech",
    score: 91,
    stage: "Growth",
    funding: "$8.5M",
    location: "Boston, MA",
    interests: 15,
    views: 367,
    submittedAt: "2023-12-28",
    description: "Cutting-edge VR therapy platform helping patients overcome phobias, PTSD, and anxiety disorders through controlled virtual environments.",
    tags: ["VR", "Mental Health", "Healthcare", "B2B"],
    teamSize: 12,
    revenue: "$200K MRR",
    featured: true
  },
  {
    id: 4,
    title: "Blockchain Identity Verification",
    tagline: "Secure digital identity for the modern world",
    entrepreneur: "Alex Thompson",
    entrepreneurAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex",
    category: "FinTech",
    score: 88,
    stage: "Growth",
    funding: "$1.2M",
    location: "New York, NY",
    interests: 6,
    views: 189,
    submittedAt: "2024-01-01",
    description: "Decentralized identity verification system using blockchain technology to provide secure, privacy-focused digital identity solutions.",
    tags: ["Blockchain", "Security", "Identity", "Web3"],
    teamSize: 7,
    revenue: "$80K MRR",
    featured: false
  },
  {
    id: 5,
    title: "Smart Home Energy Manager",
    tagline: "AI-driven home energy optimization",
    entrepreneur: "Lisa Park",
    entrepreneurAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=lisa",
    category: "IoT",
    score: 78,
    stage: "Idea",
    funding: "Pre-seed",
    location: "Austin, TX",
    interests: 4,
    views: 89,
    submittedAt: "2024-01-20",
    description: "Intelligent home energy management system that optimizes energy consumption, reduces costs, and integrates with renewable energy sources.",
    tags: ["IoT", "Energy", "Smart Home", "AI"],
    teamSize: 3,
    revenue: "Pre-revenue",
    featured: false
  },
  {
    id: 6,
    title: "Quantum Computing Simulator",
    tagline: "Making quantum computing accessible to developers",
    entrepreneur: "Robert Kim",
    entrepreneurAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=robert",
    category: "AI/ML",
    score: 89,
    stage: "Prototype",
    funding: "$3M",
    location: "Seattle, WA",
    interests: 11,
    views: 298,
    submittedAt: "2024-01-12",
    description: "Cloud-based quantum computing simulator that allows developers to experiment with quantum algorithms without expensive hardware.",
    tags: ["Quantum", "Cloud", "Developer Tools", "SaaS"],
    teamSize: 6,
    revenue: "Pre-revenue",
    featured: true
  }
];

const categories = ["All", "AI/ML", "EdTech", "FinTech", "HealthTech", "GreenTech", "IoT", "SaaS"];
const stages = ["All", "Idea", "Prototype", "Early Customers", "Growth", "Scaling"];
const sortOptions = [
  { value: "score", label: "Highest Score" },
  { value: "recent", label: "Most Recent" },
  { value: "interests", label: "Most Interests" },
  { value: "views", label: "Most Views" }
];

export default function ExploreIdeas() {
  const [searchQuery, setSearchQuery] = useState("");
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('search');
      if (q) setSearchQuery(q);
    } catch {}
  }, []);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStage, setSelectedStage] = useState("All");
  const [sortBy, setSortBy] = useState("score");
  const [scoreRange, setScoreRange] = useState([0]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [onlyFeatured, setOnlyFeatured] = useState(false);
  const [allIdeas, setAllIdeas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [selectedIdea, setSelectedIdea] = useState<any | null>(null);
  const [interestLoading, setInterestLoading] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [serverNote, setServerNote] = useState<string | null>(null);
  const [chatForIdea, setChatForIdea] = useState<any | null>(null);
  const { user } = useAuth();

  // Load ideas from API with real-time polling
  useEffect(() => {
    const loadIdeas = async () => {
      try {
        const { ideasApi } = await import('@/lib/api');
        const response = await ideasApi.getAll({
          category: selectedCategory !== "All" ? selectedCategory : undefined,
          stage: selectedStage !== "All" ? selectedStage : undefined,
          minScore: scoreRange[0],
          sort: sortBy,
          search: searchQuery,
          featured: onlyFeatured ? "true" : undefined
        });

        if ((response as any).demo) {
          setDemoMode(true);
          setServerNote((response as any).message || null);
          setAllIdeas([]);
        } else {
          setDemoMode(false);
          setServerNote(null);
          setAllIdeas(response.ideas || []);
        }
        setLastUpdated(new Date());
        setLoading(false);
      } catch (error) {
        console.error('Failed to load ideas:', error);
        setLoading(false);
      }
    };

    loadIdeas();

    // Set up polling for real-time updates every 3 seconds
    const pollInterval = setInterval(loadIdeas, 3000);

    return () => clearInterval(pollInterval);
  }, [selectedCategory, selectedStage, sortBy, scoreRange, searchQuery, onlyFeatured]);

  // Real-time update indicator
  const minutesSinceUpdate = Math.floor((new Date().getTime() - lastUpdated.getTime()) / 60000);

  // Filter and sort ideas (handle both API and mock data formats)
  const filteredIdeas = allIdeas.filter(idea => {
    const title = idea.title || '';
    const tagline = idea.tagline || '';
    const entrepreneurName = typeof idea.entrepreneur === 'string' ? idea.entrepreneur : (idea.entrepreneur?.name || '');
    const tags = idea.tags || [];
    const score = idea.score || idea.aiScore || 0;

    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entrepreneurName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (Array.isArray(tags) && tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesCategory = selectedCategory === "All" || idea.category === selectedCategory;
    const matchesStage = selectedStage === "All" || idea.stage === selectedStage;
    const matchesScore = score >= scoreRange[0];
    const matchesFeatured = !onlyFeatured || idea.featured;

    return matchesSearch && matchesCategory && matchesStage && matchesScore && matchesFeatured;
  }).sort((a, b) => {
    const aScore = a.score || a.aiScore || 0;
    const bScore = b.score || b.aiScore || 0;
    const aInterests = Array.isArray(a.interests) ? a.interests.length : (a.interests || 0);
    const bInterests = Array.isArray(b.interests) ? b.interests.length : (b.interests || 0);
    const aDate = a.submittedAt || a.createdAt || '1970-01-01';
    const bDate = b.submittedAt || b.createdAt || '1970-01-01';

    switch (sortBy) {
      case "score":
        return bScore - aScore;
      case "recent":
        return new Date(bDate).getTime() - new Date(aDate).getTime();
      case "interests":
        return bInterests - aInterests;
      case "views":
        return (b.views || 0) - (a.views || 0);
      default:
        return 0;
    }
  });

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "Idea": return "bg-gray-100 text-gray-700";
      case "Prototype": return "bg-blue-100 text-blue-700";
      case "Early Customers": return "bg-yellow-100 text-yellow-700";
      case "Growth": return "bg-green-100 text-green-700";
      case "Scaling": return "bg-purple-100 text-purple-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const IdeaCard = ({ idea, isListView = false }: { idea: any, isListView?: boolean }) => (
    <motion.div variants={itemVariants}>
      <Card className={`hover:shadow-lg transition-all duration-300 cursor-pointer group ${isListView ? 'mb-4' : ''}`}>
        <CardContent className={`${isListView ? 'p-4' : 'p-6'}`}>
          <div className={`flex ${isListView ? 'items-center gap-6' : 'flex-col'}`}>
            {/* Main Content */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {idea.featured && (
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    )}
                    <h3 className={`font-semibold text-gray-900 group-hover:text-brand-600 ${isListView ? 'text-lg' : 'text-xl'}`}>
                      {idea.title}
                    </h3>
                    <Badge variant="secondary">{idea.category}</Badge>
                    <Badge className={getStageColor(idea.stage)}>
                      {idea.stage}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-3">{idea.tagline}</p>
                  
                  {!isListView && (
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{idea.description}</p>
                  )}
                  
                  {/* Entrepreneur Info */}
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={typeof idea.entrepreneur === 'object' ? idea.entrepreneur.avatar : idea.entrepreneurAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=default`}
                      alt={typeof idea.entrepreneur === 'object' ? idea.entrepreneur.name : idea.entrepreneur || 'Entrepreneur'}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {typeof idea.entrepreneur === 'object' ? idea.entrepreneur.name : idea.entrepreneur || 'Anonymous'}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {typeof idea.entrepreneur === 'object' ? idea.entrepreneur.location : idea.location || 'Location not specified'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Tags */}
                  {!isListView && idea.tags && Array.isArray(idea.tags) && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {idea.tags.slice(0, 4).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Score */}
                <div className="text-right ml-4">
                  <div className={`text-3xl font-bold ${getScoreColor(idea.score || idea.aiScore || 0)}`}>
                    {idea.score || idea.aiScore || 0}
                  </div>
                  <div className="text-xs text-gray-600 mb-1">AI Score</div>
                  <Progress value={idea.score || idea.aiScore || 0} className="w-16 h-1" />
                </div>
              </div>
              
              {/* Metrics */}
              <div className={`grid ${isListView ? 'grid-cols-4' : 'grid-cols-2 md:grid-cols-4'} gap-4 mb-4`}>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{idea.funding || 'TBD'}</div>
                  <div className="text-xs text-gray-600">Target</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{idea.views || 0}</div>
                  <div className="text-xs text-gray-600">Views</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">
                    {Array.isArray(idea.interests) ? idea.interests.length : (idea.interests || 0)}
                  </div>
                  <div className="text-xs text-gray-600">Interests</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">{idea.teamSize || 'N/A'}</div>
                  <div className="text-xs text-gray-600">Team</div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex gap-2">
                <Button size="sm" className="flex-1" onClick={() => setSelectedIdea(idea)}>
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
                <Button size="sm" variant="outline" className="flex-1" onClick={async () => {
                  try {
                    setInterestLoading(true);
                    const { ideasApi } = await import('@/lib/api');
                    const id = idea.id || idea._id;
                    await ideasApi.expressInterest(id);
                    toast.success('Interest expressed');
                    // optimistic update
                    setAllIdeas((prev) => prev.map((it) => (it.id === id || it._id === id)
                      ? { ...it, interests: Array.isArray(it.interests) ? [...it.interests, { investor: user?._id }] : ((it.interests || 0) + 1) }
                      : it));
                    setChatForIdea(idea);
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : 'Failed to express interest');
                  } finally {
                    setInterestLoading(false);
                  }
                }} disabled={interestLoading}>
                  <Star className="w-4 h-4 mr-2" />
                  {interestLoading ? 'Please wait…' : 'Express Interest'}
                </Button>
                <Button size="sm" className="flex-1" variant="secondary" onClick={() => setChatForIdea(idea)} disabled={!(Array.isArray(idea.interests) && user?._id && idea.interests.some((it: any) => (it?.investor === user._id) || (typeof it === 'object' && it?.investor?._id === user._id)))}>
                  Message
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore Startup Ideas</h1>
              <p className="text-gray-600">Discover innovative startups seeking investment</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>

          {/* Search and Filters */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search ideas, entrepreneurs, or tags..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 text-lg h-12"
                    />
                  </div>
                  
                  {/* Quick Filters */}
                  <div className="flex flex-wrap items-center gap-4">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select value={selectedStage} onValueChange={setSelectedStage}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Stage" />
                      </SelectTrigger>
                      <SelectContent>
                        {stages.map(stage => (
                          <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        {sortOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Button
                      variant="outline"
                      onClick={() => setShowFilters(!showFilters)}
                      className="flex items-center gap-2"
                    >
                      <SlidersHorizontal className="w-4 h-4" />
                      Advanced Filters
                    </Button>
                  </div>
                  
                  {/* Advanced Filters */}
                  {showFilters && (
                    <div className="grid md:grid-cols-2 gap-6 pt-4 border-t">
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-700">
                          Minimum AI Score: {scoreRange[0]}
                        </label>
                        <Slider
                          value={scoreRange}
                          onValueChange={setScoreRange}
                          max={100}
                          min={0}
                          step={5}
                          className="w-full"
                        />
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="featured"
                            checked={onlyFeatured}
                            onCheckedChange={(checked) => setOnlyFeatured(checked as boolean)}
                          />
                          <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                            Featured ideas only
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Results Count and Real-time Indicator */}
          <motion.div variants={itemVariants}>
            <div className="flex justify-between items-center">
              <p className="text-gray-600">
                Showing {filteredIdeas.length} of {allIdeas.length} startup ideas
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>
                  Last updated: {minutesSinceUpdate === 0 ? 'Just now' : `${minutesSinceUpdate}m ago`}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Ideas Grid/List */}
          <motion.div variants={containerVariants}>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-gray-500">Loading startup ideas...</div>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredIdeas.map((idea) => (
                  <IdeaCard key={idea.id || idea._id} idea={idea} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredIdeas.map((idea) => (
                  <IdeaCard key={idea.id || idea._id} idea={idea} isListView />
                ))}
              </div>
            )}
          </motion.div>

          {/* Empty State */}
          {filteredIdeas.length === 0 && (
            <motion.div variants={itemVariants}>
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No ideas found</h3>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your search criteria or filters to discover more startup ideas.
                  </p>
                  <Button onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                    setSelectedStage("All");
                    setScoreRange([70]);
                    setOnlyFeatured(false);
                  }}>
                    Clear All Filters
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>

      <Dialog open={!!selectedIdea} onOpenChange={(o) => !o && setSelectedIdea(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedIdea?.title}</DialogTitle>
            <DialogDescription>{selectedIdea?.tagline}</DialogDescription>
          </DialogHeader>
          {selectedIdea && (
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{selectedIdea.category}</Badge>
                <Badge>{selectedIdea.stage}</Badge>
              </div>
              <p className="text-gray-700">{selectedIdea.description}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="text-center p-3 bg-gray-50 rounded">
                  <div className="text-xl font-bold">{selectedIdea.score || selectedIdea.aiScore || 0}</div>
                  <div className="text-xs text-gray-600">AI Score</div>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded">
                  <div className="text-xl font-bold text-blue-600">{selectedIdea.views || 0}</div>
                  <div className="text-xs text-gray-600">Views</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded">
                  <div className="text-xl font-bold text-purple-600">{Array.isArray(selectedIdea.interests) ? selectedIdea.interests.length : (selectedIdea.interests || 0)}</div>
                  <div className="text-xs text-gray-600">Interests</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded">
                  <div className="text-sm font-bold text-green-600">{selectedIdea.funding || 'TBD'}</div>
                  <div className="text-xs text-gray-600">Target</div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedIdea(null)}>Close</Button>
            {selectedIdea && (
              <Button onClick={async () => {
                try {
                  setInterestLoading(true);
                  const { ideasApi } = await import('@/lib/api');
                  const id = selectedIdea.id || selectedIdea._id;
                  await ideasApi.expressInterest(id);
                  toast.success('Interest expressed');
                  setAllIdeas((prev) => prev.map((it) => (it.id === id || it._id === id)
                    ? { ...it, interests: Array.isArray(it.interests) ? [...it.interests, { investor: user?._id }] : ((it.interests || 0) + 1) }
                    : it));
                  setChatForIdea(selectedIdea);
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : 'Failed to express interest');
                } finally {
                  setInterestLoading(false);
                }
              }} disabled={interestLoading}>
                {interestLoading ? 'Please wait…' : 'Express Interest'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {chatForIdea && (
        <ChatWindow
          ideaId={(chatForIdea.id || chatForIdea._id) as string}
          peerId={typeof chatForIdea.entrepreneur === 'object' ? chatForIdea.entrepreneur._id : undefined}
          peerName={typeof chatForIdea.entrepreneur === 'object' ? chatForIdea.entrepreneur.name : undefined}
          peerAvatar={typeof chatForIdea.entrepreneur === 'object' ? chatForIdea.entrepreneur.avatar : undefined}
          onClose={() => setChatForIdea(null)}
        />
      )}
    </DashboardLayout>
  );
}
