import mongoose, { Document, Schema } from 'mongoose';

export interface IConversation extends Document {
  idea: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[]; // [entrepreneurId, investorId]
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>({
  idea: { type: Schema.Types.ObjectId, ref: 'Idea', required: false },
  participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
  lastMessageAt: { type: Date, default: Date.now }
}, { timestamps: true });

conversationSchema.index({ idea: 1, participants: 1 });
conversationSchema.index({ participants: 1, updatedAt: -1 });

export default mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', conversationSchema);
