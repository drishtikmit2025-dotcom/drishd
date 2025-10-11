import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  type: 'interest' | 'message' | 'connection' | 'score_update' | 'review' | 'feature' | 'new_idea' | 'response' | 'trending' | 'weekly_digest' | 'market_update';
  title: string;
  message: string;
  
  // Related entities
  idea?: mongoose.Types.ObjectId;
  relatedUser?: mongoose.Types.ObjectId; // entrepreneur or investor
  
  // Type-specific data
  data?: {
    // For score updates
    oldScore?: number;
    newScore?: number;
    
    // For interest notifications
    investorName?: string;
    investorRole?: string;
    
    // For weekly digest
    stats?: {
      newIdeas?: number;
      responses?: number;
      connections?: number;
    };
    
    // For market updates
    trend?: string;
    category?: string;
  };
  
  read: boolean;
  readAt?: Date;
  actionRequired: boolean;
  actionTaken?: boolean;
  actionTakenAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>({
  recipient: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['interest', 'message', 'connection', 'score_update', 'review', 'feature', 'new_idea', 'response', 'trending', 'weekly_digest', 'market_update']
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  
  // Related entities
  idea: {
    type: Schema.Types.ObjectId,
    ref: 'Idea'
  },
  relatedUser: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Type-specific data
  data: {
    oldScore: Number,
    newScore: Number,
    investorName: String,
    investorRole: String,
    stats: {
      newIdeas: Number,
      responses: Number,
      connections: Number
    },
    trend: String,
    category: String
  },
  
  read: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  actionRequired: {
    type: Boolean,
    default: false
  },
  actionTaken: {
    type: Boolean,
    default: false
  },
  actionTakenAt: Date
}, {
  timestamps: true
});

// Indexes for performance
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, read: 1 });
notificationSchema.index({ recipient: 1, type: 1 });

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', notificationSchema);
