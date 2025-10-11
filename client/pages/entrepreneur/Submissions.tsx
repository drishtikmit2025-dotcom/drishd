import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Search,
  Eye,
  Edit,
  Trash2,
  Plus,
  TrendingUp,
  Users,
  Clock,
  Target,
  Globe,
  Lock,
  Share2,
  Calendar
} from "lucide-react";
import { toast } from "sonner";
import SwotAnalysis from "@/components/SwotAnalysis";
import SimilarIdeas from "@/components/SimilarIdeas";
import { generateSWOT } from "@/lib/pitch";
import { findSimilarIdeas, SimilarityScore } from "@/lib/similarityAnalysis";
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

// Fallback data for demo mode
const fallbackSubmissions = [
  {
    _id: '1',
    title: "AI-Powered Learning Platform",
    tagline: "Personalized education through machine learning",
    category: "EdTech",
    aiScore: 92,
    status: "under_review",
    visibility: "public",
    createdAt: "2024-01-15",
    updatedAt: "2024-01-17",
    interests: [{investor: 'inv1'}, {investor: 'inv2'}, {investor: 'inv3'}, {investor: 'inv4'}, {investor: 'inv5'}, {investor: 'inv6'}, {investor: 'inv7'}, {investor: 'inv8'}],
    views: 156,
    stage: "Prototype"
  },
  {
    _id: '2',
    title: "Sustainable Food Delivery",
    tagline: "Zero-waste food delivery using smart packaging",
    category: "GreenTech",
    aiScore: 85,
    status: "reviewed",
    visibility: "public",
    createdAt: "2024-01-08",
    updatedAt: "2024-01-12",
    interests: Array(12).fill({investor: 'inv'}),
    views: 243,
    stage: "Early Customers"
  }
];

const statusColors: any = {
  "Draft": "bg-gray-100 text-gray-700",
  "Under Review": "bg-yellow-100 text-yellow-700",
  "Reviewed": "bg-blue-100 text-blue-700",
  "Active": "bg-green-100 text-green-700",
  "Featured": "bg-purple-100 text-purple-700",
  "Archived": "bg-red-100 text-red-700"
};

const getId = (s: any) => s._id || s.id;
const getScore = (s: any) => (typeof s.score === 'number' ? s.score : (typeof s.aiScore === 'number' ? s.aiScore : 0));
const getInterestsCount = (s: any) => Array.isArray(s.interests) ? s.interests.length : (s.interests || 0);

export default function MySubmissions() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewItem, setViewItem] = useState<any | null>(null);
  const [editItem, setEditItem] = useState<any | null>(null);
  const [deleteItem, setDeleteItem] = useState<any | null>(null);
  const [similarView, setSimilarView] = useState<SimilarityScore[]>([]);
  const [similarLoading, setSimilarLoading] = useState(false);

  // Load submissions from API
  useEffect(() => {
    const loadSubmissions = async () => {
      try {
        setLoading(true);
        const { ideasApi } = await import('@/lib/api');
        const response = await ideasApi.getMyIdeas();
        setSubmissions(response.ideas || []);
        setError(null);
      } catch (err) {
        console.error('Failed to load submissions:', err);
        // Try localStorage fallback before demo data
        try {
          const local = JSON.parse(localStorage.getItem('local_ideas') || '[]');
          setSubmissions(local || []);
          setError(null);
        } catch (e) {
          console.warn('Failed to read local submissions', e);
          setError('Failed to load submissions');
          // Use fallback data for demo mode
          setSubmissions(fallbackSubmissions);
        }
      } finally {
        setLoading(false);
      }
    };

    loadSubmissions();
  }, []);

  // Helper function to format status for display
  const formatStatus = (status: string) => {
    const statusMap: any = {
      'draft': 'Draft',
      'pending': 'Under Review',
      'under_review': 'Under Review',
      'reviewed': 'Reviewed',
      'active': 'Active',
      'featured': 'Featured',
      'archived': 'Archived'
    };
    return statusMap[status] || status;
  };

  // Generate SWOT for the selected item
  const viewSwot = useMemo(() => (viewItem ? generateSWOT(viewItem) : null), [viewItem]);

  // Load similar ideas for the selected item
  useEffect(() => {
    const run = async () => {
      if (!viewItem) {
        setSimilarView([]);
        return;
      }
      try {
        setSimilarLoading(true);
        const { ideasApi } = await import('@/lib/api');
        const res = await ideasApi.getAll({});
        const list = res.ideas || [];
        const sims = findSimilarIdeas(viewItem, list, 6);
        setSimilarView(sims);
      } catch (e) {
        console.error('Similar ideas load failed', e);
        setSimilarView([]);
      } finally {
        setSimilarLoading(false);
      }
    };
    run();
  }, [viewItem]);

  // Helper function to format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
  };

  const filteredSubmissions = submissions.filter(submission => {
    const title = submission.title || '';
    const tagline = submission.tagline || '';
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tagline.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || formatStatus(submission.status || '').toLowerCase() === filterStatus.toLowerCase();
    const matchesCategory = filterCategory === "all" || submission.category === filterCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 80) return "text-blue-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Submissions</h1>
              <p className="text-gray-600">Track and manage your startup idea submissions</p>
            </div>
            <Link to="/entrepreneur/submit">
              <Button className="bg-gradient-to-r from-brand-500 to-purple-600 hover:from-brand-600 hover:to-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Submit New Idea
              </Button>
            </Link>
          </motion.div>

          {/* Stats Overview */}
          <motion.div variants={itemVariants}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                      <p className="text-3xl font-bold text-gray-900">{submissions.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Target className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Average Score</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {(() => {
                          const scores = submissions.map(getScore);
                          const count = scores.filter((n: number) => typeof n === 'number').length;
                          if (count === 0) return 0;
                          const sum = scores.reduce((acc: number, n: number) => acc + (Number.isFinite(n) ? n : 0), 0);
                          return Math.round(sum / count);
                        })()}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Interests</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {submissions.reduce((acc, sub) => acc + getInterestsCount(sub), 0)}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Views</p>
                      <p className="text-3xl font-bold text-gray-900">
                        {submissions.reduce((acc, sub) => acc + sub.views, 0)}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                      <Eye className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Search and Filters */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search submissions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="flex gap-4">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Under Review">Under Review</SelectItem>
                        <SelectItem value="Reviewed">Reviewed</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Featured">Featured</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Filter by category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="EdTech">EdTech</SelectItem>
                        <SelectItem value="FinTech">FinTech</SelectItem>
                        <SelectItem value="HealthTech">HealthTech</SelectItem>
                        <SelectItem value="GreenTech">GreenTech</SelectItem>
                        <SelectItem value="IoT">IoT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Submissions List */}
          <motion.div variants={itemVariants} className="space-y-6">
            {filteredSubmissions.map((submission) => (
              <motion.div key={getId(submission)} variants={itemVariants}>
                <Card className="hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Main Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-semibold text-gray-900 hover:text-brand-600 cursor-pointer">
                                {submission.title}
                              </h3>
                              <Badge variant="secondary">{submission.category}</Badge>
                              <Badge className={statusColors[formatStatus(submission.status || '') as keyof typeof statusColors]}>
                                {formatStatus(submission.status || '')}
                              </Badge>
                              {submission.visibility === "private" ? (
                                <Lock className="w-4 h-4 text-gray-400" />
                              ) : (
                                <Globe className="w-4 h-4 text-green-500" />
                              )}
                            </div>
                            <p className="text-gray-600 mb-3">{submission.tagline}</p>
                            
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                Submitted: {formatDate(submission.submittedAt || submission.createdAt)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                Updated: {formatDate(submission.lastUpdated || submission.updatedAt || submission.createdAt)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Target className="w-4 h-4" />
                                Stage: {submission.stage}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className={`text-2xl font-bold ${getScoreColor(getScore(submission))}`}>
                              {getScore(submission)}
                            </div>
                            <div className="text-xs text-gray-600">AI Score</div>
                            <Progress value={getScore(submission)} className="mt-1 h-1" />
                          </div>
                          
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{submission.views}</div>
                            <div className="text-xs text-gray-600">Views</div>
                          </div>
                          
                          <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">{getInterestsCount(submission)}</div>
                            <div className="text-xs text-gray-600">Interests</div>
                          </div>
                          
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="text-sm font-bold text-green-600">{submission.funding || 'TBD'}</div>
                            <div className="text-xs text-gray-600">Target</div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 min-w-fit">
                        <Button variant="outline" size="sm" className="justify-start" onClick={() => navigate(`/entrepreneur/idea/${getId(submission)}/result`, { state: { idea: submission } })}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        <Button variant="outline" size="sm" className="justify-start" onClick={() => setEditItem(submission)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="justify-start"
                          onClick={() => {
                            try {
                              const url = `${window.location.origin}/investor/explore?search=${encodeURIComponent(submission.title || '')}`;
                              navigator.clipboard.writeText(url);
                              toast.success('Share link copied to clipboard');
                            } catch {
                              toast.error('Failed to copy share link');
                            }
                          }}
                        >
                          <Share2 className="w-4 h-4 mr-2" />
                          Share
                        </Button>
                        <Button variant="outline" size="sm" className="justify-start text-red-600 hover:text-red-700" onClick={() => setDeleteItem(submission)}>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Empty State */}
          {filteredSubmissions.length === 0 && (
            <motion.div variants={itemVariants}>
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No submissions found</h3>
                  <p className="text-gray-600 mb-6">
                    {searchQuery || filterStatus !== "all" || filterCategory !== "all" 
                      ? "Try adjusting your search or filters" 
                      : "Start by submitting your first startup idea"}
                  </p>
                  <Link to="/entrepreneur/submit">
                    <Button className="bg-gradient-to-r from-brand-500 to-purple-600 hover:from-brand-600 hover:to-purple-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Submit Your First Idea
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* View Dialog */}
      <Dialog open={!!viewItem} onOpenChange={(o) => !o && setViewItem(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>{viewItem?.title}</span>
              {viewItem && (
                <Badge className="ml-2">{getScore(viewItem)} / 100</Badge>
              )}
            </DialogTitle>
            <DialogDescription>{viewItem?.tagline}</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="swot">SWOT</TabsTrigger>
              <TabsTrigger value="similar">Similar Ideas</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="space-y-4 text-sm text-gray-700">
                <div className="flex gap-2 items-center">
                  <Badge variant="secondary">{viewItem?.category}</Badge>
                  <Badge>{formatStatus(viewItem?.status || '')}</Badge>
                  {viewItem?.visibility === 'private' ? <Lock className="w-4 h-4 text-gray-400" /> : <Globe className="w-4 h-4 text-green-500" />}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div><strong>Stage:</strong> {viewItem?.stage || '—'}</div>
                  <div><strong>Submitted:</strong> {formatDate(viewItem?.submittedAt || viewItem?.createdAt)}</div>
                  <div><strong>Updated:</strong> {formatDate(viewItem?.lastUpdated || viewItem?.updatedAt || viewItem?.createdAt)}</div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className={`text-2xl font-bold ${getScoreColor(getScore(viewItem || {}))}`}>{getScore(viewItem || {})}</div>
                    <div className="text-xs text-gray-600">AI Score</div>
                    <Progress value={getScore(viewItem || {})} className="mt-1 h-1" />
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{viewItem?.views || 0}</div>
                    <div className="text-xs text-gray-600">Views</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{getInterestsCount(viewItem || {})}</div>
                    <div className="text-xs text-gray-600">Interests</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-sm font-bold text-green-600">{viewItem?.funding || 'TBD'}</div>
                    <div className="text-xs text-gray-600">Target</div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="swot">
              {viewSwot ? (
                <SwotAnalysis swot={viewSwot} />
              ) : (
                <div className="text-sm text-gray-600">No SWOT available.</div>
              )}
            </TabsContent>

            <TabsContent value="similar">
              {similarLoading ? (
                <div className="text-sm text-gray-600">Loading similar ideas…</div>
              ) : (
                <SimilarIdeas similarIdeas={similarView} />
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewItem(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Submission</DialogTitle>
            <DialogDescription>Update basic details for your startup idea.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input value={editItem?.title || ''} onChange={(e) => setEditItem({ ...editItem, title: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Tagline</label>
              <Input value={editItem?.tagline || ''} onChange={(e) => setEditItem({ ...editItem, tagline: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <Input value={editItem?.category || ''} onChange={(e) => setEditItem({ ...editItem, category: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium">Stage</label>
              <Input value={editItem?.stage || ''} onChange={(e) => setEditItem({ ...editItem, stage: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditItem(null)}>Cancel</Button>
            <Button onClick={async () => {
              try {
                const { ideasApi } = await import('@/lib/api');
                const id = getId(editItem);
                const payload = { title: editItem.title, tagline: editItem.tagline, category: editItem.category, stage: editItem.stage };
                const res = await ideasApi.update(id, payload);
                setSubmissions((prev) => prev.map((s) => getId(s) === id ? { ...s, ...res.idea } : s));
                toast.success('Submission updated');
                setEditItem(null);
              } catch (e) {
                toast.error(e instanceof Error ? e.message : 'Failed to update');
              }
            }}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteItem} onOpenChange={(o) => !o && setDeleteItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Submission</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <p className="text-sm">Are you sure you want to delete "{deleteItem?.title}"?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteItem(null)}>Cancel</Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={async () => {
              try {
                const { ideasApi } = await import('@/lib/api');
                const id = getId(deleteItem);
                await ideasApi.delete(id);
                setSubmissions((prev) => prev.filter((s) => getId(s) !== id));
                toast.success('Submission deleted');
                setDeleteItem(null);
              } catch (e) {
                toast.error(e instanceof Error ? e.message : 'Failed to delete');
              }
            }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
