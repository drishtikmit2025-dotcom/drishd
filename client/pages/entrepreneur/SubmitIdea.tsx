import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  ChevronLeft, 
  ChevronRight, 
  Upload, 
  Brain, 
  Target, 
  TrendingUp,
  Users,
  Lightbulb,
  FileText,
  Globe,
  DollarSign,
  Shield,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from "lucide-react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import SimilarIdeas from "@/components/SimilarIdeas";
import SwotAnalysis from "@/components/SwotAnalysis";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { findSimilarIdeas, SimilarityScore } from "@/lib/similarityAnalysis";
import { generateSWOT, SWOTAnalysis } from "@/lib/pitch";
import { evaluateIdea, validateIdeaInput, EvaluationResult } from "@/lib/evaluator";

const containerVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6
    }
  }
};

interface FormData {
  // Basic Information
  title: string;
  tagline: string;
  category: string;
  stage: string;
  
  // Problem & Solution
  problemStatement: string;
  proposedSolution: string;
  uniqueness: string;
  targetAudience: string;
  
  // Market & Validation
  marketSize: string;
  competitors: string;
  customerValidation: string;
  
  // Product & Execution
  currentProgress: string;
  businessModel: string;
  teamBackground: string;
  
  // Supporting Material
  pitchDeckFile: File | null;
  demoUrl: string;
  
  // Privacy
  visibility: string;
}

const initialFormData: FormData = {
  title: "",
  tagline: "",
  category: "",
  stage: "",
  problemStatement: "",
  proposedSolution: "",
  uniqueness: "",
  targetAudience: "",
  marketSize: "",
  competitors: "",
  customerValidation: "",
  currentProgress: "",
  businessModel: "",
  teamBackground: "",
  pitchDeckFile: null,
  demoUrl: "",
  visibility: "public"
};

const sections = [
  { id: 1, title: "Basic Information", icon: Lightbulb },
  { id: 2, title: "Problem & Solution", icon: Target },
  { id: 3, title: "Market & Validation", icon: TrendingUp },
  { id: 4, title: "Product & Execution", icon: Users },
  { id: 5, title: "Supporting Material", icon: FileText },
  { id: 6, title: "Privacy & Submit", icon: Shield }
];

const categories = [
  "FinTech", "EdTech", "HealthTech", "AI/ML", "SaaS", "Consumer", 
  "GreenTech", "E-commerce", "Gaming", "IoT", "Blockchain", "Other"
];

const stages = ["Idea", "Prototype", "Early Customers", "Growth", "Scaling"];
const marketSizes = ["Small (< $1B)", "Medium ($1B - $10B)", "Large (> $10B)"];
const targetAudiences = ["Individuals", "SMBs", "Enterprises", "Niche Groups"];
const businessModels = [
  "Subscription", "Freemium", "One-time Purchase", "Marketplace", 
  "Advertising", "Commission", "Licensing", "Other"
];

import { useNavigate } from 'react-router-dom';

export default function SubmitIdea() {
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mlScore, setMlScore] = useState(0);
  const [mlSuggestions, setMlSuggestions] = useState<string[]>([]);
  const [showSimilarIdeas, setShowSimilarIdeas] = useState(false);
  const [similarIdeas, setSimilarIdeas] = useState<SimilarityScore[]>([]);
  const [submittedIdea, setSubmittedIdea] = useState<any>(null);
  const [swot, setSwot] = useState<SWOTAnalysis | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);

  const progress = (currentSection / sections.length) * 100;

  // Simulate ML scoring
  const simulateMLEvaluation = () => {
    const completedFields = Object.values(formData).filter(value => 
      value !== "" && value !== null
    ).length;
    const totalFields = Object.keys(formData).length;
    const completionScore = (completedFields / totalFields) * 100;
    
    // Base score calculation
    let score = Math.min(completionScore * 0.6, 60);
    
    // Bonus points for quality indicators
    if (formData.title.length > 5) score += 5;
    if (formData.problemStatement.length > 50) score += 10;
    if (formData.proposedSolution.length > 50) score += 10;
    if (formData.customerValidation.length > 20) score += 10;
    if (formData.demoUrl) score += 5;
    
    setMlScore(Math.min(Math.round(score), 100));
    
    // Generate suggestions
    const suggestions = [];
    if (formData.title.length < 5) suggestions.push("Add a more descriptive title");
    if (formData.problemStatement.length < 50) suggestions.push("Expand on the problem statement");
    if (!formData.customerValidation) suggestions.push("Include customer validation data");
    if (!formData.demoUrl) suggestions.push("Add a demo link if available");
    
    setMlSuggestions(suggestions);
  };

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Trigger ML evaluation after a short delay
    setTimeout(simulateMLEvaluation, 500);
  };

  const nextSection = () => {
    if (currentSection < sections.length) {
      setCurrentSection(currentSection + 1);
    }
  };

  const prevSection = () => {
    if (currentSection > 1) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleSimilarityReviewComplete = () => {
    setShowSimilarIdeas(false);
    setSimilarIdeas([]);
    setSubmittedIdea(null);
    setSwot(null);
    setEvaluation(null);
    setFormData(initialFormData);
    setCurrentSection(1);
    toast.success("Ready for your next idea submission!");
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Validate required fields + robust content validation
      const missing = !formData.title || !formData.tagline || !formData.category || !formData.stage;
      const issues = validateIdeaInput({
        title: formData.title,
        tagline: formData.tagline,
        problemStatement: formData.problemStatement,
        proposedSolution: formData.proposedSolution,
        uniqueness: formData.uniqueness,
      });
      if (missing || issues.length > 0) {
        toast.error(issues[0] || 'Please fill in all required fields with proper information.');
        // Jump to relevant section heuristically
        if (!formData.title || !formData.tagline) setCurrentSection(1);
        else if (!formData.problemStatement || !formData.proposedSolution) setCurrentSection(2);
        setIsSubmitting(false);
        return;
      }

      // Import API utility
      const { ideasApi } = await import('@/lib/api');

      // Prepare data for submission
      const ideaData = {
        title: formData.title,
        tagline: formData.tagline,
        category: formData.category,
        stage: formData.stage,
        problemStatement: formData.problemStatement,
        proposedSolution: formData.proposedSolution,
        uniqueness: formData.uniqueness,
        targetAudience: formData.targetAudience,
        marketSize: formData.marketSize,
        competitors: formData.competitors,
        customerValidation: formData.customerValidation,
        currentProgress: formData.currentProgress,
        businessModel: formData.businessModel,
        teamBackground: formData.teamBackground,
        demoUrl: formData.demoUrl,
        visibility: formData.visibility,
        status: 'pending'
      };

      // Submit to API
      const response = await ideasApi.create(ideaData);

      toast.success("Idea submitted successfully! Analyzing similar ideas...");

      // Redirect to results page to show evaluation, charts, SWOT and similar ideas
      let submitted = response.idea || ideaData;
      // Ensure the idea has an id usable client-side
      const ensureId = (s: any) => {
        if (!s) return s;
        if (!s._id && !s.id) {
          s.id = `local-${Date.now()}`;
        }
        return s;
      };
      submitted = ensureId(submitted);

      // Store in localStorage as offline fallback
      try {
        const key = 'local_ideas';
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        // Avoid duplicates by id
        const exists = existing.some((it: any) => (it._id || it.id) === (submitted._id || submitted.id));
        if (!exists) {
          existing.push(submitted);
          localStorage.setItem(key, JSON.stringify(existing));
        }
      } catch (e) {
        console.warn('Failed to write local idea', e);
      }

      // Navigate to result page
      try {
        // Prefer client-side navigation (works when app is served as SPA) and pass idea in state so result page can render without refetch
        navigate(`/entrepreneur/idea/${(submitted._id || submitted.id)}/result`, { state: { idea: submitted } });
        return;
      } catch (err) {
        // fallback: show modal if navigation fails
        const allIdeasResponse = await ideasApi.getAll({});
        const allIdeas = allIdeasResponse.ideas || [];
        const similarities = findSimilarIdeas(submitted, allIdeas, 6);
        setSimilarIdeas(similarities);
        const swotResult = generateSWOT(submitted);
        setSwot(swotResult);
        const evalResult = evaluateIdea(submitted);
        setEvaluation(evalResult);
        setShowSimilarIdeas(true);
      }

    } catch (error) {
      console.error('Idea submission error:', error);
      toast.error(error instanceof Error ? error.message : "Failed to submit idea. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSection = () => {
    switch (currentSection) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Idea Title *</Label>
              <Input
                id="title"
                placeholder="Enter your startup idea title"
                value={formData.title}
                onChange={(e) => updateFormData('title', e.target.value)}
                className="text-lg"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline / One-liner Pitch *</Label>
              <Input
                id="tagline"
                placeholder="Describe your idea in one compelling sentence"
                value={formData.tagline}
                onChange={(e) => updateFormData('tagline', e.target.value)}
              />
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select value={formData.category} onValueChange={(value) => updateFormData('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Current Stage *</Label>
                <Select value={formData.stage} onValueChange={(value) => updateFormData('stage', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {stages.map(stage => (
                      <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="problem">Problem Statement *</Label>
              <Textarea
                id="problem"
                placeholder="What problem are you solving? Who faces this problem? Why is it important?"
                value={formData.problemStatement}
                onChange={(e) => updateFormData('problemStatement', e.target.value)}
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="solution">Proposed Solution *</Label>
              <Textarea
                id="solution"
                placeholder="How does your product/service solve the problem? What's your approach?"
                value={formData.proposedSolution}
                onChange={(e) => updateFormData('proposedSolution', e.target.value)}
                rows={4}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="uniqueness">Uniqueness / Differentiator *</Label>
              <Textarea
                id="uniqueness"
                placeholder="What makes your solution stand out from existing alternatives?"
                value={formData.uniqueness}
                onChange={(e) => updateFormData('uniqueness', e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Target Audience *</Label>
              <Select value={formData.targetAudience} onValueChange={(value) => updateFormData('targetAudience', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select target audience" />
                </SelectTrigger>
                <SelectContent>
                  {targetAudiences.map(audience => (
                    <SelectItem key={audience} value={audience}>{audience}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Market Size *</Label>
              <Select value={formData.marketSize} onValueChange={(value) => updateFormData('marketSize', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select market size" />
                </SelectTrigger>
                <SelectContent>
                  {marketSizes.map(size => (
                    <SelectItem key={size} value={size}>{size}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="competitors">Existing Alternatives / Competitors</Label>
              <Textarea
                id="competitors"
                placeholder="Who are your main competitors? How do existing solutions fall short?"
                value={formData.competitors}
                onChange={(e) => updateFormData('competitors', e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="validation">Customer Validation *</Label>
              <Textarea
                id="validation"
                placeholder="Have you spoken to potential customers? What feedback did you receive? Any early traction?"
                value={formData.customerValidation}
                onChange={(e) => updateFormData('customerValidation', e.target.value)}
                rows={4}
              />
            </div>
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Current Progress *</Label>
              <Select value={formData.currentProgress} onValueChange={(value) => updateFormData('currentProgress', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select current progress" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="idea">Just an Idea</SelectItem>
                  <SelectItem value="prototype">Working Prototype</SelectItem>
                  <SelectItem value="mvp">MVP Ready</SelectItem>
                  <SelectItem value="early-users">Early Users</SelectItem>
                  <SelectItem value="revenue">Generating Revenue</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Business Model *</Label>
              <Select value={formData.businessModel} onValueChange={(value) => updateFormData('businessModel', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select business model" />
                </SelectTrigger>
                <SelectContent>
                  {businessModels.map(model => (
                    <SelectItem key={model} value={model}>{model}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="team">Team Background (Optional)</Label>
              <Textarea
                id="team"
                placeholder="Tell us about your team's background and relevant experience"
                value={formData.teamBackground}
                onChange={(e) => updateFormData('teamBackground', e.target.value)}
                rows={3}
              />
            </div>
          </div>
        );
        
      case 5:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="pitch-deck">Upload Pitch Deck (Optional)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">Upload PDF or PowerPoint presentation</p>
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="demo">Demo/Prototype Link (Optional)</Label>
              <Input
                id="demo"
                placeholder="https://your-demo-link.com"
                value={formData.demoUrl}
                onChange={(e) => updateFormData('demoUrl', e.target.value)}
              />
            </div>
          </div>
        );
        
      case 6:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label>Submission Visibility</Label>
              <RadioGroup 
                value={formData.visibility} 
                onValueChange={(value) => updateFormData('visibility', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="public" id="public" />
                  <Label htmlFor="public" className="flex-1">
                    <div className="font-medium">Public</div>
                    <div className="text-sm text-gray-600">Investors can discover and evaluate your idea</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="private" id="private" />
                  <Label htmlFor="private" className="flex-1">
                    <div className="font-medium">Private</div>
                    <div className="text-sm text-gray-600">Personal archive + ML evaluation only</div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            <Separator />
            
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ready to Submit!</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p>✓ Your idea will be processed by our AI evaluation system</p>
                <p>✓ You'll receive a comprehensive score and feedback</p>
                <p>✓ Matching investors will be notified (if public)</p>
                <p>✓ You can edit or update your submission anytime</p>
              </div>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-3">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {/* Progress Header */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-3xl font-bold text-gray-900">Submit Your Idea</h1>
                  <Badge variant="outline" className="text-sm">
                    Step {currentSection} of {sections.length}
                  </Badge>
                </div>
                <Progress value={progress} className="h-2" />
                <div className="flex justify-between mt-2 text-xs text-gray-600">
                  {sections.map((section) => (
                    <span key={section.id} className={currentSection >= section.id ? 'text-brand-600 font-medium' : ''}>
                      {section.title}
                    </span>
                  ))}
                </div>
              </div>

              {/* Form Content */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    {(() => {
                      const IconComponent = sections[currentSection - 1].icon;
                      return <IconComponent className="w-6 h-6 text-brand-600" />;
                    })()}
                    {sections[currentSection - 1].title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {renderSection()}
                  
                  {/* Navigation Buttons */}
                  <div className="flex justify-between mt-8 pt-6 border-t">
                    <Button
                      variant="outline"
                      onClick={prevSection}
                      disabled={currentSection === 1}
                    >
                      <ChevronLeft className="w-4 h-4 mr-2" />
                      Previous
                    </Button>
                    
                    {currentSection === sections.length ? (
                      <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Submit Idea
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button onClick={nextSection}>
                        Next
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* ML Validation Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* ML Score */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Brain className="w-5 h-5 text-purple-600" />
                    AI Evaluation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <div className="text-4xl font-bold text-brand-600 mb-2">{mlScore}</div>
                    <div className="text-sm text-gray-600">Current Score</div>
                    <Progress value={mlScore} className="mt-2" />
                  </div>
                  
                  {mlSuggestions.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-900">Suggestions:</h4>
                      {mlSuggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                          <span className="text-xs text-gray-600">{suggestion}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Sparkles className="w-5 h-5 text-yellow-600" />
                    Pro Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-xs text-gray-600 space-y-2">
                    <p>• Be specific about the problem you're solving</p>
                    <p>• Include real customer feedback if available</p>
                    <p>• Quantify your market opportunity</p>
                    <p>• Show your unique competitive advantage</p>
                    <p>• Upload supporting materials for better evaluation</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showSimilarIdeas} onOpenChange={setShowSimilarIdeas}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Review Similar Ideas & AI SWOT</DialogTitle>
            <DialogDescription>
              We analyzed your submission to surface similar ideas and an auto-generated SWOT analysis to help sharpen your pitch.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="evaluation">
            <TabsList>
              <TabsTrigger value="evaluation">Evaluation</TabsTrigger>
              <TabsTrigger value="similar">Similar Ideas</TabsTrigger>
              <TabsTrigger value="swot">SWOT Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="evaluation">
              {evaluation ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold text-brand-600">{evaluation.score}/100</div>
                    <div className="w-40">
                      <Progress value={evaluation.score} />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    {Object.entries(evaluation.breakdown).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between bg-muted/30 rounded px-3 py-2">
                        <span className="capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="font-medium">{Math.round((v as number) * 100)}</span>
                      </div>
                    ))}
                  </div>
                  {evaluation.warnings.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-yellow-800 text-sm">
                      <ul className="list-disc pl-5 space-y-1">
                        {evaluation.warnings.map((w, i) => <li key={i}>{w}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-gray-600">No evaluation available.</div>
              )}
            </TabsContent>

            <TabsContent value="similar">
              <SimilarIdeas
                similarIdeas={similarIdeas}
              />
            </TabsContent>

            <TabsContent value="swot">
              {swot && (
                <SwotAnalysis swot={swot} />
              )}
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowSimilarIdeas(false)}>Close</Button>
            <Button onClick={handleSimilarityReviewComplete}>
              Submit another idea
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
