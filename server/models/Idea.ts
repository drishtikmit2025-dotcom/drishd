import mongoose, { Document, Schema } from 'mongoose';

export interface IIdea extends Document {
  title: string;
  tagline: string;
  category: string;
  stage: string;
  entrepreneur: mongoose.Types.ObjectId;
  
  // Problem & Solution
  problemStatement: string;
  proposedSolution: string;
  uniqueness: string;
  targetAudience: string;
  
  // Market & Validation
  marketSize: string;
  competitors?: string;
  customerValidation: string;
  
  // Product & Execution
  currentProgress: string;
  businessModel: string;
  teamBackground?: string;
  
  // Supporting Material
  pitchDeckUrl?: string;
  demoUrl?: string;
  
  // Privacy & Status
  visibility: 'public' | 'private';
  status: 'draft' | 'pending' | 'under_review' | 'reviewed' | 'active' | 'featured' | 'archived';
  
  // AI Evaluation
  aiScore: number;
  mlSuggestions: string[];
  scoreHistory: Array<{
    score: number;
    date: Date;
    reason?: string;
  }>;
  
  // Engagement
  views: number;
  interests: Array<{
    investor: mongoose.Types.ObjectId;
    date: Date;
    message?: string;
  }>;
  
  // Analytics
  viewHistory: Array<{
    investor?: mongoose.Types.ObjectId;
    date: Date;
    ipAddress?: string;
  }>;
  
  featured: boolean;
  featuredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ideaSchema = new Schema<IIdea>({
  title: {
    type: String,
    required: true,
    trim: true
  },
  tagline: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['AI/ML', 'EdTech', 'FinTech', 'HealthTech', 'GreenTech', 'IoT', 'SaaS', 'Consumer', 'Gaming', 'E-commerce', 'Blockchain', 'Other']
  },
  stage: {
    type: String,
    required: true,
    enum: ['Idea', 'Prototype', 'Early Customers', 'Growth', 'Scaling']
  },
  entrepreneur: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Problem & Solution
  problemStatement: {
    type: String,
    required: true
  },
  proposedSolution: {
    type: String,
    required: true
  },
  uniqueness: {
    type: String,
    required: true
  },
  targetAudience: {
    type: String,
    required: true,
    enum: ['Individuals', 'SMBs', 'Enterprises', 'Niche Groups']
  },
  
  // Market & Validation
  marketSize: {
    type: String,
    required: true,
    enum: ['Small (< $1B)', 'Medium ($1B - $10B)', 'Large (> $10B)']
  },
  competitors: String,
  customerValidation: {
    type: String,
    required: true
  },
  
  // Product & Execution
  currentProgress: {
    type: String,
    required: true,
    enum: ['idea', 'prototype', 'mvp', 'early-users', 'revenue']
  },
  businessModel: {
    type: String,
    required: true,
    enum: ['Subscription', 'Freemium', 'One-time Purchase', 'Marketplace', 'Advertising', 'Commission', 'Licensing', 'Other']
  },
  teamBackground: String,
  
  // Supporting Material
  pitchDeckUrl: String,
  demoUrl: String,
  
  // Privacy & Status
  visibility: {
    type: String,
    enum: ['public', 'private'],
    default: 'public'
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'under_review', 'reviewed', 'active', 'featured', 'archived'],
    default: 'pending'
  },
  
  // AI Evaluation
  aiScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  mlSuggestions: [String],
  scoreHistory: [{
    score: Number,
    date: { type: Date, default: Date.now },
    reason: String
  }],
  
  // Engagement
  views: {
    type: Number,
    default: 0
  },
  interests: [{
    investor: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    date: { type: Date, default: Date.now },
    message: String
  }],
  
  // Analytics
  viewHistory: [{
    investor: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    date: { type: Date, default: Date.now },
    ipAddress: String
  }],
  
  featured: {
    type: Boolean,
    default: false
  },
  featuredAt: Date
}, {
  timestamps: true
});

// Indexes for performance
ideaSchema.index({ entrepreneur: 1, createdAt: -1 });
ideaSchema.index({ category: 1, aiScore: -1 });
ideaSchema.index({ stage: 1, visibility: 1 });
ideaSchema.index({ aiScore: -1, visibility: 1, status: 1 });
ideaSchema.index({ featured: 1, featuredAt: -1 });

// Virtual for interest count
ideaSchema.virtual('interestCount').get(function() {
  return this.interests.length;
});

// Pre-save middleware to update AI score using external evaluator (OpenAI or local fallback)
ideaSchema.pre('save', async function(next) {
  try {
    if (this.isModified('problemStatement') ||
        this.isModified('proposedSolution') ||
        this.isModified('customerValidation') ||
        this.isModified('uniqueness') ||
        this.isModified('title') ||
        this.isModified('tagline')) {

      // Lazy import to avoid startup cost
      let evaluate: any = null;
      try {
        evaluate = (await import('../services/ideaEvaluator')).evaluateIdeaWithAI;
      } catch (e) {
        console.warn('AI evaluator module not available, falling back to local evaluator', e);
      }

      let evaluation: any = null;
      if (evaluate) {
        try {
          evaluation = await evaluate({
            title: this.title,
            tagline: this.tagline,
            problemStatement: this.problemStatement,
            proposedSolution: this.proposedSolution,
            uniqueness: this.uniqueness,
            customerValidation: this.customerValidation,
            teamBackground: this.teamBackground,
            marketSize: this.marketSize,
            category: this.category,
          });
        } catch (err) {
          console.error('AI evaluation failed:', err);
        }
      }

      // If AI evaluation provided a score, apply it; otherwise fallback to heuristic
      if (evaluation && typeof evaluation.totalScore === 'number') {
        this.aiScore = Math.max(0, Math.min(100, Math.round(evaluation.totalScore)));
        this.mlSuggestions = Array.isArray(evaluation.suggestions) ? evaluation.suggestions : (evaluation.suggestions ? [String(evaluation.suggestions)] : []);
        this.scoreHistory.push({ score: this.aiScore, date: new Date(), reason: 'AI evaluation' });
      } else {
        // Fallback heuristic
        let score = 0;
        const fields = [this.title, this.tagline, this.problemStatement, this.proposedSolution, this.uniqueness, this.customerValidation];
        const completedFields = fields.filter(field => field && field.length > 10).length;
        score += (completedFields / fields.length) * 40;
        if (this.problemStatement && this.problemStatement.length > 100) score += 10;
        if (this.proposedSolution && this.proposedSolution.length > 100) score += 10;
        if (this.customerValidation && this.customerValidation.length > 50) score += 15;
        if (this.demoUrl) score += 10;
        if (this.pitchDeckUrl) score += 5;
        if (this.teamBackground && this.teamBackground.length > 50) score += 10;
        this.aiScore = Math.min(Math.round(score), 100);
        this.mlSuggestions = this.mlSuggestions || [];
        this.scoreHistory.push({ score: this.aiScore, date: new Date(), reason: 'Heuristic evaluation' });
      }
    }
  } catch (err) {
    console.error('Idea pre-save evaluation error:', err);
  }

  next();
});

export default mongoose.models.Idea || mongoose.model<IIdea>('Idea', ideaSchema);
