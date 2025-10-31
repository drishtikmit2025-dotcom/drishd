import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'entrepreneur' | 'investor';
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  twitter?: string;
  
  // Investor specific fields
  company?: string;
  title?: string;
  aum?: string;
  investmentPreferences?: {
    categories: string[];
    stages: string[];
    regions: string[];
    minScore: number;
    maxInvestment: number;
    minInvestment: number;
  };
  
  // Settings
  notificationSettings?: {
    emailNotifications: boolean;
    investorInterests?: boolean;
    messageAlerts?: boolean;
    scoreUpdates?: boolean;
    weeklyDigest: boolean;
    marketingEmails?: boolean;
    newHighScoreIdeas?: boolean;
    entrepreneurResponses?: boolean;
    marketUpdates?: boolean;
    dailyRecommendations?: boolean;
  };
  
  privacySettings?: {
    profileVisibility: boolean;
    showContactInfo?: boolean;
    allowDirectMessages?: boolean;
    showInvestorDirectory?: boolean;
    showInvestmentHistory?: boolean;
    allowDirectContact?: boolean;
    showInDirectory?: boolean;
  };
  
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    required: true,
    enum: ['entrepreneur', 'investor']
  },
  avatar: {
    type: String,
    default: function() {
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${this.email}`;
    }
  },
  bio: String,
  location: String,
  website: String,
  linkedin: String,
  twitter: String,
  
  // Investor specific fields
  company: String,
  title: String,
  aum: String,
  investmentPreferences: {
    categories: [String],
    stages: [String],
    regions: [String],
    minScore: { type: Number, default: 70 },
    maxInvestment: { type: Number, default: 10000000 },
    minInvestment: { type: Number, default: 100000 }
  },
  
  // Settings
  notificationSettings: {
    emailNotifications: { type: Boolean, default: true },
    investorInterests: { type: Boolean, default: true },
    messageAlerts: { type: Boolean, default: true },
    scoreUpdates: { type: Boolean, default: true },
    weeklyDigest: { type: Boolean, default: true },
    marketingEmails: { type: Boolean, default: false },
    newHighScoreIdeas: { type: Boolean, default: true },
    entrepreneurResponses: { type: Boolean, default: true },
    marketUpdates: { type: Boolean, default: true },
    dailyRecommendations: { type: Boolean, default: false }
  },
  
  privacySettings: {
    profileVisibility: { type: Boolean, default: true },
    showContactInfo: { type: Boolean, default: true },
    allowDirectMessages: { type: Boolean, default: true },
    showInvestorDirectory: { type: Boolean, default: true },
    showInvestmentHistory: { type: Boolean, default: false },
    allowDirectContact: { type: Boolean, default: true },
    showInDirectory: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.models.User || mongoose.model<IUser>('User', userSchema);
